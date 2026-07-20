"use client";

import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";

interface Props {
  route: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
  iconPosition?: "left" | "right";
}

const LocalSearch = ({
  route,
  imgSrc,
  placeholder,
  otherClasses,
  iconPosition = "left",
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  // get params: page.com?query=12&test=13 -> "query12&test13"
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [searchQuery, setSearchQuery] = useState(query);
  const previousSearchRef = useRef(searchQuery);

  useEffect(() => {
    if (previousSearchRef.current === searchQuery) return;

    previousSearchRef.current = searchQuery;

    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        // newUrl
        // page.com/?query=myQueryParam -> /?query=myQueryParam
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: searchQuery,
        });

        router.push(newUrl, { scroll: false });
      } else {
        if (pathname === route) {
          const newUrl = removeKeysFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: ["query"],
          });

          router.push(newUrl, { scroll: false });
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, router, route, searchParams, pathname]);

  return (
    <div
      className={`background-light800_darkgradient flex min-h-14 grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      {iconPosition === "left" && (
        <Image
          src={imgSrc}
          alt="search icon"
          width={24}
          height={24}
          className="cursor-pointer"
        />
      )}

      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none bg-transparent! shadow-none outline-none"
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {iconPosition === "right" && (
        <Image
          src={imgSrc}
          alt="search icon"
          width={15}
          height={15}
          className="cursor-pointer"
        />
      )}
    </div>
  );
};

export default LocalSearch;
