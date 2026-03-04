import { For } from "solid-js";

import gamepad from "./assets/gamepad.svg";
import map from "./assets/map.svg";
import github from "./assets/github.svg";
import linkedin from "./assets/linkedin.svg";

type LinkItem = {
  name: string;
  alt: string;
  href: string;
  src: string;
};

const links: LinkItem[] = [
  {
    name: "Arcade",
    alt: "A retro gamepad icon",
    href: "https://arcade.dannyobrien.dev",
    src: gamepad,
  },
  {
    name: "Catan",
    alt: "A map icon",
    href: "https://catan.dannyobrien.dev",
    src: map,
  },
  {
    name: "GitHub",
    alt: "A GitHub icon",
    href: "https://github.com/danmcfan",
    src: github,
  },
  {
    name: "LinkedIn",
    alt: "A LinkedIn icon",
    href: "https://www.linkedin.com/in/daniel-c-obrien/",
    src: linkedin,
  },
];

export function App() {
  return (
    <main class="flex flex-col items-center h-dvh gap-4 md:gap-8 p-8 md:p-16 bg-linear-to-b from-green-700 to-green-900 font-mono antialiased">
      <h1 class="text-center text-white text-4xl md:text-6xl font-bold text-shadow-[3px_3px_0px_rgba(0,0,0,1)] md:text-shadow-[4px_4px_0px_rgba(0,0,0,1)] select-none">
        Danny O'Brien
      </h1>
      <ul class="flex flex-col items-center w-full md:w-2xl md:gap-6 gap-4">
        <For each={links}>{(link) => <LinkButton {...link} />}</For>
      </ul>
    </main>
  );
}

function LinkButton(props: LinkItem) {
  return (
    <li class="relative flex flex-col items-center w-full">
      <a
        class="z-10 relative flex items-center w-full bg-white text-black text-lg rounded-lg border-black border-2 p-4 hover:translate-x-1 hover:translate-y-1"
        href={props.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          class="absolute left-4 size-10 md:size-12 select-none"
          src={props.src}
          alt={props.alt}
        />
        <span class="flex-1 ml-4 text-center font-bold text-xl md:text-2xl select-none">
          {props.name}
        </span>
      </a>
      <div class="absolute top-2 left-2 w-full h-16 md:h-17 bg-black rounded-lg"></div>
    </li>
  );
}
