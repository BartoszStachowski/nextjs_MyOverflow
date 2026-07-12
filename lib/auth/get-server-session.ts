import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const getServerSession = async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
};
