export type Post = {
  title: string;
  date: string;
  excerpt: string;
  href: string;
};

export const posts: Post[] = [
  {
    title: "Cracking Open the Black Box",
    date: "2026-03-04",
    excerpt:
      "When a codebase is so jumbled and complex that it's impossible to understand, how do you start to untangle it?",
    href: "#",
  },
];
