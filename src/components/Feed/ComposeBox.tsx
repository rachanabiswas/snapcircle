"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlusIcon, SendIcon, XIcon } from "lucide-react";

import { createPostAction } from "@/server/posts";
import { createPostSchema, type CreatePostValues } from "@/lib/zodSchema";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";
import { Button, buttonVariants } from "@/components/shadcnui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Spinner } from "@/components/shadcnui/spinner";
import { Textarea } from "@/components/shadcnui/textarea";
import { toast } from "@/components/shadcnui/toast";
import { cn } from "@/lib/utils";

type ComposeUser = {
  name: string | null;
  email: string | null;
  image?: string | null;
};

const getInitials = (name: string | null, email: string | null) => {
  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return email?.slice(0, 2).toUpperCase() ?? "U";
};

const ComposeBox = ({ user }: { user: ComposeUser }) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { content: "" },
    mode: "all",
  });

  const pickImage = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.add({
        title: "Invalid file",
        description: "Please choose an image file",
        type: "error",
      });
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(null);
    setPreviewUrl(null);
    setInputKey((key) => key + 1);
  };

  const onSubmit = handleSubmit(async (values) => {
    const formData = new FormData();
    formData.set("content", values.content);
    if (image) formData.set("image", image);

    const result = await createPostAction(formData);
    if (!result.ok) {
      toast.add({
        title: "Could not post",
        description: result.error,
        type: "error",
      });
      return;
    }
    reset();
    clearImage();
    toast.add({
      title: "Posted",
      description: "Your post is live in the feed",
      type: "success",
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Avatar>
            {user.image && (
              <AvatarImage
                src={user.image}
                alt={user.name ?? "Your avatar"}
              />
            )}
            <AvatarFallback>
              {getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          Share an update
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-3">
          <Controller
            name="content"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="sr-only">
                  Post content
                </FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="What is happening in your circle?"
                  rows={3}
                  maxLength={500}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {previewUrl && (
            <div className="relative w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Upload preview"
                className="max-h-48 rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon-xs"
                aria-label="Remove image"
                className="absolute top-2 right-2"
                onClick={clearImage}>
                <XIcon aria-hidden="true" />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div>
              <input
                key={inputKey}
                id="post-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                aria-label="Attach an image"
                onChange={(event) => pickImage(event.target.files?.[0])}
              />
              <label
                htmlFor="post-image"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "cursor-pointer",
                )}>
                <ImagePlusIcon
                  data-icon="inline-start"
                  aria-hidden="true"
                />
                {image ? "Change image" : "Add image"}
              </label>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm">
              {isSubmitting ?
                <Spinner
                  data-icon="inline-start"
                  aria-hidden="true"
                />
              : <SendIcon
                  data-icon="inline-start"
                  aria-hidden="true"
                />
              }
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ComposeBox;
