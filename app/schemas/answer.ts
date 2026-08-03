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

export const AIAnswerSchema = z.object({
  questionTitle: z
    .string()
    .min(1, "Question is required.")
    .max(130, "Question cannot exceed 130 characters."),
  questionContent: z
    .string()
    .min(100, "Answer has to have more than 100 characters."),
  answerContent: z
    .string()
    .min(100, "Answer has to have more than 100 characters."),
});
