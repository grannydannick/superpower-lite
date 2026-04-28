/**
 * Strip em-dashes (per product preference — they read as AI-generated)
 * and inline citation markers like `[^1]` from protocol markdown content.
 * Shared between the web `ProtocolMarkdown` component and the PDF renderer
 * so output stays consistent across surfaces.
 */
export function sanitizeProtocolMarkdown(input: string): string {
  return input.replace(/—/g, ' -- ').replace(/\[\^\d+\]/g, '');
}
