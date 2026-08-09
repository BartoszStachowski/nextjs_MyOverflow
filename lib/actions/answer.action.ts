"use server";
import { z } from "zod";
import mongoose from "mongoose";

import { IAnswerDoc } from "@/database/answer.model";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { Answer, Question } from "@/database";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";
import { answerServerSchema, getAnswersSchema } from "@/app/schemas/answer";

export const createAnswer = async (
  params: z.infer<typeof answerServerSchema>
): Promise<ActionResponse<AnswerResponse>> => {
  const validationResult = await action({
    params,
    schema: answerServerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { content, questionId } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  if (!userId) {
    return handleError(new Error("Unauthorized")) as ErrorResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // const question = await Question.findById(questionId);
    const questionUpdate = await Question.updateOne(
      { _id: questionId },
      { $inc: { answers: 1 } },
      { session }
    );

    if (questionUpdate.matchedCount === 0) {
      throw new Error("Question not found");
    }

    const newAnswer = new Answer({
      content,
      author: userId,
      question: questionId,
    });

    await newAnswer.save({ session });

    await session.commitTransaction();

    revalidatePath(ROUTES.QUESTION(questionId));

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newAnswer)),
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
};

export const getAnswers = async (
  params: z.infer<typeof getAnswersSchema>
): Promise<ActionResponse<GetAnswersResponse>> => {
  const validationResult = await action({
    params,
    schema: getAnswersSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    questionId,
    page = 1,
    pageSize = 10,
    filter,
  } = validationResult.params!;

  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const filterQuery = {
    question: questionId,
  };

  let sortCriteria: Record<string, 1 | -1> = {
    createdAt: -1,
  };

  switch (filter) {
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "popular":
      sortCriteria = { upvotes: -1, createdAt: -1 };
      break;
  }
  try {
    const [totalAnswers, answers] = await Promise.all([
      Answer.countDocuments(filterQuery),

      Answer.find(filterQuery)
        .populate("author", "_id name image")
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const isNext = totalAnswers > skip + answers.length;

    return {
      success: true,
      data: {
        answers: JSON.parse(JSON.stringify(answers)),
        isNext,
        totalAnswers,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
