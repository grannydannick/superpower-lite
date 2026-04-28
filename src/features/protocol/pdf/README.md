# Protocol PDF

Client-side PDF export of a user's health protocol. Renders a downloadable PDF
containing a cover page, one section per goal (with biomarker tables and
recommended actions), and a deduplicated citations index.

> ⚠️ **Disclaimer**
>
> This was an AI-prototyped feature built with Claude to ship quickly and gather
> usage statistics. The code is a bit messy in places — naming, file
> organisation, and styling helpers were not heavily refactored. Treat this
> module as a spike. If usage justifies it, expect to clean it up before
> investing further.

## Entry point

```ts
import { generateProtocolPdf } from '@/features/protocol/pdf';

await generateProtocolPdf(protocol, observationIndex);
```

`generateProtocolPdf` builds the React-PDF document tree, renders it to a
`Blob`, and triggers a browser download named
`superpower-protocol-<YYYY-MM-DD>.pdf`. It is dynamically imported from
`protocol-dashboard.tsx` so the PDF bundle (fonts + `@react-pdf/renderer`) is
only loaded when a user clicks the export button.

Usage is tracked via three PostHog events:

- `protocol_pdf_download_clicked` — fires on every click of the download button
  (funnel top), with `protocol_id`
- `protocol_pdf_generated` — success, with `protocol_id` and `goal_count`
- `protocol_pdf_failed` — failure, with `protocol_id` and a `reason`
  (`biomarkers_unavailable` or `generation_error`)

## How it fits together

```
generateProtocolPdf (utils/pdf-generator.ts)
  └── ProtocolPdfDocument (components/protocol-pdf-document.tsx)
        ├── PdfCoverPage              — title, date, goal summary
        ├── PdfGoalSection × N        — one A4 page (or more) per goal
        │     ├── PdfBiomarkerTable
        │     ├── renderMarkdownToPdf — for description / impactContent
        │     └── PdfActionCard × N   — primary + additional actions
        └── PdfCitationsPage          — deduplicated references index
```

### Data flow

1. `generateProtocolPdf` receives a `Protocol` and an
   `observationIndex: Map<string, Biomarker>` (built upstream by
   `useObservationBiomarkerIndex`).
2. `resolveBiomarkersByGoal` walks each goal's `biomarkers` field — these are
   FHIR-style `"Observation/<uuid>"` references — and resolves them to
   `PdfBiomarker` shapes via the index. Unresolved references are logged but do
   not throw.
3. The resolved `{ protocol, biomarkersByGoal }` is passed to
   `ProtocolPdfDocument`, then handed to `pdf().toBlob()` for rendering.
4. `downloadBlob` triggers the browser save.

## Markdown rendering

Goal `description` and `impactContent` come in as markdown strings.
`utils/markdown-to-pdf.tsx`:

1. Sanitises input with `sanitizeProtocolMarkdown` (sibling util in
   `../../utils`).
2. Parses to mdast via `unified().use(remarkParse).use(remarkGfm)`.
3. Walks the AST and emits `@react-pdf/renderer` `Text` / `View` / `Link`
   elements (NOT React DOM elements — easy to mix up).

Supported nodes include paragraphs, headings, lists, links, inline code, code
blocks, blockquotes, and GFM tables. Unknown nodes fall through to plain text.

## Styling

- `utils/pdf-styles.ts` — shared spacing scale, colour palette, font sizes, and
  page-level styles. Mirrors the web app's Tailwind tokens loosely; it is not
  generated from them.
- `utils/pdf-fonts.ts` — registers NB International Pro (Book / Regular /
  Italic / Mono) with `@react-pdf/renderer`. Imported for side effects from
  `protocol-pdf-document.tsx`. TTF files come from `src/assets/fonts/...` and
  Vite resolves them to asset URLs at build time. Hyphenation is disabled.

## Tests

`utils/markdown-to-pdf.test.tsx` covers the markdown → PDF element mapping. The
PDF components themselves are not unit-tested — visual verification is the
expected workflow until the feature is promoted out of prototype status.

## Known rough edges

- Inline styles are mixed with `pdfStyles` helpers inconsistently across
  components.
- `PdfGoalSection` is a single long component with several inline sub-views.
- Section titles ("What We Found", "How You Might Be Feeling", etc.) are
  hard-coded in `PdfGoalSection` rather than coming from the protocol payload.
- Citation deduplication is by lowercased title only — no URL/DOI normalisation.
