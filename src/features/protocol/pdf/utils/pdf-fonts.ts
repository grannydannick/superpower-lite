import { Font } from '@react-pdf/renderer';

// Vite resolves these imports to asset URLs at build time.
// Use TTF format — @react-pdf/renderer handles TTF more reliably than WOFF2.
import bookFontUrl from '@/assets/fonts/NBInternationalPro/nbinternationalproboo-webfont.ttf';
import bookItalicFontUrl from '@/assets/fonts/NBInternationalPro/nbinternationalprobooita-webfont.ttf';
import monoFontUrl from '@/assets/fonts/NBInternationalPro/nbinternationalpromono-webfont.ttf';
import regularFontUrl from '@/assets/fonts/NBInternationalPro/nbinternationalproreg-webfont.ttf';

/**
 * Register NB International Pro fonts for @react-pdf/renderer.
 *
 * The web app uses "Book" as the primary sans-serif (font-sans) and
 * "Regular" as the bolder weight (font-proreg). We mirror that here:
 *   - Book  -> fontWeight "normal"
 *   - Regular -> fontWeight "bold"
 *
 * Mono is registered as a separate family for code/data blocks.
 */
Font.register({
  family: 'NBInternationalPro',
  fonts: [
    { src: bookFontUrl, fontWeight: 'normal' },
    { src: bookItalicFontUrl, fontWeight: 'normal', fontStyle: 'italic' },
    { src: regularFontUrl, fontWeight: 'bold' },
  ],
});

Font.register({
  family: 'NBInternationalProMono',
  fonts: [{ src: monoFontUrl, fontWeight: 'normal' }],
});

// Disable word hyphenation — keeps text cleaner in the PDF
Font.registerHyphenationCallback((word) => [word]);

export const FONT_FAMILY = 'NBInternationalPro';
export const FONT_FAMILY_MONO = 'NBInternationalProMono';
