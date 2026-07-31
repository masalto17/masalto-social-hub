import { expect, test } from "@playwright/test";
import { summarizeEntradaWebSales } from "@/lib/entradaweb-sales";

const headers = [
  "Apellido Comprador",
  "Nombre Comprador",
  "Cant.\nEntradas",
  "E-mail Comprador",
  "Fono Comprador",
  "Localidad Comprador",
  "Provincia Comprador",
  "DNI Pagador",
  "Tipo de Dispositivo",
];

test("summarizes EntradaWeb rows without returning personal fields", () => {
  const summary = summarizeEntradaWebSales([
    headers,
    ["Ejemplo", "Uno", 2, "uno@example.com", 1, "Capital", "San Juan", 10, "Smartphone android"],
    ["Ejemplo", "Dos", 3, "dos@example.com", 2, "Rawson", "San Juan", null, "Desktop windows"],
    ["Inválido", "Tres", 0, "tres@example.com", 3, "Capital", "San Juan", 30, "Smartphone android"],
  ]);

  expect(summary).toEqual({
    buyerRows: 2,
    totalTickets: 5,
    rejectedRows: 1,
    byDevice: {
      "Smartphone android": 1,
      "Desktop windows": 1,
    },
    byProvince: { "San Juan": 2 },
    byLocality: { Capital: 1, Rawson: 1 },
  });
  expect(JSON.stringify(summary)).not.toContain("example.com");
});

test("rejects spreadsheets with a different schema", () => {
  expect(() =>
    summarizeEntradaWebSales([
      ["Nombre", "Entradas"],
      ["Ejemplo", 2],
    ]),
  ).toThrow(/Formato de EntradaWeb no reconocido/);
});
