"use server";

import { z } from "zod";
import {
  createVoteSchema,
  hasVotedSchema,
  updateVoteCountSchema,
} from "@/app/schemas/vote";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import mongoose, { ClientSession } from "mongoose";
import { Answer, Question, Vote } from "@/database";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";

export const updateVoteCount = async (
  params: z.infer<typeof updateVoteCountSchema>,
  session?: ClientSession
): Promise<ActionResponse> => {
  const validationResult = await action({
    params,
    schema: updateVoteCountSchema,
    // authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType, change } = validationResult.params!;

  const Model = targetType === "question" ? Question : Answer;
  const voteField = voteType === "upvote" ? "upvotes" : "downvotes";
  try {
    // const result = await Model.findByIdAndUpdate(
    //   targetId,
    //   {
    //     $inc: { [voteField]: change },
    //   },
    //   { returnDocument: "after", session }
    // );

    const result =
      targetType === "question"
        ? await Question.findByIdAndUpdate(
            targetId,
            {
              $inc: { [voteField]: change },
            },
            { returnDocument: "after", session }
          )
        : await Answer.findByIdAndUpdate(
            targetId,
            {
              $inc: { [voteField]: change },
            },
            { returnDocument: "after", session }
          );

    if (!result) {
      return handleError(
        new Error("Failed to update vote count")
      ) as ErrorResponse;
    }

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const createVote = async (
  params: z.infer<typeof createVoteSchema>
): Promise<ActionResponse> => {
  const validationResult = await action({
    params,
    schema: createVoteSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  if (!userId) {
    return handleError(new Error("Unauthorized")) as ErrorResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingVote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    }).session(session);

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await Vote.deleteOne({ _id: existingVote._id }).session(session);
        await updateVoteCount(
          { targetId, targetType, voteType, change: -1 },
          session
        );
      } else {
        await Vote.findByIdAndUpdate(
          existingVote._id,
          { voteType },
          { returnDocument: "after", session }
        );

        await updateVoteCount(
          { targetId, targetType, voteType, change: 1 },
          session
        );
      }
    } else {
      // if the user has not voted yet
      await Vote.create(
        [
          {
            author: userId,
            actionId: targetId,
            actionType: targetType,
            voteType,
          },
        ],
        { session }
      );
    }
    await updateVoteCount(
      { targetId, targetType, voteType, change: 1 },
      session
    );

    await session.commitTransaction();

    revalidatePath(ROUTES.QUESTION(targetId));

    return {
      success: true,
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
};

export const hasVoted = async (
  params: z.infer<typeof hasVotedSchema>
): Promise<ActionResponse<HasVotedResponse>> => {
  const validationResult = await action({
    params,
    schema: hasVotedSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  try {
    const vote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    });

    if (!vote) {
      return {
        success: true,
        data: { hasUpvoted: false, hasDownvoted: false },
      };
    }

    return {
      success: true,
      data: {
        hasUpvoted: vote.voteType === "upvote",
        hasDownvoted: vote.voteType === "downvote",
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
