import { notFound } from "next/navigation";

import db from "@/db";
import { eq } from "drizzle-orm";
import { posts } from "@/db/schema";

interface PostShowProps {
  postId: number;
}

export default async function PostShow({ postId }: PostShowProps) {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });

  if (!post) {
    notFound();
  }
  return (
    <div className="m-4">
      <h1 className="text-2xl font-bold my-2">{post.title}</h1>
      <p className="p-4 border rounded">{post.content}</p>
    </div>
  );
}
