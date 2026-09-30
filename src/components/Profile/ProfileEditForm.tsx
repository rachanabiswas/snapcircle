"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlusIcon, XIcon } from "lucide-react";

import { updateProfileAction } from "@/server/profile";
import {
  genderLabels,
  genderOptions,
  updateProfileSchema,
  type Gender,
  type UpdateProfileValues,
} from "@/lib/zodSchema";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcnui/select";
import { Spinner } from "@/components/shadcnui/spinner";
import { Textarea } from "@/components/shadcnui/textarea";
import { toast } from "@/components/shadcnui/toast";
import { cn } from "@/lib/utils";

type ProfileEditFormProps = {
  initialBio: string;
  initialGender: UpdateProfileValues["gender"];
  initialImage: string | null;
  fallbackInitials: string;
  onCancel: () => void;
  onSaved: () => void;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

const ProfileEditForm = ({
  initialBio,
  initialGender,
  initialImage,
  fallbackInitials,
  onCancel,
  onSaved,
}: ProfileEditFormProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { bio: initialBio, gender: initialGender },
    mode: "all",
  });

  const pickImage = (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.add({
        title: "Invalid file",
        description: "Please choose a JPG, PNG, or WebP image",
        type: "error",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.add({
        title: "File too large",
        description: "Image must be smaller than 5 MB",
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
    formData.set("bio", values.bio);
    formData.set("gender", values.gender);
    if (image) formData.set("image", image);

    const result = await updateProfileAction(formData);
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
      description: "Your profile was updated",
      type: "success",
    });
    onSaved();
  });

  const shownImage = previewUrl ?? initialImage;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              {shownImage && (
                <AvatarImage
                  src={shownImage}
                  alt="Profile photo preview"
                />
              )}
              <AvatarFallback>{fallbackInitials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-wrap items-center gap-2">
              <input
                key={inputKey}
                id="profile-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-label="Choose a profile photo"
                onChange={(event) => pickImage(event.target.files?.[0])}
              />
              <label
                htmlFor="profile-image"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "cursor-pointer",
                )}>
                <ImagePlusIcon
                  data-icon="inline-start"
                  aria-hidden="true"
                />
                {shownImage ? "Change photo" : "Add photo"}
              </label>
              {image && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearImage}>
                  <XIcon
                    data-icon="inline-start"
                    aria-hidden="true"
                  />
                  Remove
                </Button>
              )}
            </div>
          </div>

          <Controller
            name="bio"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="Tell your circle about you"
                  rows={4}
                  maxLength={500}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="gender"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-gender">Gender</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}>
                  <SelectTrigger
                    id="profile-gender"
                    className="w-full"
                    aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Select gender">
                      {(value: Gender | null) =>
                        value && value in genderLabels ?
                          genderLabels[value]
                        : "Select gender"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {genderOptions.map((option) => (
                        <SelectItem
                          key={option}
                          value={option}>
                          {genderLabels[option]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
              onClick={onCancel}
              disabled={isSubmitting}>
              Cancel
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
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileEditForm;
