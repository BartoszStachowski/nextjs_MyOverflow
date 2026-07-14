"use server";

import mongoose from "mongoose";

import {
  askQuestionSchema,
  editQuestionSchema,
  getQuestionSchema,
} from "@/app/schemas/question";
import { z } from "zod";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";

// models
import Question from "@/database/question.model";
import Tag, { ITagDoc } from "@/database/tag.model";
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

export const editQuestion = async (
  params: z.infer<typeof editQuestionSchema>
): Promise<ActionResponse<Question>> => {
  const validationResult = await action({
    params,
    schema: editQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags, questionId } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch the question and populate its tags to compare with the new tags
    const question = await Question.findById(questionId).populate<{
      tags: ITagDoc;
    }>("tags");

    if (!question) {
      throw new Error("Question not found");
    }

    if (question.author.toString() !== userId) {
      throw new Error("Unauthorized");
    }

    // Update the question's title and content if they have changed
    if (question.title !== title || question.content !== content) {
      question.title = title;
      question.content = content;
      await question.save({ session });
    }

    // Identify tags that are new and need to be added
    const tagsToAdd = tags.filter(
      (tag) =>
        !question.tags.some(
          (t: ITagDoc) => t.name.toLowerCase() === tag.toLowerCase()
        )
    );

    // Identify tags that have been removed and need to be cleaned up
    const tagsToRemove = question.tags.filter(
      (tag: ITagDoc) =>
        !tags.some((t) => t.toLowerCase() === tag.name.toLowerCase())
    );

    const newTagDocuments = [];

    // Process new tags: upsert them and update their question count
    if (tagsToAdd.length > 0) {
      for (const tag of tagsToAdd) {
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${tag}$`, "i") } },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { upsert: true, new: true, session }
        );

        // relationship between question and tag
        if (existingTag) {
          newTagDocuments.push({
            tag: existingTag._id,
            question: questionId,
          });

          question.tags.push(existingTag._id);
        }
      }
    }

    // Process removed tags: decrement their question count and remove associations
    if (tagsToRemove.length > 0) {
      const tagIdsToRemove = tagsToRemove.map((tag: ITagDoc) => tag._id);

      // Decrement the question count for each removed tag
      await Tag.updateMany(
        { _id: { $in: tagIdsToRemove } },
        { $inc: { questions: -1 } },
        { session }
      );

      // Remove the associations between the question and the removed tags
      await TagQuestion.deleteMany(
        { tag: { $in: tagIdsToRemove }, question: questionId },
        { session }
      );

      // Filter out the removed tags from the question's tag list
      question.tags = question.tags.filter(
        (tag: ITagDoc) =>
          !tagIdsToRemove.some((id: mongoose.Types.ObjectId) =>
            id.equals(tag._id)
          )
      );
    }

    // Insert new question-tag associations
    if (newTagDocuments.length > 0) {
      await TagQuestion.insertMany(newTagDocuments, { session });
    }

    // Save the updated question and commit the transaction
    await question.save({ session });
    await session.commitTransaction();

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

export const getQuestion = async (
  params: z.infer<typeof getQuestionSchema>
): Promise<ActionResponse<Question>> => {
  // Validate the input parameters against the askQuestionSchema and check for user authorization
  const validationResult = await action({
    params,
    schema: getQuestionSchema,
  });

  // If validation fails, return a formatted error response
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  // Extract the validated data and user ID from the validation result
  const { questionId } = validationResult.params!;

  try {
    const question = await Question.findById(questionId).populate("tags");

    if (!question) {
      throw new Error("Question not found");
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(question)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
