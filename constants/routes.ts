const ROUTES = {
  ASK_QUESTION: "/ask-question",
  COLLECTION: "/collection",
  COMMUNITY: "/community",
  HOME: "/",
  JOBS: "/jobs",
  PROFILE: (id: string) => `/profile/${id}`,
  QUESTION: (id: string) => `/questions/${id}`,
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  TAG: (id: string) => `/tags/${id}`,
  TAGS: "/tags",
};

export default ROUTES;
