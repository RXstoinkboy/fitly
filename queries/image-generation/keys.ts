export const generatedKeys = {
  all: () => ["generated"] as const,
  list: (type?: string) =>
    [...generatedKeys.all(), "list", type || ""] as const,
  add: (type?: string) => [...generatedKeys.all(), "add", type || ""] as const,
};
