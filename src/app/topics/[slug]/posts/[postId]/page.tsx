import Link from "next/link";
import db from "@/db";
import PostShow from "@/components/posts/post-show";
import CommentList from "@/components/comments/comment-list";
import CommentCreateForm from "@/components/comments/comment-create-form";
import paths from "@/paths";
import { Suspense } from "react";
import PostShowLoading from "@/components/posts/post-show-loading";

interface PostShowPageProps {
  params: {
    slug: string;
    postId: string;
  };
}

export default async function PostShowPage({ params }: PostShowPageProps) {
  const { slug, postId } = params;

  return (
    <div className="space-y-3">
      <Link className="underline decoration-solid" href={paths.topicShow(slug)}>
        {"< "}Back to {slug}
      </Link>
      <Suspense fallback={<PostShowLoading />}>
        <PostShow postId={parseInt(postId)} />
      </Suspense>
      <CommentCreateForm postId={parseInt(postId)} />
      <CommentList postId={parseInt(postId)} />
    </div>
  );
}

export async function generateStaticParams() {
  const topics = await db.query.topics.findMany({
    with: { posts: { columns: { id: true } } },
  });

  return topics.flatMap((topic) => {
    return topic.posts.map((post) => {
      return {
        postId: post.id,
        slug: topic.slug,
      };
    });
  });
}
