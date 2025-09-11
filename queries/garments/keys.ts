export const garmentsKeys = {
  all: () => ["garments"] as const,
  list: (type?: string) => [...garmentsKeys.all(), "list", type || ""] as const,
  add: (type?: string) => [...garmentsKeys.all(), "add", type || ""] as const,
};
