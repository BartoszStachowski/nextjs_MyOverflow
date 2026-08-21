import { getTagQuestions } from "@/lib/actions/tag.action";
import ROUTES from "@/constants/routes";
import LocalSearch from "@/components/web/search/LocalSearch";
import HomeFilter from "@/components/web/filters/HomeFilter";
import DataRenderer from "@/components/web/base/DataRenderer";
import { EMPTY_QUESTION } from "@/constants/states";
import QuestionCard from "@/components/web/cards/QuestionCard";
import React from "react";
import CommonFilter from "@/components/web/filters/CommonFilter";
import { HomePageFilters } from "@/constants/filters";
import Pagination from "@/components/web/base/Pagination";

const Page = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { page, pageSize, query } = await searchParams;

  const { success, data, error } = await getTagQuestions({
    tagId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
  });

  const { tag, questions, isNext } = data || {};

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">{tag?.name}</h1>
      </section>
      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route={ROUTES.TAG(id)}
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />

        <CommonFilter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px] w-full"
          containerClasses="hidden max-md:flex"
        />
      </section>
      <HomeFilter />

      <DataRenderer
        success={success}
        error={error}
        data={questions}
        empty={EMPTY_QUESTION}
        render={(questions) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      />

      <Pagination isNext={isNext || false} page={page} />
    </>
  );
};

export default Page;
