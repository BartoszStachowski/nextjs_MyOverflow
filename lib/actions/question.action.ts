"use server";

import mongoose, { QueryFilter } from "mongoose";

import {
  askQuestionSchema,
  editQuestionSchema,
  getQuestionSchema,
  incrementViewsSchema,
} from "@/app/schemas/question";
import { z } from "zod";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";

// models
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import TagQuestion from "@/database/tag-question.model";
import { paginatedSearchParamsSchema } from "@/app/schemas/general";

export const createQuestion = async (
  params: z.infer<typeof askQuestionSchema>
): Promise<ActionResponse<QuestionResponse>> => {
  const validationResult = await action({
    params,
    schema: askQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  if (!userId) {
    return handleError(new Error("Unauthorized")) as ErrorResponse;
  }

  const normalizedTags = [
    ...new Map(
      tags.map((tag) => [tag.trim().toLowerCase(), tag.trim()])
    ).values(),
  ];

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = new Question({
      title,
      content,
      author: userId,
    });

    await question.save({ session });

    const tagIds: mongoose.Types.ObjectId[] = [];

    const tagQuestionDocuments: {
      tag: mongoose.Types.ObjectId;
      question: mongoose.Types.ObjectId;
    }[] = [];

    // Find or create tags and increment their question count
    for (const tag of normalizedTags) {
      const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const existingTag = await Tag.findOneAndUpdate(
        {
          name: {
            $regex: new RegExp(`^${escapedTag}$`, "i"),
          },
        },
        {
          $setOnInsert: { name: tag },
          $inc: { questions: 1 },
        },
        {
          upsert: true,
          returnDocument: "after",
          session,
        }
      );

      if (!existingTag) {
        throw new Error(`Failed to create or update tag: ${tag}`);
      }

      tagIds.push(existingTag._id);

      tagQuestionDocuments.push({
        tag: existingTag._id,
        question: question._id,
      });
    }

    // Create question-tag relations
    if (tagQuestionDocuments.length > 0) {
      await TagQuestion.insertMany(tagQuestionDocuments, {
        session,
      });
    }

    // Add tags directly to the question document
    question.tags = tagIds;

    await question.save({ session });

    await session.commitTransaction();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(question)),
    };
  } catch (error) {
    await session.abortTransaction();

    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
};

export const editQuestion = async (
  params: z.infer<typeof editQuestionSchema>
): Promise<ActionResponse<QuestionResponse>> => {
  const validationResult = await action({
    params,
    schema: editQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags, questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  if (!userId) {
    return handleError(new Error("Unauthorized")) as ErrorResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId).session(session);

    if (!question) {
      throw new Error("Question not found");
    }

    if (question.author.toString() !== userId) {
      throw new Error("Unauthorized");
    }

    // 1. trim and lowercase all tags
    // 2. create a set of unique tags by removing duplicates
    // 3. values - get the array of unique tags
    // return ['value_1', 'value_2' ....]
    const normalizedTags = [
      ...new Map(
        tags.map((tag) => [tag.trim().toLowerCase(), tag.trim()])
      ).values(),
    ];

    // find all tags by id in question
    // [ObjectId('1')] => [{_id: 'ObjectId("1")', name: 'tag_1'}] '}]
    const currentTags = await Tag.find({
      _id: { $in: question.tags },
    }).session(session);

    // set allow using currentTagNames.has('react')
    // return Set { "react", "javascript" }
    const currentTagNames = new Set(
      currentTags.map((tag) => tag.name.toLowerCase())
    );

    const incomingTagNames = new Set(
      normalizedTags.map((tag) => tag.toLowerCase())
    );

    const tagsToAdd = normalizedTags.filter(
      (tag) => !currentTagNames.has(tag.toLowerCase())
    );

    const tagsToRemove = currentTags.filter(
      (tag) => !incomingTagNames.has(tag.name.toLowerCase())
    );

    const newTagDocuments: {
      tag: mongoose.Types.ObjectId;
      question: mongoose.Types.ObjectId;
    }[] = [];

    // Process new tags: upsert them and update their question count
    for (const tag of tagsToAdd) {
      const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${escapedTag}$`, "i") } },
        { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
        { upsert: true, returnDocument: "after", session }
      );

      if (!existingTag) {
        throw new Error(`Failed to create or update tag: ${tag}`);
      }

      question.tags.push(existingTag._id);

      newTagDocuments.push({
        tag: existingTag._id,
        question: question._id,
      });
    }

    // Process removed tags: decrement their question count and remove associations
    if (tagsToRemove.length > 0) {
      const tagIdsToRemove = tagsToRemove.map((tag) => tag._id);

      // Decrement the question count for each removed tag
      await Tag.updateMany(
        { _id: { $in: tagIdsToRemove } },
        { $inc: { questions: -1 } },
        { session }
      );

      // Remove the associations between the question and the removed tags
      await TagQuestion.deleteMany(
        { tag: { $in: tagIdsToRemove }, question: question._id },
        { session }
      );

      // Filter out the removed tags from the question's tag list
      // equals because we compare objects
      question.tags = question.tags.filter(
        (tagId) => !tagIdsToRemove.some((id) => id.equals(tagId))
      );
    }

    // Create new question-tag relations
    if (newTagDocuments.length > 0) {
      await TagQuestion.insertMany(newTagDocuments, {
        session,
      });
    }

    // Update question
    question.title = title;
    question.content = content;

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
): Promise<ActionResponse<GetQuestionResponse>> => {
  const validationResult = await action({
    params,
    schema: getQuestionSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;

  try {
    const question = await Question.findById(questionId)
      .populate("tags", "_id name")
      .populate("author", "_id name image")
      .lean();

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

export const getQuestions = async (
  params: z.infer<typeof paginatedSearchParamsSchema>
): Promise<
  ActionResponse<{ questions: GetQuestionResponse[]; isNext: boolean }>
> => {
  const validationResult = await action({
    params,
    schema: paginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = validationResult.params!;
  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const filterQuery: QueryFilter<typeof Question> = {};

  // TODO: Add recommended
  if (filter === "recommended") {
    return { success: true, data: { questions: [], isNext: false } };
  }

  if (query) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filterQuery.$or = [
      {
        title: {
          $regex: new RegExp(escapedQuery, "i"),
        },
      },
      {
        content: {
          $regex: new RegExp(escapedQuery, "i"),
        },
      },
    ];
  }

  let sortCriteria: Record<string, 1 | -1> = {
    createdAt: -1,
  };

  switch (filter) {
    case "unanswered":
      filterQuery.answers = 0;
      sortCriteria = { createdAt: -1 };
      break;

    case "popular":
      sortCriteria = { upvotes: -1 };
      break;
  }

  try {
    const [totalQuestions, questions] = await Promise.all([
      Question.countDocuments(filterQuery),

      Question.find(filterQuery)
        .populate("tags", "_id name")
        .populate("author", "_id name image")
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: { questions: JSON.parse(JSON.stringify(questions)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const incrementViews = async (
  params: z.infer<typeof incrementViewsSchema>
): Promise<ActionResponse<{ views: number }>> => {
  const validationResult = await action({
    params,
    schema: incrementViewsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;

  try {
    const question = await Question.findByIdAndUpdate(
      questionId,
      {
        $inc: { views: 1 },
      },
      {
        returnDocument: "after",
      }
    ).select("views");

    if (!question) {
      throw new Error("Question not found");
    }

    return {
      success: true,
      data: {
        views: question.views,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
