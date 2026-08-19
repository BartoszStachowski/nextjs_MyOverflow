import ROUTES from "@/constants/routes";
import LocalSearch from "@/components/web/search/LocalSearch";
import QuestionCard from "@/components/web/cards/QuestionCard";
import DataRenderer from "@/components/web/base/DataRenderer";
import { EMPTY_QUESTION } from "@/constants/states";
import { getSavedQuestions } from "@/lib/actions/collection.action";
import CommonFilter from "@/components/web/filters/CommonFilter";
import { CollectionFilters } from "@/constants/filters";
import React from "react";

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

const CollectionsPage = async ({ searchParams }: SearchParams) => {
  const { page, pageSize, query, filter } = await searchParams;
  const { success, data, error } = await getSavedQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    filter: filter || "",
  });

  const { collection } = data || {};

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>
      <div className="justibe-between smitems-center mt-11 flex gap-5 max-sm:flex-col">
        <LocalSearch
          route={ROUTES.COLLECTION}
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />

        <CommonFilter
          filters={CollectionFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px] w-full"
        />
      </div>

      <DataRenderer
        success={success}
        error={error}
        data={collection}
        empty={EMPTY_QUESTION}
        render={(collection) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {collection.map((item) => (
              <QuestionCard key={item._id} question={item.question} />
            ))}
          </div>
        )}
      />
    </>
  );
};

export default CollectionsPage;
