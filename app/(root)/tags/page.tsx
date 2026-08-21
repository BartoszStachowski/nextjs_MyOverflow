import React from "react";
import { getTags } from "@/lib/actions/tag.action";
import LocalSearch from "@/components/web/search/LocalSearch";
import ROUTES from "@/constants/routes";
import DataRenderer from "@/components/web/base/DataRenderer";
import { EMPTY_TAGS } from "@/constants/states";
import TagCard from "@/components/web/cards/TagCard";
import CommonFilter from "@/components/web/filters/CommonFilter";
import { TagFilters } from "@/constants/filters";
import Pagination from "@/components/web/base/Pagination";

const TagsPage = async ({ searchParams }: RouteParams) => {
  const { page, pageSize, query, filter } = await searchParams;
  const { success, data, error } = await getTags({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query,
    filter,
  });

  const { tags, isNext } = data || {};
  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl">Tags</h1>

      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route={ROUTES.TAGS}
          imgSrc="/icons/search.svg"
          placeholder="Search tags..."
          otherClasses="flex-1"
        />

        <CommonFilter
          filters={TagFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px] w-full"
        />
      </section>

      <DataRenderer
        success={success}
        error={error}
        data={tags}
        empty={EMPTY_TAGS}
        render={(tags) => (
          <div className="mt-10 flex w-full flex-wrap gap-4">
            {tags.map((tag) => (
              <TagCard key={tag._id} {...tag} />
            ))}
          </div>
        )}
      />

      <Pagination isNext={isNext || false} page={page} />
    </>
  );
};

export default TagsPage;
