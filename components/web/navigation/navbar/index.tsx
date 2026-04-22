import React from "react";
import Link from "next/link";
import Image from "next/image";
import Theme from "@/components/web/navigation/navbar/Theme";
import MobileNavigation from "@/components/web/navigation/navbar/MobileNavigation";
import ROUTES from "@/constants/routes";

const Navbar = () => {
  return (
    <nav
      className="flex-between background-light900_dark200 shadow-light-300 fixed
        z-50 w-full gap-5 p-6 sm:px-12 dark:shadow-none"
    >
      <Link href={ROUTES.HOME} className="flex items-center gap-1">
        <Image
          src="/images/site-logo.svg"
          width={23}
          height={23}
          alt="MyOverflow Logo"
        />

        <p
          className="h2-bold font-space-grotesk text-dark-100
            dark:text-light-900 max-sm:hidden"
        >
          My<span className="text-primary-500">Overflow</span>
        </p>
      </Link>

      <p>Global Search</p>
      <div className="flex-between gap-5">
        <Theme />
        <MobileNavigation />
      </div>
    </nav>
  );
};

export default Navbar;
