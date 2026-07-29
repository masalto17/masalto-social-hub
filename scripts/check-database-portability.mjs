import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const migrationsDirectory = fileURLToPath(
  new URL("../supabase/migrations/", import.meta.url),
);

const forbiddenPatterns = [
  {
    pattern: /\bcreate\s+extension\b/i,
    reason:
      "Las extensiones requieren una decision explicita de portabilidad y operacion.",
  },
  {
    pattern: /\b(?:vault|storage|realtime|supabase_functions|cron|net)\s*\./i,
    reason:
      "No se permiten esquemas de servicios opcionales o administrados en las migraciones del nucleo.",
  },
  {
    pattern: /\b(?:pg_net|pg_cron|http_request|http_get|http_post)\b/i,
    reason:
      "La base no debe realizar HTTP ni depender de jobs propietarios.",
  },
];

const allowedSupabaseAuthPatterns = [
  /\bauth\.users\b/i,
  /\bauth\.uid\s*\(\s*\)/i,
];

const files = (await readdir(migrationsDirectory))
  .filter((file) => file.endsWith(".sql"))
  .sort();

const violations = [];

for (const file of files) {
  const source = await readFile(join(migrationsDirectory, file), "utf8");
  const lines = source.split("\n");

  for (const [index, line] of lines.entries()) {
    for (const rule of forbiddenPatterns) {
      if (rule.pattern.test(line)) {
        violations.push(`${file}:${index + 1}: ${rule.reason}`);
      }
    }
  }

  const authReferences = source.match(/\bauth\.[a-z_]+(?:\s*\(\s*\))?/gi) ?? [];
  for (const reference of authReferences) {
    if (!allowedSupabaseAuthPatterns.some((pattern) => pattern.test(reference))) {
      violations.push(
        `${file}: referencia Auth no aprobada para el nucleo: ${reference}`,
      );
    }
  }
}

if (violations.length > 0) {
  console.error("La verificacion de portabilidad de base de datos fallo:\n");
  console.error(violations.map((violation) => `- ${violation}`).join("\n"));
  process.exit(1);
}

console.log(
  `Portabilidad verificada en ${files.length} migraciones: PostgreSQL + RLS + interfaz Auth estandar de Supabase.`,
);
