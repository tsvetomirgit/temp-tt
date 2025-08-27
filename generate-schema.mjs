// npm install openapi-schema-to-json-schema @apidevtools/json-schema-ref-parser js-yaml

import fs from "fs/promises";
import yaml from "js-yaml";
import { fromSchema } from "openapi-schema-to-json-schema";
import $RefParser from "@apidevtools/json-schema-ref-parser";

const inputFile = "openapi.yaml";          // <-- твоя OpenAPI файл
const outputFile = "standalone-schema.json";

async function main() {
  // 1. Четене на openapi.yaml
  const yamlContent = await fs.readFile(inputFile, "utf8");
  const openapiDoc = yaml.load(yamlContent);

  // 2. Взимаме всички schemas от components/schemas
  const schemas = openapiDoc.components?.schemas || {};
  if (Object.keys(schemas).length === 0) {
    throw new Error("❌ Не са намерени компоненти в components/schemas");
  }

  // 3. Конвертираме всеки в JSON Schema
  const jsonSchemas = {};
  for (const [name, schema] of Object.entries(schemas)) {
    jsonSchemas[name] = fromSchema(schema, {
      cloneSchema: true,
      supportPatternProperties: true,
    });
  }

  // 4. Създаваме общ schema с всички
  const rootSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    definitions: jsonSchemas,
  };

  // 5. Развързваме всички $ref
  const dereferenced = await $RefParser.dereference(rootSchema);

  // 6. Записваме финалния JSON Schema
  await fs.writeFile(outputFile, JSON.stringify(dereferenced, null, 2), "utf8");
  console.log(`✅ Готово! Standalone schema записан в ${outputFile}`);
}

main().catch(console.error);

// node generate-schema.mjs
