import { z } from "zod";

export const paginatedSearchParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
  query: z.string().optional(),
  filter: z.string().optional(),
  sort: z.string().optional(),
});

export const getTagQuestionSchema = paginatedSearchParamsSchema
  .omit({ filter: true })
  .extend({ tagId: z.string().min(1, "Tag ID is required") });
