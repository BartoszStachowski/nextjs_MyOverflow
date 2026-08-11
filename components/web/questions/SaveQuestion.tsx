"use client";

import { authClient } from "@/lib/auth-client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { toggleSaveQuestion } from "@/lib/actions/collection.action";

interface Props {
  questionId: string;
}

const SaveQuestion = ({ questionId }: Props) => {
  const [isPending, startTransition] = useTransition();

  const {
    data: session,
    isPending: isSessionPending,
    error: sessionError,
  } = authClient.useSession();

  const userId = session?.user?.id;

  const [isLoading, setIsLoading] = useState(false);

  const hasSaved = false;

  const handleSave = () => {
    if (isPending) return;

    startTransition(async () => {
      if (!userId) {
        toast.error("Please log in", {
          description: "You need to be logged in to save a question.",
        });

        return;
      }

      try {
        const { success, data, error } = await toggleSaveQuestion({
          questionId,
        });

        if (!success) {
          toast.error("Failed to save question", {
            description: error?.message || "Something went wrong",
          });
          return;
        }

        toast.success(
          `${data?.saved ? "Saved" : "Unsaved"} question successfully`
        );
      } catch (error) {
        toast.error("Failed to save question", {
          description:
            error instanceof Error ? error.message : "Something went wrong",
        });
      }
    });
  };

  return (
    <Image
      src={hasSaved ? "/icons/star-filled.svg" : "/icons/star.svg"}
      width={18}
      height={18}
      alt="save"
      className={`cursor-pointer ${isLoading && "opacity-50"}`}
      aria-label="Save question"
      onClick={handleSave}
    />
  );
};

export default SaveQuestion;
