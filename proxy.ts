import { NextRequest, NextResponse } from "next/server";
import ROUTES from "@/constants/routes";
import { auth } from "@/lib/auth";

export const proxy = async (request: NextRequest) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.redirect(new URL(ROUTES.SIGN_IN, request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/ask-question"],
};
