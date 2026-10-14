import { Separator } from "@/components/shadcnui/separator";

const HelpSection = () => {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div>
        <p className="font-medium">Help center</p>
        <p className="text-muted-foreground">
          Visit the feed to post, reply, and like. Use notifications to track
          activity. For issues, contact support via your admin.
        </p>
      </div>
      <Separator />
      <div>
        <p className="font-medium">Terms & privacy</p>
        <p className="text-muted-foreground">
          Your posts are visible to all signed-in users. Deleting your account
          removes your profile, posts, likes, and notifications permanently.
        </p>
      </div>
      <Separator />
      <div>
        <p className="font-medium">About</p>
        <p className="text-muted-foreground">
          SnapCircle — a minimal social app built with Next.js, Better Auth, and
          Prisma.
        </p>
      </div>
    </div>
  );
};

export default HelpSection;
