import { PostList } from "../components/blog/PostList";
import { posts } from "../data/posts";
import { usePageTitle } from "../lib/usePageTitle";

export function BlogPage() {
  usePageTitle("Adventure Log");

  return <PostList posts={posts} />;
}
