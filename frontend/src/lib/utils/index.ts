export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassDictionary
  | ClassArray;

type ClassDictionary = Record<string, boolean | null | undefined>;
type ClassArray = ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const pushValue = (value: ClassValue): void => {
    if (value === null || value === undefined || value === false) {
      return;
    }
    if (typeof value === "string" || typeof value === "number") {
      classes.push(String(value));
      return;
    }
    if (typeof value === "boolean") {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(pushValue);
      return;
    }
    for (const [key, enabled] of Object.entries(value)) {
      if (enabled) {
        classes.push(key);
      }
    }
  };

  inputs.forEach(pushValue);
  return classes.join(" ");
}
