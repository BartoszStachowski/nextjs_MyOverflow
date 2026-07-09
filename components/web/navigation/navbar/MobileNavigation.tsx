import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import MobileNavigationClient from "./MobileNavigationClient";

const MobileNavigation = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  return <MobileNavigationClient userId={userId} />;
};

export default MobileNavigation;
