"use server";

import mongoose from "mongoose";

import { askQuestionSchema } from "@/app/schemas/question";
import { z } from "zod";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";

// models
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import TagQuestion from "@/database/tag-question.model";

export const createQuestion = async (
  params: z.infer<typeof askQuestionSchema>
): Promise<ActionResponse<Question>> => {
  // Validate the input parameters against the askQuestionSchema and check for user authorization
  const validationResult = await action({
    params,
    schema: askQuestionSchema,
    authorize: true,
  });

  // If validation fails, return a formatted error response
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  // Extract the validated data and user ID from the validation result
  const { title, content, tags } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  // Start a MongoDB session and transaction to ensure atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create the question record with title, content, and author
    const [question] = await Question.create(
      [{ title, content, author: userId }],
      { session }
    );

    // If question creation fails, throw an error to trigger transaction rollback
    if (!question) {
      throw new Error("Failed to create question");
    }

    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagQuestionDocuments = [];

    // Iterate through provided tags to find or create them
    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        // Search for tag by name (case-insensitive)
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        // Set tag name if inserting, and increment the question count for the tag
        // $setOnInsert - executes the update only if the document is new
        { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
        // Upsert: true creates the tag if it doesn't exist; new: true returns the updated document
        { upsert: true, new: true, session }
      );

      tagIds.push(existingTag._id);
      // Prepare the documents for the TagQuestion junction model
      tagQuestionDocuments.push({
        tag: existingTag._id,
        question: question._id,
      });
    }

    // Bulk insert the relationship records between the question and its tags
    await TagQuestion.insertMany(tagQuestionDocuments, { session });

    // Update the question document to include the IDs of the associated tags
    // {title: xxx, tags: []} => { title: 'xxx', tags: [tag1Id, tag2Id] }
    await Question.findByIdAndUpdate(
      question._id,
      {
        $push: { tags: { $each: tagIds } },
      },
      { session }
    );

    // Commit all changes performed within the transaction
    await session.commitTransaction();

    // Return a success response with the newly created question data
    return {
      success: true,
      data: JSON.parse(JSON.stringify(question)),
    };
  } catch (error) {
    // Rollback all changes if any error occurs during the transaction
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    // End the session regardless of the outcome
    await session.endSession();
  }
};
