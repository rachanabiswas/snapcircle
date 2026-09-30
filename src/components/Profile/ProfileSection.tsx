"use client";

import { useState } from "react";

import ProfileEditForm from "@/components/Profile/ProfileEditForm";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { genderLabels, genderOptions, type Gender } from "@/lib/zodSchema";

export type ProfileUser = {
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  gender: string | null;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

const toGender = (value: string | null): Gender =>
  genderOptions.includes(value as Gender) ?
    (value as Gender)
  : "prefer_not_to_say";

const ProfileSection = ({ user }: { user: ProfileUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const gender = toGender(user.gender);
  const initials = getInitials(user.name);

  if (isEditing) {
    return (
      <ProfileEditForm
        initialBio={user.bio ?? ""}
        initialGender={gender}
        initialImage={user.image}
        fallbackInitials={initials}
        onCancel={() => setIsEditing(false)}
        onSaved={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar size="lg">
            {user.image && (
              <AvatarImage
                src={user.image}
                alt={`${user.name} avatar`}
              />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <CardTitle className="truncate text-xl">{user.name}</CardTitle>
            <p className="text-muted-foreground truncate text-sm">
              {user.email}
            </p>
            <div className="mt-1">
              <Badge variant="secondary">{genderLabels[gender]}</Badge>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}>
            Edit profile
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {user.bio ?
          <p className="leading-relaxed whitespace-pre-wrap">{user.bio}</p>
        : <p className="text-muted-foreground text-sm">
            No bio yet. Add one to tell your circle about you.
          </p>
        }
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
