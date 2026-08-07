import { z } from "zod";

export const createVoteSchema = z.object({
  targetId: z.string().min(1, "Target ID is required"),
  targetType: z.enum(["question", "answer"], "Invalid target type"),
  voteType: z.enum(["upvote", "downvote"], "Invalid vote type"),
});
export const updateVoteCountSchema = createVoteSchema.extend({
  change: z.number().int().min(-1).max(1),
});

export const hasVotedSchema = createVoteSchema.pick({
  targetId: true,
  targetType: true,
});
