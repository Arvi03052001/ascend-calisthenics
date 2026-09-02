export type Section = "home" | "weight" | "train";

export const SECTIONS: { id: Section; label: string; shortLabel: string }[] = [
  { id: "home", label: "Home", shortLabel: "Home" },
  { id: "weight", label: "Weight", shortLabel: "Weight" },
  { id: "train", label: "Train", shortLabel: "Train" },
];
