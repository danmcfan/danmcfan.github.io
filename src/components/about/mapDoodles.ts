import type { Landmark } from "../../data/positions";

/** Landmark doodles, drawn around (0, 0) in roughly a 36px box. */
export const landmarkPaths: Record<Landmark, string> = {
  tower:
    "M-7 16 V-5 L-4 -9 V-15 H4 V-9 L7 -5 V16 Z M0 -15 V-22 L6 -20 L0 -18 M-4 -1 H-1 M1 -1 H4 M-4 5 H-1 M1 5 H4 M-4 11 H-1 M1 11 H4 M-16 16 H16",
  lighthouse:
    "M-5 14 L-3 -8 H3 L5 14 Z M-5 -8 H5 M-3 -8 V-13 H3 V-8 M-3 -13 L0 -17 L3 -13 M-4 1 L4 -3 M-4 8 L5 4 M6 -12 L13 -15 M6 -9 L13 -8 M-16 17 C -12 14, -8 20, -4 17 S 4 14, 8 17 S 14 20, 17 17",
  keep: "M-13 16 V-3 H-10 V-7 H-6 V-3 H-2 V-7 H2 V-3 H6 V-7 H10 V-3 H13 V16 Z M-4 16 V9 C -4 4, 4 4, 4 9 V16 M-8 3 V6 M8 3 V6 M0 -7 V-16 L6 -14 L0 -12 M-17 16 H17",
  windmill:
    "M-5 16 L-3 -3 H3 L5 16 Z M0 -6 L-11 -16 L-8 -18 Z M0 -6 L10 -16 L12 -13 Z M0 -6 L11 4 L8 6 Z M0 -6 L-10 5 L-12 2 Z M-1 16 V11 H1 V16 M-17 16 C -10 13, 10 13, 17 16",
  village:
    "M-15 16 V2 L-9 -5 L-3 2 V16 Z M-2 16 V-3 L5 -11 L12 -3 V16 Z M3 16 V10 H7 V16 M-11 7 H-7 M8 -14 V-9 M-17 16 H17",
  ruins:
    "M-12 16 V-6 M-7 16 V-6 M-14 -6 H-5 M-14 -9 H-5 M1 16 V4 L3 1 L5 5 V16 M9 16 V9 L12 6 L14 9 V16 M-17 16 H17 M-2 16 L0 13 L3 16",
  camp: "M-12 15 L0 -9 L12 15 Z M0 -9 V15 M-3 15 L0 7 L3 15 M0 -9 V-16 L6 -14 L0 -12 M-16 15 H16 M10 10 L14 15 M14 10 L10 15",
};

export type SceneryKind = "mountains" | "pines" | "hills" | "waves" | "tree";

export const sceneryPaths: Record<SceneryKind, string> = {
  mountains: "M-16 10 L-6 -9 L0 1 L5 -5 L16 10 M-6 -9 L-3 -3 L-6 -4 L-8 -3 Z M5 -5 L7 -2 M-12 6 L-10 3 M8 6 L10 4",
  pines: "M-6 -10 L-11 2 H-8 L-12 8 H0 L-4 2 H-1 Z M-6 8 V12 M6 -6 L2 4 H4 L1 9 H11 L8 4 H10 Z M6 9 V12",
  hills: "M-16 7 C -10 -4, -3 -4, 2 7 M-3 7 C 2 0, 9 -2, 16 7 M-10 2 L-9 4 M7 1 L8 3",
  waves: "M-14 -2 C -11 -5, -8 1, -5 -2 S 1 -5, 4 -2 S 10 1, 13 -2 M-10 5 C -7 2, -4 8, -1 5 S 5 2, 8 5",
  tree: "M0 12 V2 M-7 1 C -11 -4, -6 -12, 0 -11 C 6 -12, 11 -4, 7 1 C 4 4, -4 4, -7 1 Z",
};

export const compassPath =
  "M0 -15 L3 -3 L0 0 L-3 -3 Z M0 15 L3 3 L0 0 L-3 3 Z M-15 0 L-3 -3 L0 0 L-3 3 Z M15 0 L3 -3 L0 0 L3 3 Z M0 -10 A10 10 0 1 1 -0.1 -10";
