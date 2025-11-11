/**
 * Generate TypeScript types from ts-server's OpenAPI spec
 *
 * This pulls the OpenAPI schema from the running ts-server
 * and generates type-safe client types for oRPC.
 *
 * Run with: yarn generate-types
 */
import fs from 'node:fs';

import openapiTS, { astToString } from 'openapi-typescript';

const API_URL = process.env.VITE_APP_API_URL || 'http://localhost:3001';
const specUrl = new URL(API_URL + '/rpc/spec.json');
const outputPath = './src/orpc/types.generated.ts';

console.log('🔄 Generating oRPC types from OpenAPI spec...');
console.log('📡 Spec URL:', specUrl.toString());

try {
  const ast = await openapiTS(specUrl);
  const contents = astToString(ast);

  // Ensure the output directory exists
  const dir = outputPath.substring(0, outputPath.lastIndexOf('/'));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, contents);

  console.log('✅ Generated oRPC types:', outputPath);
  console.log('📝 You can now import types from @/orpc/types.generated');
} catch (error) {
  console.error('❌ Failed to generate types:', error);
  console.error('\nMake sure ts-server is running and accessible at:', API_URL);
  process.exit(1);
}
