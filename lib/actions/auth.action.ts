"use server";

import { signInSchema, signUpSchema } from "@/app/schemas/auth";
import { z } from "zod";
import { auth } from "@/lib/auth";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ROUTES from "@/constants/routes";

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

export const signInWithCredentialsAction = async (
  params: z.infer<typeof signInSchema>
) => {
  const validationResult = await action({ params, schema: signInSchema });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { email, password } = params;

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
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

export const signOutAction = async () => {
  await auth.api.signOut({
    headers: await headers(),
  });

  return redirect(ROUTES.HOME);
};
