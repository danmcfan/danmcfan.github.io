export type Social = {
  kind: "github" | "linkedin";
  href: string;
};

export const socials: Social[] = [
  { kind: "github", href: "https://github.com/danmcfan" },
  { kind: "linkedin", href: "https://www.linkedin.com/in/daniel-c-obrien/" },
];
