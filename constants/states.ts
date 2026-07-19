import ROUTES from "@/constants/routes";

export const DEFAULT_EMPTY = {
  title: "No Data Found",
  message:
    "Looks like the database is taking a nap. Wake it up with some new entries.",
  button: {
    text: "Add Data",
    href: ROUTES.HOME,
  },
};

export const DEFAULT_ERROR = {
  title: "Something went wrong",
  message: "Even our code can have a bad day. Give it another shot.",
  button: {
    text: "Try Again",
    href: ROUTES.HOME,
  },
};

export const EMPTY_QUESTION = {
  title: "Ahh, No Questions Yet!",
  message: "Looks like there are no questions yet. Be the first one!",
  button: {
    text: "Ask a Question",
    href: ROUTES.ASK_QUESTION,
  },
};

export const EMPTY_TAGS = {
  title: "No Tags Found",
  message: "Looks like there are no tags yet. Be the first one!",
  button: {
    text: "Create Tag",
    href: ROUTES.TAGS,
  },
};

export const EMPTY_COLLECTIONS = {
  title: "No Collections Found",
  message: "Looks like there are no collections yet. Be the first one!",
  button: {
    text: "Save to Collection",
    href: ROUTES.COLLECTION,
  },
};
