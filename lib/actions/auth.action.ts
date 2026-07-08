"use server";

import { signUpSchema } from "@/app/schemas/auth";
import { z } from "zod";
import { auth } from "@/lib/auth";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { headers } from "next/headers";

export const signUpWithCredentialsAction = async (
  params: z.infer<typeof signUpSchema>
): Promise<ActionResponse> => {
  const validationResult = await action({ params, schema: signUpSchema });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { email, name, username, password } = params;

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        name,
        password,
        username,
      },
      headers: await headers(),
    });

    return {
      success: true,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
