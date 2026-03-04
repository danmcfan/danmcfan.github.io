export type Project = {
  icon: "gamepad" | "dices";
  name: string;
  description: string;
  href: string;
};

export const projects: Project[] = [
  {
    icon: "gamepad",
    name: "Pixel Arcade",
    description:
      "Pixel art classic arcade machines within a browser game engine. Written with Go using WebAssembly.",
    href: "https://arcade.dannyobrien.dev",
  },
  {
    icon: "dices",
    name: "Settlers of Catan",
    description:
      "A Settlers of Catan web application for online play with friends and bots. Written with SolidJS and Go.",
    href: "https://catan.dannyobrien.dev",
  },
];
