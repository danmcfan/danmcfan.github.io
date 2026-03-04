import { type JSX } from "solid-js";

import { NavBar } from "../components/navigation/NavBar";
import { QuestDivider } from "../components/ornaments/QuestDivider";

type LayoutProps = {
  children: JSX.Element;
};

export function Layout(props: LayoutProps) {
  return (
    <div class="min-h-dvh bg-linear-to-b from-emerald-950 to-emerald-900 text-emerald-50 overscroll-none">
      <div class="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-6 py-8 md:px-10">
        <header class="mb-8 space-y-4 border-b border-emerald-700/70 pb-6">
          <p class="font-serif text-sm tracking-[0.2em] text-emerald-300 uppercase">
            The Sorcery of Software Engineering
          </p>
          <h1 class="font-serif text-3xl font-bold text-emerald-50 md:text-4xl">
            Danny O&apos;Brien
          </h1>
          <NavBar />
        </header>

        <main class="flex-1">{props.children}</main>
      </div>
    </div>
  );
}
