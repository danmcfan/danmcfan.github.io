import { For } from "solid-js";

import { type Post } from "../../data/posts";

type PostListProps = {
  posts: Post[];
};

export function PostList(props: PostListProps) {
  return (
    <ul class="space-y-4">
      <For each={props.posts}>
        {(post) => (
          <li class="rounded-lg border border-emerald-600/70 bg-emerald-900/50 hover:bg-emerald-700/70 transition-colors cursor-pointer p-4">
            <p class="text-xs tracking-wide text-emerald-200 uppercase">
              {post.date}
            </p>
            <a
              href={post.href}
              class="mt-1 block font-serif text-xl text-emerald-50 transition hover:text-amber-200"
            >
              {post.title}
            </a>
            <p class="mt-2 text-emerald-100">{post.excerpt}</p>
          </li>
        )}
      </For>
    </ul>
  );
}
