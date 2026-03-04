export type Social = {
  kind: "github" | "linkedin" | "x";
  href: string;
};

export const socials: Social[] = [
  { kind: "github", href: "https://github.com/danmcfan" },
  { kind: "x", href: "https://x.com/dannyobriendev" },
  { kind: "linkedin", href: "https://www.linkedin.com/in/daniel-c-obrien/" },
];
