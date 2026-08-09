import { z } from "zod";
import { updateVoteCountSchema } from "@/app/schemas/vote";
import { ClientSession } from "mongoose";
import { Answer, Question } from "@/database";

export const updateVoteCount = async (
  params: z.infer<typeof updateVoteCountSchema>,
  session: ClientSession
) => {
  const { targetId, targetType, voteType, change } =
    updateVoteCountSchema.parse(params);

  const voteField = voteType === "upvote" ? "upvotes" : "downvotes";
  const result =
    targetType === "question"
      ? await Question.updateOne(
          { _id: targetId },
          {
            $inc: { [voteField]: change },
          },
          { session }
        )
      : await Answer.updateOne(
          { _id: targetId },
          {
            $inc: { [voteField]: change },
          },
          { session }
        );

  if (result.matchedCount === 0) {
    throw new Error("Failed to update vote count");
  }
};
