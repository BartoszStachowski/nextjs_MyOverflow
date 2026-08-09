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
