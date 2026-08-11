import { z } from "zod";

export const collectionBaseSchema = z.object({
  questionId: z.string().min(1, "Collection ID is required"),
});
