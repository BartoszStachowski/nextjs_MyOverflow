import React from "react";
import QuestionForm from "@/components/web/forms/QuestionForm";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/get-server-session";
import ROUTES from "@/constants/routes";

const AskQuestionPage = async () => {
  const session = await getServerSession();

  if (!session) {
    return redirect(ROUTES.SIGN_IN);
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
