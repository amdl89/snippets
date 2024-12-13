import { redirect } from "next/navigation";

import { fetchPostsBySearchTerm } from "@/queries/posts";
import paths from "@/paths";

import PostList from "@/components/posts/post-list";

interface SearchPageProps {
  searchParams: {
    term: string;
  };
}

export default function SearchPage({
  searchParams: { term },
}: SearchPageProps) {
  if (!term) {
    redirect(paths.home());
  }

  return (
    <div>
      <PostList fetchData={() => fetchPostsBySearchTerm(term)} />
    </div>
  );
}
