"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import PasswordInput from "@/components/Auth/PasswordInput";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import { Spinner } from "@/components/shadcnui/spinner";
import { toast } from "@/components/shadcnui/toast";
import { authClient } from "@/lib/auth-client";
import {
  changePasswordReviewSchema,
  changePasswordSchema,
  type ChangePasswordReviewValues,
  type ChangePasswordValues,
} from "@/lib/zodSchema";

const ChangePasswordForm = ({ currentEmail }: { currentEmail: string }) => {
  const [pwStep, setPwStep] = useState<"edit" | "review">("edit");

  const { handleSubmit, control, trigger, getValues, reset } =
    useForm<ChangePasswordValues>({
      resolver: zodResolver(changePasswordSchema),
      defaultValues: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      mode: "all",
    });

  const {
    handleSubmit: handleConfirm,
    control: confirmControl,
    reset: resetConfirm,
    formState: { isSubmitting },
  } = useForm<ChangePasswordReviewValues>({
    resolver: zodResolver(changePasswordReviewSchema),
    defaultValues: { confirm: undefined as unknown as "CONFIRM" },
    mode: "all",
  });

  const goToReview = async () => {
    const valid = await trigger();
    if (valid) setPwStep("review");
  };

  const onConfirm = handleConfirm(async () => {
    const values = getValues();
    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: true,
    });
    if (error) {
      toast.add({
        title: "Could not change password",
        description: error.message,
        type: "error",
      });
      return;
    }
    toast.add({
      title: "Password changed",
      description: "Other sessions were signed out",
      type: "success",
    });
    reset();
    resetConfirm();
    setPwStep("edit");
  });

  if (pwStep === "review") {
    return (
      <div className="flex flex-col gap-4">
        <Badge
          variant="secondary"
          className="w-fit">
          Step 2 of 2 — Review
        </Badge>
        <div className="text-muted-foreground text-sm">
          <p>Account: {currentEmail}</p>
          <p>
            Other devices will be signed out. Your new password takes effect
            immediately.
          </p>
        </div>
        <form
          onSubmit={onConfirm}
          noValidate
          className="flex flex-col gap-4">
          <Controller
            name="confirm"
            control={confirmControl}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Type CONFIRM</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPwStep("edit")}
              disabled={isSubmitting}>
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}>
              {isSubmitting && (
                <Spinner
                  data-icon="inline-start"
                  aria-hidden="true"
                />
              )}
              {isSubmitting ? "Saving..." : "Confirm change"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Badge
        variant="secondary"
        className="w-fit">
        Step 1 of 2 — Enter passwords
      </Badge>
      <form
        onSubmit={handleSubmit(goToReview)}
        noValidate
        className="flex flex-col gap-4">
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
        <Controller
          name="newPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>New password</FieldLabel>
              <PasswordInput
                {...field}
                id={field.name}
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Confirm new password</FieldLabel>
              <PasswordInput
                {...field}
                id={field.name}
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
