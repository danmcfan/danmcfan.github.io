import { For } from "solid-js";

import type { Post } from "../../data/posts";
import { cn } from "../../lib/cn";
import { cardVariants } from "../ui/card";
import { InkUnderline } from "../ui/ink";

type PostListProps = {
  posts: Post[];
};

export function PostList(props: PostListProps) {
  return (
    <ul class="grid gap-5">
      <For each={props.posts}>
        {(post) => (
          <li>
            <a href={post.href} class={cn(cardVariants({ variant: "notice" }), "group gap-1 p-5 no-underline")}>
              <span class="font-mono text-xs text-ink-soft">{post.date}</span>
              <span class="relative self-start font-display text-2xl">
                {post.title}
                <InkUnderline />
              </span>
              <span class="mt-1">{post.excerpt}</span>
            </a>
          </li>
        )}
      </For>
    </ul>
  );
}
