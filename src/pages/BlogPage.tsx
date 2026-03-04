import { PostList } from "../components/blog/PostList";
import { QuestDivider } from "../components/ornaments/QuestDivider";
import { posts } from "../data/posts";

export function BlogPage() {
  return <PostList posts={posts} />;
}
