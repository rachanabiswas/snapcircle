import FollowListDialog, {
  type FollowListUser,
} from "@/components/Profile/FollowListDialog";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";

const ProfileStats = ({
  postsCount,
  likesReceived,
  followersCount,
  followingCount,
  followers,
  following,
  viewerId,
  emptyFollowers,
  emptyFollowing,
}: {
  postsCount: number;
  likesReceived: number;
  followersCount: number;
  followingCount: number;
  followers: FollowListUser[];
  following: FollowListUser[];
  viewerId: string;
  emptyFollowers: string;
  emptyFollowing: string;
}) => {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{postsCount}</CardTitle>
          <CardDescription>Posts</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{likesReceived}</CardTitle>
          <CardDescription>Likes received</CardDescription>
        </CardHeader>
      </Card>
      <FollowListDialog
        title="Followers"
        count={followersCount}
        users={followers}
        viewerId={viewerId}
        emptyMessage={emptyFollowers}
      />
      <FollowListDialog
        title="Following"
        count={followingCount}
        users={following}
        viewerId={viewerId}
        emptyMessage={emptyFollowing}
      />
    </div>
  );
};

export default ProfileStats;
