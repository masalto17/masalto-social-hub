type Cell = unknown;

export type EntradaWebSalesSummary = {
  buyerRows: number;
  totalTickets: number;
  rejectedRows: number;
  byDevice: Record<string, number>;
  byProvince: Record<string, number>;
  byLocality: Record<string, number>;
};

const requiredHeaders = [
  "apellido comprador",
  "nombre comprador",
  "cant entradas",
  "e mail comprador",
  "fono comprador",
  "localidad comprador",
  "provincia comprador",
  "dni pagador",
  "tipo de dispositivo",
] as const;

function normalize(value: Cell) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function category(value: Cell) {
  const normalized = String(value ?? "").trim();
  return normalized || "Sin informar";
}

function increment(target: Record<string, number>, key: string) {
  target[key] = (target[key] ?? 0) + 1;
}

export function summarizeEntradaWebSales(
  rows: Cell[][],
): EntradaWebSalesSummary {
  if (rows.length < 2) {
    throw new Error("El archivo no contiene filas de ventas.");
  }

  const headers = rows[0].map(normalize);
  const indexes = new Map(headers.map((header, index) => [header, index]));
  const missing = requiredHeaders.filter((header) => !indexes.has(header));

  if (missing.length > 0) {
    throw new Error(
      `Formato de EntradaWeb no reconocido. Faltan: ${missing.join(", ")}.`,
    );
  }

  const quantityIndex = indexes.get("cant entradas")!;
  const localityIndex = indexes.get("localidad comprador")!;
  const provinceIndex = indexes.get("provincia comprador")!;
  const deviceIndex = indexes.get("tipo de dispositivo")!;
  const summary: EntradaWebSalesSummary = {
    buyerRows: 0,
    totalTickets: 0,
    rejectedRows: 0,
    byDevice: {},
    byProvince: {},
    byLocality: {},
  };

  for (const row of rows.slice(1)) {
    if (row.every((value) => value === null || value === undefined || value === "")) {
      continue;
    }

    const quantity = Number(row[quantityIndex]);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      summary.rejectedRows += 1;
      continue;
    }

    summary.buyerRows += 1;
    summary.totalTickets += quantity;
    increment(summary.byDevice, category(row[deviceIndex]));
    increment(summary.byProvince, category(row[provinceIndex]));
    increment(summary.byLocality, category(row[localityIndex]));
  }

  if (summary.buyerRows === 0) {
    throw new Error("No se encontraron ventas válidas.");
  }

  return summary;
}
