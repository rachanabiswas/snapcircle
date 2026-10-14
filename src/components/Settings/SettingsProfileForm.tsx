"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/shadcnui/button";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
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
import {
  genderLabels,
  genderOptions,
  settingsProfileSchema,
  type Gender,
  type SettingsProfileValues,
} from "@/lib/zodSchema";
import { updateSettingsProfileAction } from "@/server/settings";

type Props = {
  initialName: string;
  initialBio: string;
  initialGender: Gender;
};

const SettingsProfileForm = ({
  initialName,
  initialBio,
  initialGender,
}: Props) => {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<SettingsProfileValues>({
    resolver: zodResolver(settingsProfileSchema),
    defaultValues: {
      name: initialName,
      bio: initialBio,
      gender: initialGender,
    },
    mode: "all",
  });

  const onSubmit = handleSubmit(async (values) => {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("bio", values.bio);
    formData.set("gender", values.gender);
    const result = await updateSettingsProfileAction(formData);
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
      description: "Profile updated",
      type: "success",
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4">
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
            <Input
              {...field}
              id={field.name}
              autoComplete="name"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="bio"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              rows={3}
              maxLength={500}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="gender"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="settings-gender">Gender</FieldLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}>
              <SelectTrigger
                id="settings-gender"
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
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default SettingsProfileForm;
