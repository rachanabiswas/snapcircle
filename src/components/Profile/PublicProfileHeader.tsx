import FollowButton from "@/components/Profile/FollowButton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";
import { Badge } from "@/components/shadcnui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { genderLabels, genderOptions, type Gender } from "@/lib/zodSchema";

export type PublicProfileUser = {
  id: string;
  name: string;
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

const PublicProfileHeader = ({
  user,
  isFollowing,
}: {
  user: PublicProfileUser;
  isFollowing: boolean;
}) => {
  const initials = getInitials(user.name);
  const gender = toGender(user.gender);

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
            <div className="mt-1">
              <Badge variant="secondary">{genderLabels[gender]}</Badge>
            </div>
          </div>
          <FollowButton
            targetId={user.id}
            initialFollowing={isFollowing}
          />
        </div>
      </CardHeader>
      <CardContent>
        {user.bio ?
          <p className="leading-relaxed whitespace-pre-wrap">{user.bio}</p>
        : <p className="text-muted-foreground text-sm">No bio yet.</p>}
      </CardContent>
    </Card>
  );
};

export default PublicProfileHeader;
