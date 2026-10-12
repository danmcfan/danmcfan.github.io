import { onMount } from "solid-js";

const siteName = "Danny O'Brien";

export function usePageTitle(page?: string) {
  onMount(() => {
    document.title = page ? `${page} · ${siteName}` : siteName;
  });
}
