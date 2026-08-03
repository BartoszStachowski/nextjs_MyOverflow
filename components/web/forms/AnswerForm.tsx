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

interface Props {
  questionId: string;
}

const Editor = dynamic(() => import("@/components/web/editor"), {
  // Make sure we turn SSR off
  ssr: false,
});

const AnswerForm = ({ questionId }: Props) => {
  const editorRef = useRef<MDXEditorMethods | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isAISubmitting, setIsAISubmitting] = useState(false);

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
        editorRef.current?.setMarkdown("");

        toast.success("Success", {
          description: "Answer created successfully",
        });
      } else {
        toast.error(`Error ${result.status}`, {
          description: result.error?.message || "Something went wrong",
        });
      }
    });
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer here
        </h4>
        <Button
          className="btn light-border-2 text-primary-500 dark:text-primary-500 gap-1.5 rounded-md border px-4 py-2.5 shadow-none"
          disabled={isAISubmitting}
        >
          {isAISubmitting ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              <span>Generating...</span>
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
              Generate AI Answer
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
              disabled={isPending}
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
