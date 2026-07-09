"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SheetClose } from "@/components/ui/sheet";
import { sidebarLinks } from "@/constants";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

type Props = {
  isMobileNav?: boolean;
  userId?: string;
};

const NavLinks = ({ isMobileNav = false, userId }: Props) => {
  const pathname = usePathname();

  const getHref = (route: string | ((id: string) => string)) => {
    if (typeof route === "function") {
      return userId ? route(userId) : null;
    }

    return route;
  };

  const isRouteActive = (pathname: string, href: string) => {
    if (href === ROUTES.HOME) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {sidebarLinks.map((item) => {
        const href = getHref(item.route);

        if (!href) return null;

        const isActive = isRouteActive(pathname, href);

        const content = (
          <Link
            key={item.label}
            href={href}
            className={cn(
              `flex items-center justify-start gap-4 rounded-lg bg-transparent p-4 text-base`,
              isActive
                ? "primary-gradient text-light-900"
                : "text-dark300_light900"
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
                isMobileNav ? "text-base" : "max-lg:hidden"
              )}
            >
              {item.label}
            </p>
          </Link>
        );

        return isMobileNav ? (
          <SheetClose asChild key={href}>
            {content}
          </SheetClose>
        ) : (
          <React.Fragment key={href}>{content}</React.Fragment>
        );
      })}
    </>
  );
};

export default NavLinks;
