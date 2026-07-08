"use client";

import React, { startTransition } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/app/schemas/auth";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import { signInWithCredentialsAction } from "@/lib/actions/auth.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SignInPage = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof signInSchema>) => {
    startTransition(async () => {
      const result = (await signInWithCredentialsAction(
        data
      )) as ActionResponse;

      if (result?.success) {
        toast.success("Success", {
          description: "Signed in successfully",
        });

        router.push(ROUTES.HOME);
      } else {
        toast.error("Error", {
          description: result?.error?.message || "Something went wrong",
        });
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 space-y-6">
      <FieldGroup className="gap-y-4">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Email Address</FieldLabel>
              <Input
                aria-invalid={fieldState.invalid}
                placeholder="john@doe.com"
                type="email"
                autoComplete="email"
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input
                aria-invalid={fieldState.invalid}
                placeholder="******"
                type="password"
                autoComplete="current-password"
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button className="primary-gradient paragraph-medium font-inter text-light-900 min-h-12 w-full rounded-md px-4 py-3">
          Sign in
        </Button>

        <p>
          Don&apos;t have an account?{" "}
          <Link
            className="paragraph-semibold primary-text-gradient"
            href={ROUTES.SIGN_UP}
          >
            Sign up
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
};

export default SignInPage;
