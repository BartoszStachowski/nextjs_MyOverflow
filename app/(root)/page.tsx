import React from "react";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import LocalSearch from "@/components/web/search/LocalSearch";
import HomeFilter from "@/components/web/filters/HomeFilter";

const questions = [
  {
    _id: "1",
    title: "How to learn React?",
    description: "I want to learn React, can anyone help me?",
    tags: [
      { _id: "1", name: "React " },
      { _id: "2", name: "JavaScript" },
    ],
    author: { _id: "1", name: "John Kowalsky" },
    upvotes: 10,
    answers: 5,
    views: 100,
    createdAt: new Date(),
  },
  {
    _id: "2",
    title: "Best practices for Node.js API?",
    description:
      "What are the industry standards for structuring a Node.js API?",
    tags: [
      { _id: "3", name: "Node.js" },
      { _id: "4", name: "Backend" },
      { _id: "2", name: "JavaScript" },
    ],
    author: { _id: "2", name: "Jane Smith" },
    upvotes: 25,
    answers: 3,
    views: 150,
    createdAt: new Date(),
  },
  {
    _id: "3",
    title: "Flexbox vs Grid?",
    description: "When should I use CSS Grid and when is Flexbox better?",
    tags: [
      { _id: "5", name: "CSS" },
      { _id: "6", name: "Frontend" },
    ],
    author: { _id: "3", name: "Marek Nowak" },
    upvotes: 40,
    answers: 8,
    views: 300,
    createdAt: new Date(),
  },
];

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

const HomePage = async ({ searchParams }: SearchParams) => {
  const { query = "", filter = "" } = await searchParams;

  const filteredQuestions = questions.filter((question) => {
    const matchesQuery = question.title
      .toLowerCase()
      .includes(query?.toLowerCase() || "");

    const matchesFilter = filter
      ? question.tags.some(
          (tag) => tag.name.toLowerCase().trim() === filter.toLowerCase()
        )
      : true;

    return matchesQuery && matchesFilter;
  });

  return (
    <>
      <section
        className="w-full flex flex-col-reverse sm:flex-row justify-between
          gap-4 sm:items-center"
      >
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Button
          className="primary-gradient min-h-11.5 px-4 py-3 text-light-900!"
          asChild
        >
          <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
        </Button>
      </section>
      <section className="mt-11">
        <LocalSearch
          route="/"
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />
      </section>
      <HomeFilter />
      <div className="mt-10 flex w-full flex-col gap-6">
        {filteredQuestions.map((question) => (
          <h1 key={question._id}>{question.title}</h1>
        ))}
      </div>
    </>
  );
};

export default HomePage;
