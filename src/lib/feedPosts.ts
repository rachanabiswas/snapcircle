import prisma from "@/lib/dbClient/prisma";

import type { PostCardPost } from "@/components/Feed/PostCard";

export const FEED_PAGE_SIZE = 20;
export const FEED_POPULAR_SIZE = 3;

const toPostCardPost = (
  post: {
    id: string;
    content: string;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    author: { id: string; name: string; image: string | null; email: string };
    _count: { likes: number; replies: number };
    likes: { id: string }[];
  },
  currentUserId: string,
  popularIds: string[],
): PostCardPost => ({
  id: post.id,
  content: post.content,
  imageUrl: post.imageUrl,
  createdAt: post.createdAt.toISOString(),
  updatedAt: post.updatedAt.toISOString(),
  author: {
    id: post.author.id,
    name: post.author.name,
    image: post.author.image,
    email: post.author.email,
  },
  likeCount: post._count.likes,
  replyCount: post._count.replies,
  liked: post.likes.length > 0,
  isOwner: post.author.id === currentUserId,
  isPopular: popularIds.includes(post.id),
});

const getPopularIds = async (): Promise<string[]> => {
  const rows = await prisma.post.findMany({
    where: { parentId: null },
    orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
    take: FEED_POPULAR_SIZE,
    select: { id: true },
  });
  return rows.map((row) => row.id);
};

export const getFeedPopular = async () => {
  return prisma.post.findMany({
    where: { parentId: null },
    orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
    take: FEED_POPULAR_SIZE,
    include: {
      author: { select: { name: true } },
      _count: { select: { likes: true } },
    },
  });
};

export const getFeedPage = async (
  currentUserId: string,
  cursor: string | null,
): Promise<{
  posts: PostCardPost[];
  nextCursor: string | null;
}> => {
  // IDs are random generateId() strings, so the cursor must go through
  // Prisma's cursor mode (row-level anchor), not an "id < cursor" comparison.
  const rows = await prisma.post.findMany({
    where: { parentId: null },
    orderBy: { createdAt: "desc" },
    take: FEED_PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: { select: { id: true, name: true, image: true, email: true } },
      _count: { select: { likes: true, replies: true } },
      likes: {
        where: { userId: currentUserId },
        select: { id: true },
      },
    },
  });

  const nextCursor =
    rows.length > FEED_PAGE_SIZE ? rows[FEED_PAGE_SIZE].id : null;
  const pageRows = rows.slice(0, FEED_PAGE_SIZE);

  const popularIds = await getPopularIds();

  return {
    posts: pageRows.map((post) =>
      toPostCardPost(post, currentUserId, popularIds),
    ),
    nextCursor,
  };
};
