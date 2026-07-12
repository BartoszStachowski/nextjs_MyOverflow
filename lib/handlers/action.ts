"use server";

import { ZodSchema } from "zod";
import { ZodError, flattenError } from "zod";
import { UnauthorizedError, ValidationError } from "@/lib/http-errors";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import { getServerSession } from "@/lib/auth/get-server-session";

type ActionOptions<T> = {
  params?: T;
  schema?: ZodSchema<T>;
  authorize?: boolean;
};

type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

async function action<T>({
  params,
  schema,
  authorize = false,
}: ActionOptions<T>) {
  if (schema && params) {
    try {
      schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        const { fieldErrors } = flattenError(error);
        return new ValidationError(fieldErrors as Record<string, string[]>);
      } else {
        return new Error("Schema validation failed");
      }
    }
  }

  let session: AuthSession | null = null;

  if (authorize) {
    session = await getServerSession();

    if (!session) {
      return new UnauthorizedError();
    }
  }

  await dbConnect();

  return { params, session };
}

export default action;
