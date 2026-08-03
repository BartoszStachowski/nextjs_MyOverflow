"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRef, useState, useTransition } from "react";
import { Field, FieldError, FieldSet } from "@/components/ui/field";
import { MDXEditorMethods } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import { createAnswer } from "@/lib/actions/answer.action";
import { toast } from "sonner";
import { answerSchema } from "@/app/schemas/answer";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";

interface Props {
  questionId: string;
  questionTitle: string;
  questionContent: string;
}

const Editor = dynamic(() => import("@/components/web/editor"), {
  // Make sure we turn SSR off
  ssr: false,
});

const AnswerForm = ({ questionId, questionTitle, questionContent }: Props) => {
  const editorRef = useRef<MDXEditorMethods | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isAIFormatting, setIsAIFormatting] = useState(false);

  const {
    data: session,
    isPending: isSessionPending,
    error: sessionError,
  } = authClient.useSession();

  const form = useForm<z.infer<typeof answerSchema>>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof answerSchema>) => {
    startTransition(async () => {
      const result = await createAnswer({ questionId, ...data });

      if (result.success) {
        form.reset();

        toast.success("Success", {
          description: "Answer created successfully",
        });

        if (editorRef.current) {
          editorRef.current?.setMarkdown("");
        }
      } else {
        toast.error(`Error ${result.status}`, {
          description: result.error?.message || "Something went wrong",
        });
      }
    });
  };

  const formatAnswerWithAI = async () => {
    if (isSessionPending) {
      return;
    }

    if (sessionError) {
      toast.error("Session error", {
        description: sessionError.message || "Could not verify your session.",
      });

      return;
    }

    if (!session?.session?.token) {
      toast.warning("Please log in", {
        description: "You need to be logged in to use this feature.",
      });

      return;
    }

    const answerContent = editorRef.current?.getMarkdown().trim() ?? "";

    form.setValue("content", answerContent, {
      shouldDirty: true,
      shouldTouch: true,
    });

    const isContentValid = await form.trigger("content");

    if (!isContentValid) {
      return;
    }

    setIsAIFormatting(true);

    try {
      const response = await api.ai.formatAnswer(
        questionTitle,
        questionContent,
        answerContent
      );

      if (!response.success) {
        toast.error("Error", {
          description: response.error?.message || "Something went wrong",
        });

        return;
      }

      const formattedAnswer = response.data
        .replace(/<br\s*\/?>/gi, "\n")
        .trim();

      editorRef.current?.setMarkdown(formattedAnswer);

      form.setValue("content", formattedAnswer, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      toast.success("Success", {
        description: "Your answer has been formatted successfully.",
      });
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsAIFormatting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer here
        </h4>
        <Button
          className="btn light-border-2 text-primary-500 dark:text-primary-500 gap-1.5 rounded-md border px-4 py-2.5 shadow-none"
          disabled={isAIFormatting || isSessionPending}
          onClick={formatAnswerWithAI}
        >
          {isAIFormatting ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              <span>Formatting...</span>
            </>
          ) : (
            <>
              <Image
                src="/icons/stars.svg"
                alt="Generate AI Answer"
                width={12}
                height={12}
                className="object-contain"
              />
              Format with AI
            </>
          )}
        </Button>
      </div>

      <form
        // Call handleSubmit inside the event handler to avoid the ESLint refs warning.
        // This ensures that editorRef.current is accessed only after the form is submitted,
        // not while the component is rendering.
        onSubmit={(event) => {
          void form.handleSubmit(handleSubmit)(event);
        }}
        className="mt-6 flex w-full flex-col gap-10"
      >
        <FieldSet>
          <Controller
            name="content"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <Editor
                  editorRef={editorRef}
                  value={field.value}
                  fieldChange={field.onChange}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="flex justify-end">
            <Button
              className="primary-gradient text-light-900! w-fit"
              disabled={isPending || isAIFormatting}
              type="submit"
            >
              {isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                "Post Answer"
              )}
            </Button>
          </div>
        </FieldSet>
      </form>
    </div>
  );
};

export default AnswerForm;
