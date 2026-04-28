import { z } from "zod";

export const askQuestionSchema = z.object({
  title: z
    .string()
    .min(5, "Title is required.")
    .max(100, "Title cannot exceed 100 characters"),
  content: z.string().min(1, "Bosy is required"),
  tags: z
    .array(
      z
        .string()
        .min(1, "Tag is required")
        .max(30, "Tag cannot exceed 30 characters")
    )
    .min(1, "At last one tag is required")
    .max(3, "Cannot add more than 3 tags"),
});
