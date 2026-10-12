export type Social = {
  kind: "github" | "linkedin" | "resume";
  label: string;
  href: string;
  /** Saved as a file instead of opened in a new tab. */
  download?: string;
};

export const socials: Social[] = [
  { kind: "github", label: "GitHub", href: "https://github.com/danmcfan" },
  { kind: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/daniel-c-obrien/" },
  {
    kind: "resume",
    label: "Résumé (PDF)",
    href: "/Daniel_OBrien_Resume.pdf",
    download: "Daniel_OBrien_Resume.pdf",
  },
];
