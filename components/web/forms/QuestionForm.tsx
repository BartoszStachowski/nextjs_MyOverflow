"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { askQuestionSchema } from "@/app/schemas/question";
import { z } from "zod";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldSet,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef, useTransition } from "react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import TagCard from "@/components/web/cards/TagCard";
import { createQuestion, editQuestion } from "@/lib/actions/question.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";
import { Loader2Icon } from "lucide-react";

const Editor = dynamic(() => import("@/components/web/editor"), {
  // Make sure we turn SSR off
  ssr: false,
});

interface Props {
  question?: Question;
  isEdit?: boolean;
}

const QuestionForm = ({ question, isEdit = false }: Props) => {
  const router = useRouter();
  const editorRef = useRef<MDXEditorMethods | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(askQuestionSchema),
    defaultValues: {
      title: question?.title || "",
      content: question?.content || "",
      tags: question?.tags.map((tag) => tag.name) || [],
    },
  });

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: { value: string[] }
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tagInput = e.currentTarget.value.trim();

      if (tagInput && tagInput.length < 15 && !field.value.includes(tagInput)) {
        form.setValue("tags", [...field.value, tagInput]);
        e.currentTarget.value = "";
        form.clearErrors("tags");
      } else if (tagInput.length > 15) {
        form.setError("tags", {
          message: "Tag should be less than 15 characters",
          type: "manual",
        });
      } else if (field.value.includes(tagInput)) {
        form.setError("tags", {
          message: "Tag already exists",
          type: "manual",
        });
      }
    }
  };

  const handleTagRemove = (tag: string, field: { value: string[] }) => {
    const newTags = field.value.filter((t) => t !== tag);

    form.setValue("tags", newTags);

    if (newTags.length === 0) {
      form.setError("tags", {
        message: "Tags are required",
        type: "manual",
      });
    }
  };

  const handleCreateQuestion = async (
    data: z.infer<typeof askQuestionSchema>
  ) => {
    startTransition(async () => {
      const result =
        isEdit && question
          ? await editQuestion({ questionId: question?._id, ...data })
          : await createQuestion(data);

      if (!result.success) {
        toast.error(`Error ${result.status}`, {
          description: result.error?.message || "Something went wrong",
        });

        return;
      }

      toast.success("Success", {
        description: isEdit
          ? "Question updated successfully"
          : "Question created successfully",
      });

      if (result.data) {
        router.push(ROUTES.QUESTION(result.data._id));
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleCreateQuestion)}>
      <FieldSet>
        <FieldGroup className="@container/field-group flex flex-col gap-10">
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel className="text-dark400_light800">
                  Question Title <span className="text-primary-500">*</span>
                </FieldLabel>
                <Input
                  aria-invalid={fieldState.invalid}
                  type="text"
                  className="background-light700_dark300! light-border-2! text-dark300_light700! min-h-14 border!"
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}

                <FieldDescription className="text-light-500">
                  Be specific and imagine you&apos;re asking a question to
                  another person.
                </FieldDescription>
              </Field>
            )}
          />
          <Controller
            name="content"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel className="text-dark400_light800">
                  Detailed explanation of your problem
                  <span className="text-primary-500">*</span>
                </FieldLabel>
                <Editor
                  editorRef={editorRef}
                  value={field.value}
                  fieldChange={field.onChange}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                <FieldDescription className="text-light-500">
                  Introduce the problem and expand on what you&apos;ve put in
                  the title.
                </FieldDescription>
              </Field>
            )}
          />
          <Controller
            name="tags"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel className="text-dark400_light800">
                  Tags <span className="text-primary-500">*</span>
                </FieldLabel>
                <div>
                  <Input
                    aria-invalid={fieldState.invalid}
                    type="text"
                    className="background-light700_dark300! light-border-2! text-dark300_light700! min-h-14 border!"
                    onKeyDown={(e) => handleInputKeyDown(e, field)}
                  />
                  {field.value.length > 0 && (
                    <div className="flex-start mt-2.5 flex-wrap gap-2.5">
                      {field.value.map((tag: string) => (
                        <TagCard
                          key={tag}
                          _id={tag}
                          name={tag}
                          compact
                          remove
                          isButton
                          handleRemove={() => handleTagRemove(tag, field)}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}

                <FieldDescription className="text-light-500">
                  Add up to 3 tags to describe what your question is about. You
                  need to press enter to add a tag.
                </FieldDescription>
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
                  <span>Submitting</span>
                </>
              ) : (
                <>{isEdit ? "Edit" : "Ask A Question"}</>
              )}
            </Button>
          </div>
        </FieldGroup>
      </FieldSet>
    </form>
  );
};

export default QuestionForm;
