"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/shadcnui/button";
import { Checkbox } from "@/components/shadcnui/checkbox";
import { Spinner } from "@/components/shadcnui/spinner";
import { toast } from "@/components/shadcnui/toast";
import {
  notificationPrefsSchema,
  type NotificationPrefsValues,
} from "@/lib/zodSchema";
import { updateNotificationPrefsAction } from "@/server/settings";

type Props = {
  initial: NotificationPrefsValues;
};

const NotificationPrefsForm = ({ initial }: Props) => {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<NotificationPrefsValues>({
    resolver: zodResolver(notificationPrefsSchema),
    defaultValues: initial,
    mode: "all",
  });

  const onSubmit = handleSubmit(async (values) => {
    const formData = new FormData();
    formData.set("likeNotifications", String(values.likeNotifications));
    formData.set("replyNotifications", String(values.replyNotifications));
    formData.set("pauseAll", String(values.pauseAll));
    const result = await updateNotificationPrefsAction(formData);
    if (!result.ok) {
      toast.add({
        title: "Could not save",
        description: result.error,
        type: "error",
      });
      return;
    }
    toast.add({
      title: "Saved",
      description: "Notification preferences updated",
      type: "success",
    });
  });

  const items: {
    name: keyof NotificationPrefsValues;
    label: string;
    hint: string;
  }[] = [
    {
      name: "likeNotifications",
      label: "Likes",
      hint: "When someone likes your post",
    },
    {
      name: "replyNotifications",
      label: "Replies",
      hint: "When someone replies to your post",
    },
    {
      name: "pauseAll",
      label: "Pause all",
      hint: "Temporarily stop all in-app notifications",
    },
  ];

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4">
      {items.map((item) => (
        <Controller
          key={item.name}
          name={item.name}
          control={control}
          render={({ field }) => (
            <label
              htmlFor={field.name}
              className="flex cursor-pointer items-center gap-3 select-none">
              <Checkbox
                id={field.name}
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <span className="flex flex-col">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-muted-foreground text-xs">
                  {item.hint}
                </span>
              </span>
            </label>
          )}
        />
      ))}
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
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default NotificationPrefsForm;
