"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import PasswordInput from "@/components/Auth/PasswordInput";
import { Button } from "@/components/shadcnui/button";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import { Spinner } from "@/components/shadcnui/spinner";
import { toast } from "@/components/shadcnui/toast";
import { changeEmailSchema, type ChangeEmailValues } from "@/lib/zodSchema";
import { changeEmailAction } from "@/server/settings";

const ChangeEmailForm = ({ currentEmail }: { currentEmail: string }) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: "", currentPassword: "" },
    mode: "all",
  });

  const onSubmit = handleSubmit(async (values) => {
    const formData = new FormData();
    formData.set("newEmail", values.newEmail);
    formData.set("currentPassword", values.currentPassword);
    const result = await changeEmailAction(formData);
    if (!result.ok) {
      toast.add({
        title: "Could not change email",
        description: result.error,
        type: "error",
      });
      return;
    }
    toast.add({
      title: "Email updated",
      description: "Please sign in with your new email",
      type: "success",
    });
    reset();
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">Current: {currentEmail}</p>
      <Controller
        name="newEmail"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>New email</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="email"
              autoComplete="email"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="currentPassword"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Current password</FieldLabel>
            <PasswordInput
              {...field}
              id={field.name}
              autoComplete="current-password"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}>
          {isSubmitting && (
            <Spinner
              data-icon="inline-start"
              aria-hidden="true"
            />
          )}
          {isSubmitting ? "Saving..." : "Change email"}
        </Button>
      </div>
    </form>
  );
};

export default ChangeEmailForm;
