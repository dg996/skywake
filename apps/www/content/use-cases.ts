// The use case guides, in the order they are listed. Their words are in
// messages.guides.items and each guide's own file under components/guides.
export type UseCase = { id: string; related: string[] };

export const useCases: UseCase[] = [
  { id: "knowledge-base", related: ["context-layer", "document-agents", "datasets"] },
  { id: "context-layer", related: ["knowledge-base", "sandboxes", "document-agents"] },
  { id: "sandboxes", related: ["coding-agents", "rl", "context-layer"] },
  { id: "coding-agents", related: ["sandboxes", "ci", "previews"] },
  { id: "document-agents", related: ["knowledge-base", "coding-agents", "datasets"] },
  { id: "rl", related: ["sandboxes", "datasets", "coding-agents"] },
  { id: "ci", related: ["coding-agents", "previews", "reference-data"] },
  { id: "previews", related: ["ci", "coding-agents", "document-agents"] },
  { id: "datasets", related: ["rl", "knowledge-base", "reference-data"] },
  { id: "reference-data", related: ["datasets", "ci", "rl"] },
];

export const findUseCase = (id: string) => useCases.find((item) => item.id === id);
