import DataRenderer from "@/components/web/base/DataRenderer";
import { EMPTY_ANSWERS } from "@/constants/states";
import AnswerCard from "@/components/web/cards/AnswerCard";
import { AnswerFilters } from "@/constants/filters";
import CommonFilter from "@/components/web/filters/CommonFilter";
import Pagination from "@/components/web/base/Pagination";
import React from "react";

interface Props extends ActionResponse<Answer[]> {
  page: number;
  isNext: boolean;
  totalAnswers: number;
}

const AllAnswers = ({
  page,
  isNext,
  data,
  success,
  error,
  totalAnswers,
}: Props) => {
  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">
          {totalAnswers} {totalAnswers === 1 ? "Answer" : "Answers"}
        </h3>
        <CommonFilter
          filters={AnswerFilters}
          otherClasses="sm:min-w-32"
          containerClasses="max-xs:w-full"
        />
      </div>

      <DataRenderer
        success={success}
        data={data}
        error={error}
        empty={EMPTY_ANSWERS}
        render={(answers) =>
          answers.map((answer) => <AnswerCard key={answer._id} {...answer} />)
        }
      />

      <Pagination isNext={isNext || false} page={page} />
    </div>
  );
};

export default AllAnswers;
