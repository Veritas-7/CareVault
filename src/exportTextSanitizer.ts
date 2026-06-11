export function stripLocalPathsFromExportText(value: string | undefined) {
  return (value ?? "")
    .replace(/\/Users\/[^\s)]+/g, "[local path]")
    .replace(/[A-Za-z]:\\[^\s)]+/g, "[local path]");
}
