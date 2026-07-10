import React from "react";
import QuestionForm from "@/components/web/forms/QuestionForm";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";

const AskQuestionPage = async () => {
  const session = await getSession();

  if (!session) {
    return redirect("/sign-in");
  }

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Ask a question</h1>

      <div className="mt-9">
        <QuestionForm />
      </div>
    </>
  );
};

export default AskQuestionPage;
