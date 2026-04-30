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
import { useRef } from "react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/web/editor"), {
  // Make sure we turn SSR off
  ssr: false,
});

const QuestionForm = () => {
  const editorRef = useRef<MDXEditorMethods | null>(null);

  const form = useForm({
    resolver: zodResolver(askQuestionSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: [],
    },
  });

  const onSubmit = (data: z.infer<typeof askQuestionSchema>) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
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
                  className="background-light700_dark300! light-border-2!
                    text-dark300_light700! min-h-14 border!"
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
                {/*<Input aria-invalid={fieldState.invalid} type="text" {...field} />*/}
                <Editor
                  editorRef={editorRef}
                  value={field.value}
                  fieldChange={field.onChange}
                />
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
                <Input
                  aria-invalid={fieldState.invalid}
                  type="text"
                  className="background-light700_dark300! light-border-2!
                    text-dark300_light700! min-h-14 border!"
                  {...field}
                />
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
            <Button className="primary-gradient w-fit text-light-900!">
              Ask A Question
            </Button>
          </div>
        </FieldGroup>
      </FieldSet>
    </form>
  );
};

export default QuestionForm;
