export const modelsKeys = {
  all: () => ["models"] as const,
  list: () => [...modelsKeys.all(), "list"] as const,
  add: () => [...modelsKeys.all(), "add"] as const,
};
