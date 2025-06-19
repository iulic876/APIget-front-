export function parseOpenApiJson(raw: string) {
  try {
    const json = JSON.parse(raw);

    if (!json.paths) return [];

    const results = [];

    for (const path in json.paths) {
      const methods = json.paths[path];
      for (const method in methods) {
        const operation = methods[method];
        results.push({
          id: `${method.toUpperCase()} ${path}`,
          method: method.toUpperCase(),
          path,
          summary: operation.summary || "",
          tag: operation.tags?.[0] || "",
        });
      }
    }

    return results;
  } catch (err) {
    console.error("❌ Invalid OpenAPI JSON:", err);
    return [];
  }
}
