import { z } from "zod";
import { paginatedSearchParamsSchema } from "@/app/schemas/general";

export const answerSchema = z.object({
  content: z.string().min(100, "Answer has to have more than 100 characters."),
});
export const answerServerSchema = answerSchema.extend({
  questionId: z.string().min(1, "Question ID is required."),
});
export const getAnswersSchema = paginatedSearchParamsSchema.extend({
  questionId: z.string().min(1, "Question ID is required"),
});
