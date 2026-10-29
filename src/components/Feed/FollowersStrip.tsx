import Link from "next/link";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";

export type StripMember = {
  id: string;
  name: string;
  image: string | null;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

const getFirstName = (name: string) => name.trim().split(" ")[0] ?? name;

const FollowersStrip = ({
  members,
  isFallback,
}: {
  members: StripMember[];
  isFallback: boolean;
}) => {
  return (
    <section
      aria-labelledby="followers-strip-heading"
      className="card-hover-glow bg-card/70 ring-foreground/10 rounded-xl p-3 ring-1 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 px-1">
        <h2
          id="followers-strip-heading"
          className="text-sm font-medium">
          {isFallback ? "Find your circle" : "Your followers"}
        </h2>
        <Link
          href="/profile"
          className="text-muted-foreground hover:text-foreground text-xs hover:underline">
          {isFallback ? "Your profile" : "View all"}
        </Link>
      </div>

      {members.length === 0 ?
        <p className="text-muted-foreground px-1 pt-2 pb-1 text-sm">
          No one has joined yet. Share SnapCircle with a friend.
        </p>
      : <ul className="mt-2 flex gap-3 overflow-x-auto px-1 pb-1">
          {members.map((member) => (
            <li
              key={member.id}
              className="shrink-0">
              <Link
                href={`/profile/${member.id}`}
                title={member.name}
                className="group flex w-16 flex-col items-center gap-1">
                <Avatar
                  size="lg"
                  className="ring-background size-12 ring-2 transition-transform group-hover:scale-105">
                  {member.image && (
                    <AvatarImage
                      src={member.image}
                      alt={`${member.name} avatar`}
                    />
                  )}
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <span className="w-full truncate text-center text-xs">
                  {getFirstName(member.name)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      }
    </section>
  );
};

export default FollowersStrip;
