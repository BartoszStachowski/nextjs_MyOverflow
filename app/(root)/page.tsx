import React from "react";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import LocalSearch from "@/components/web/search/LocalSearch";
import HomeFilter from "@/components/web/filters/HomeFilter";
import QuestionCard from "@/components/web/cards/QuestionCard";
import { getQuestions } from "@/lib/actions/question.action";
import DataRenderer from "@/components/web/base/DataRenderer";
import { EMPTY_QUESTION } from "@/constants/states";
import CommonFilter from "@/components/web/filters/CommonFilter";
import { HomePageFilters } from "@/constants/filters";
import Pagination from "@/components/web/base/Pagination";

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

const HomePage = async ({ searchParams }: SearchParams) => {
  const { page, pageSize, query, filter } = await searchParams;
  const { success, data, error } = await getQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    filter: filter || "",
  });

  const { questions, isNext } = data || {};

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Button
          className="primary-gradient text-light-900! min-h-11.5 px-4 py-3"
          asChild
        >
          <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
        </Button>
      </section>
      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route="/"
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

export default HomePage;
