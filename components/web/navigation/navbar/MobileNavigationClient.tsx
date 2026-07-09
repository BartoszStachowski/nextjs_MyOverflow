"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import { Button, buttonVariants } from "@/components/ui/button";
import NavLinks from "@/components/web/navigation/navbar/NavLinks";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth.action";

type Props = {
  userId?: string;
};

const MobileNavigationClient = ({ userId }: Props) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open navigation menu"
          className="sm:hidden"
        >
          <Image
            src="/icons/hamburger.svg"
            alt=""
            width={36}
            height={36}
            className="invert-colors"
          />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="background-light900_dark200 px-5">
        <SheetTitle className="hidden">Navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Main mobile navigation menu
        </SheetDescription>

        <Link href="/" className="mt-4 flex items-center gap-1">
          <Image
            src="/images/site-logo.svg"
            width={23}
            height={23}
            alt="Logo"
          />

          <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900">
            My<span className="text-primary-500">Overflow</span>
          </p>
        </Link>

        <div className="no-scrollbar flex h-[calc(100vh-80px)] flex-col justify-between overflow-y-auto">
          <section className="flex h-full flex-col gap-6 pt-16">
            <NavLinks isMobileNav />
          </section>

          <div className="flex flex-col gap-3">
            {userId ? (
              <form action={signOutAction}>
                <Button
                  type="submit"
                  className="base-medium w-fit bg-transparent px-4 py-3"
                >
                  <LogOut className="size-5 text-black dark:text-white" />
                  <span className="text-dark300_light900">Logout</span>
                </Button>
              </form>
            ) : (
              <>
                <SheetClose asChild>
                  <Link
                    href={ROUTES.SIGN_IN}
                    className={buttonVariants({
                      className:
                        "small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none",
                    })}
                  >
                    <span className="primary-text-gradient">Sign In</span>
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link
                    href={ROUTES.SIGN_UP}
                    className={buttonVariants({
                      className:
                        "small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none",
                    })}
                  >
                    Sign up
                  </Link>
                </SheetClose>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigationClient;
