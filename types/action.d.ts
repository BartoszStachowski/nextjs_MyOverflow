interface QuestionResponse {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  views: number;
  upvotes: number;
  downvotes: number;
  answers: number;
  author: string;
  createdAt: string;
  updatedAt: string;
}

interface GetQuestionResponse {
  _id: string;
  title: string;
  content: string;
  tags: {
    _id: string;
    name: string;
  }[];
  views: number;
  upvotes: number;
  downvotes: number;
  answers: number;
  author: {
    _id: string;
    name: string;
    image?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

interface AnswerResponse {
  _id: string;
  author: string;
  question: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
}

interface AnswerListItemResponse {
  _id: string;
  author: {
    _id: string;
    name: string;
    image?: string | null;
  };
  question: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
}

interface GetAnswersResponse {
  answers: AnswerListItemResponse[];
  isNext: boolean;
  totalAnswers: number;
}

interface TagResponse {
  _id: string;
  name: string;
  questions: number;
}

type QuestionListItemResponse = Omit<
  GetQuestionResponse,
  "content" | "updatedAt"
>;

interface GetTagQuestionsResponse {
  tag: TagResponse;
  questions: QuestionListItemResponse[];
  isNext: boolean;
}
