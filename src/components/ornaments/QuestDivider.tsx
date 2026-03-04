type QuestDividerProps = {
  label?: string;
};

export function QuestDivider(props: QuestDividerProps) {
  return (
    <div
      class="flex items-center gap-3 text-xs tracking-[0.25em] text-emerald-300/80 uppercase"
      aria-hidden="true"
    >
      <span class="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></span>
      <span>{props.label ?? "quest marker"}</span>
      <span class="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></span>
    </div>
  );
}
