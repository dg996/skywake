import { literals, ways } from "./pattern.ts";

const encoder = new TextEncoder();

export function gramsOf(text: string): string {
  const bytes = encoder.encode(text.toLowerCase());
  const seen = new Set<number>();
  for (let i = 0; i + 2 < bytes.length; i++) {
    seen.add((bytes[i]! << 16) | (bytes[i + 1]! << 8) | bytes[i + 2]!);
  }
  return [...seen].map((gram) => gram.toString(16).padStart(6, "0")).join(" ");
}

function gramList(text: string): string[] {
  const grams = gramsOf(text);
  return grams ? grams.split(" ") : [];
}

export function neededGrams(pattern: string): string[][] | null {
  const needs: string[][] = [];
  for (const way of ways(pattern)) {
    const grams = [...new Set(literals(way).flatMap(gramList))];
    if (grams.length === 0) return null;
    needs.push(grams);
  }
  return needs;
}
