export type Project = {
  icon: "gamepad" | "sprout" | "cpu" | "check-check";
  name: string;
  description: string;
  href: string;
  tags: string[];
};

export const projects: Project[] = [
  {
    icon: "gamepad",
    name: "Pixel Arcade",
    description: "Pixel art classic arcade machines within a browser game engine.",
    tags: ["Go", "WebAssembly", "Ebitengine"],
    href: "https://arcade.dannyobrien.dev",
  },
  {
    icon: "sprout",
    name: "Oh Green World",
    description:
      "Predicts how green the land is from soil and climate data, comparing observed and predicted NDVI on a web map.",
    tags: ["Python", "Earth Engine", "React", "MapLibre"],
    href: "https://green.dannyobrien.dev",
  },
  {
    icon: "cpu",
    name: "Layers of Abstraction",
    description:
      "A logic-gate puzzle game. Start with only NAND and build up NOT, AND, OR and beyond, one truth table at a time.",
    tags: ["TypeScript", "SolidJS", "Tailwind"],
    href: "https://abstract.dannyobrien.dev",
  },
  {
    icon: "check-check",
    name: "Read State",
    description:
      "A demo based on Discord's Read State service rewrite from Go to Rust, tracking which messages each user has read.",
    tags: ["Rust", "Go", "Python", "Odin"],
    href: "https://read-state.dannyobrien.dev",
  },
];
