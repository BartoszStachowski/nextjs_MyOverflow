// noinspection ExceptionCaughtLocallyJS

import handleError from "@/lib/handlers/error";
import { AccountSchema } from "@/app/schemas/auth";
import { ValidationError } from "@/lib/http-errors";
import { flattenError } from "zod";
import { NotFoundError } from "@humanfs/core";
import { NextResponse } from "next/server";
import Account from "@/database/account.model";

export async function POST(request: Request) {
  const { providerAccountId } = await request.json();

  try {
    const validatedData = AccountSchema.partial().safeParse({
      providerAccountId,
    });

    if (!validatedData.success) {
      const { fieldErrors } = flattenError(validatedData.error);
      throw new ValidationError(fieldErrors);
    }

    const account = await Account.findOne({ providerAccountId });
    if (!account) throw new NotFoundError("Account");

    return NextResponse.json(
      {
        success: true,
        data: account,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
