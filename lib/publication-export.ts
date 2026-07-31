import type { WorkspaceState } from "@/lib/workspace-model";

const headers = [
  "Fecha programada",
  "Canal",
  "Estado",
  "Campaña",
  "Título",
  "Formato",
  "Copy",
] as const;

function protectSpreadsheetFormula(value: string) {
  return /^[\t\r ]*[=+\-@]/.test(value) ? `'${value}` : value;
}

function csvCell(value: string) {
  const protectedValue = protectSpreadsheetFormula(value);
  return `"${protectedValue.replaceAll('"', '""')}"`;
}

export function buildPublicationCsv(state: WorkspaceState) {
  const rows = [...state.publishingTasks]
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .map((task) => {
      const content = state.content.find((item) => item.id === task.contentId);
      const campaign = state.campaigns.find(
        (item) => item.id === content?.campaignId,
      );

      return [
        task.scheduledAt,
        task.channel,
        task.status,
        campaign?.name ?? "",
        content?.title ?? "",
        content?.format ?? "",
        task.copy,
      ];
    });

  return `\uFEFF${[headers, ...rows]
    .map((row) => row.map((value) => csvCell(String(value))).join(";"))
    .join("\r\n")}`;
}

export function publicationExportFilename(now = new Date()) {
  return `plan-publicaciones-${now.toISOString().slice(0, 10)}.csv`;
}
