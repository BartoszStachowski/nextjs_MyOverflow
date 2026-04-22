"use client";

import React from "react";
import { sidebarLinks } from "@/constants";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import ROUTES from "@/constants/routes";
import { SheetClose } from "@/components/ui/sheet";

type Props = {
  isMobileNav?: boolean;
};

const NavLinks = ({ isMobileNav = false }: Props) => {
  const pathname = usePathname();
  const userId = 1;

  return (
    <>
      {sidebarLinks.map((item) => {
        let href = item.route;

        if (item.route === ROUTES.PROFILE) {
          if (!userId) return null;
          href = `${ROUTES.PROFILE}/${userId}`;
        }

        const isActive =
          (pathname.includes(href) && href.length > 1) || pathname === href;

        const LinkComponent = (
          <Link
            href={href}
            className={cn(
              isActive
                ? "primary-gradient rounded-lg text-light-900"
                : "text-dark300_light900",
              "flex items-center justify-start gap-4 bg-transparent p-4"
            )}
          >
            <Image
              src={item.imgURL}
              alt={item.label}
              width={20}
              height={20}
              className={cn({ "invert-colors": !isActive })}
            />
            <p
              className={cn(
                isActive ? "base-bold" : "base-medium",
                !isMobileNav && "max-lg:hidden"
              )}
            >
              {item.label}
            </p>
          </Link>
        );

        return isMobileNav ? (
          <SheetClose asChild key={href}>
            {LinkComponent}
          </SheetClose>
        ) : (
          <React.Fragment key={href}>{LinkComponent}</React.Fragment>
        );
      })}
    </>
  );
};

export default NavLinks;
