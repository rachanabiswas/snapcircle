"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendIcon } from "lucide-react";

import { createReplyAction } from "@/server/posts";
import { replySchema, type ReplyValues } from "@/lib/zodSchema";
import { Button } from "@/components/shadcnui/button";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Textarea } from "@/components/shadcnui/textarea";
import { toast } from "@/components/shadcnui/toast";

const ReplyForm = ({ parentId }: { parentId: string }) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<ReplyValues>({
    resolver: zodResolver(replySchema),
    defaultValues: { content: "" },
    mode: "all",
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await createReplyAction(parentId, values.content);
    if (!result.ok) {
      toast.add({
        title: "Could not reply",
        description: result.error,
        type: "error",
      });
      return;
    }
    reset();
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-3">
      <Controller
        name="content"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Write a reply</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              placeholder="Write a reply..."
              rows={3}
              maxLength={500}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          size="sm">
          <SendIcon
            data-icon="inline-start"
            aria-hidden="true"
          />
          {isSubmitting ? "Replying..." : "Reply"}
        </Button>
      </div>
    </form>
  );
};

export default ReplyForm;
