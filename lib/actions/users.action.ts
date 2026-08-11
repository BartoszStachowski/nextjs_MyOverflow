"use server";

import { z } from "zod";
import { paginatedSearchParamsSchema } from "@/app/schemas/general";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { QueryFilter } from "mongoose";
import { IUser } from "@/database/user.model";
import { User } from "@/database";

export const getUsers = async (
  params: z.infer<typeof paginatedSearchParamsSchema>
): Promise<ActionResponse<{ users: UserType[]; isNext: boolean }>> => {
  const validationResult = await action({
    params,
    schema: paginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = validationResult.params!;

  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const filterQuery: QueryFilter<IUser> = {};

  if (query) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filterQuery.$or = [
      { name: { $regex: escapedQuery, $options: "i" } },
      { email: { $regex: escapedQuery, $options: "i" } },
    ];
  }

  let sortCriteria: Record<string, 1 | -1> = {};

  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "popular":
      sortCriteria = { reputation: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const [totalUsers, users] = await Promise.all([
      User.countDocuments(filterQuery),
      User.find(filterQuery).sort(sortCriteria).skip(skip).limit(limit).lean(),
    ]);

    const isNext = totalUsers > skip + users.length;

    return {
      success: true,
      data: {
        users: JSON.parse(JSON.stringify(users)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
