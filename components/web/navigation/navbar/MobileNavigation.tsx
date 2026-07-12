import MobileNavigationClient from "./MobileNavigationClient";
import { getServerSession } from "@/lib/auth/get-server-session";

const MobileNavigation = async () => {
  const session = await getServerSession();

  const userId = session?.user?.id;

  return <MobileNavigationClient userId={userId} />;
};

export default MobileNavigation;
