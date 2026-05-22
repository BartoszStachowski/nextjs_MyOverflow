// noinspection ExceptionCaughtLocallyJS

import handleError from "@/lib/handlers/error";
import { UserSchema } from "@/app/schemas/auth";
import { ValidationError } from "@/lib/http-errors";
import { flattenError } from "zod";
import User from "@/database/user.model";
import { NotFoundError } from "@humanfs/core";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";

export async function POST(request: Request) {
  const { email } = await request.json();

  try {
    await dbConnect();

    const validatedData = UserSchema.partial().safeParse({ email });

    if (!validatedData.success) {
      const { fieldErrors } = flattenError(validatedData.error);
      throw new ValidationError(fieldErrors);
    }

    const user = await User.findOne({ email });
    if (!user) throw new NotFoundError("User");

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
