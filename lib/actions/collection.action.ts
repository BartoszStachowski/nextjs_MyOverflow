"use server";

import { z } from "zod";
import { collectionBaseSchema } from "@/app/schemas/collection";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { Question, Collection } from "@/database";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";

export const toggleSaveQuestion = async (
  params: z.infer<typeof collectionBaseSchema>
): Promise<ActionResponse<{ saved: boolean }>> => {
  const validationResult = await action({
    params,
    schema: collectionBaseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const userId = validationResult.session?.user.id;

  try {
    const questionExists = await Question.exists({ _id: questionId });

    if (!questionExists) {
      throw new Error("Question not found");
    }

    const collection = await Collection.findOne({
      question: questionId,
      author: userId,
    });

    if (collection) {
      await Collection.findByIdAndDelete(collection._id);

      revalidatePath(ROUTES.QUESTION(questionId));

      return {
        success: true,
        data: { saved: false },
      };
    }

    await Collection.create({
      question: questionId,
      author: userId,
    });

    revalidatePath(ROUTES.QUESTION(questionId));

    return {
      success: true,
      data: { saved: true },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
