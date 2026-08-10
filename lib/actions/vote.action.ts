"use server";

import { z } from "zod";
import { createVoteSchema, hasVotedSchema } from "@/app/schemas/vote";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import mongoose from "mongoose";
import { Vote } from "@/database";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";
import { updateVoteCount } from "@/lib/services/vote.service";

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

  try {
    await session.withTransaction(async () => {
      const existingVote = await Vote.findOne({
        author: userId,
        actionId: targetId,
        actionType: targetType,
      }).session(session);

      if (!existingVote) {
        const vote = new Vote({
          author: userId,
          actionId: targetId,
          actionType: targetType,
          voteType,
        });

        await vote.save({ session });

        await updateVoteCount(
          { targetId, targetType, voteType, change: 1 },
          session
        );

        return;
      }

      if (existingVote.voteType === voteType) {
        // User clicked the same vote again -> remove vote
        await Vote.deleteOne({ _id: existingVote._id }, { session });
        await updateVoteCount(
          { targetId, targetType, voteType, change: -1 },
          session
        );

        return;
      }

      // User changed vote, e.g. upvote -> downvote
      const previousVoteType = existingVote.voteType;

      existingVote.voteType = voteType;

      await existingVote.save({ session });

      await updateVoteCount(
        { targetId, targetType, voteType: previousVoteType, change: -1 },
        session
      );

      await updateVoteCount(
        { targetId, targetType, voteType, change: 1 },
        session
      );
    });

    revalidatePath(ROUTES.QUESTION(targetId));

    return {
      success: true,
    };
  } catch (error) {
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
    })
      .select("voteType")
      .lean();

    return {
      success: true,
      data: {
        hasUpvoted: vote?.voteType === "upvote",
        hasDownvoted: vote?.voteType === "downvote",
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
