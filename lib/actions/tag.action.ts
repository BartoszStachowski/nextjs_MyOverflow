import action from "@/lib/handlers/action";
import {
  getTagQuestionSchema,
  paginatedSearchParamsSchema,
} from "@/app/schemas/general";
import handleError from "@/lib/handlers/error";
import { QueryFilter } from "mongoose";
import { Question, Tag } from "@/database";
import { z } from "zod";
import { ITag } from "@/database/tag.model";
import { IQuestion } from "@/database/question.model";

export const getTags = async (
  params: PaginatedSearchParams
): Promise<ActionResponse<{ tags: TagResponse[]; isNext: boolean }>> => {
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

  const filterQuery: QueryFilter<ITag> = {};

  if (query) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filterQuery.name = {
      $regex: escapedQuery,
      $options: "i",
    };
  }

  let sortCriteria: Record<string, 1 | -1> = {
    questions: -1,
  };

  switch (filter) {
    case "popular":
      sortCriteria = { questions: -1 };
      break;
    case "recent":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "name":
      sortCriteria = { name: 1 };
      break;
    default:
      break;
  }

  try {
    const [totalTags, tags] = await Promise.all([
      Tag.countDocuments(filterQuery),

      Tag.find(filterQuery)
        .sort(sortCriteria)
        .skip(skip)
        .limit(pageSize)
        .lean(),
    ]);

    const serializedTags: TagResponse[] = tags.map((tag) => ({
      _id: tag._id.toString(),
      name: tag.name,
      questions: tag.questions,
    }));

    const isNext = totalTags > skip + tags.length;

    return {
      success: true,
      data: {
        tags: serializedTags,
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const getTagQuestions = async (
  params: z.infer<typeof getTagQuestionSchema>
): Promise<ActionResponse<GetTagQuestionsResponse>> => {
  const validationResult = await action({
    params,
    schema: getTagQuestionSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { tagId, page = 1, pageSize = 10, query } = validationResult.params!;
  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  try {
    const tag = await Tag.findById(tagId).select("_id name questions").lean();
    if (!tag) {
      throw new Error("Tag not found");
    }

    // find questions with this tag
    // or: tags: { $in: [tagId] },
    const filterQuery: QueryFilter<IQuestion> = {
      tags: tagId,
    };

    if (query) {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // find questions with this tag and title contains query
      filterQuery.title = {
        $regex: escapedQuery,
        $options: "i",
      };
    }

    const [totalQuestions, questions] = await Promise.all([
      Question.countDocuments(filterQuery),
      Question.find(filterQuery)
        .select(
          "_id title tags views answers upvotes downvotes author createdAt"
        )
        .populate([
          { path: "author", select: "name image" },
          { path: "tags", select: "name" },
        ])
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: {
        tag: JSON.parse(JSON.stringify(tag)),
        questions: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
