import { FormAddressInput } from '@/types/address';

/**
 * Formats a FHIR Address as a string.
 * @param address The address to format.
 * @param options Optional address format options.
 * @returns The formatted address string.
 */
export function formatAddress(address: any, options?: any): string {
  // TODO
  const builder = [];

  if (address?.line) {
    builder.push(...address.line);
  }

  if (address?.city || address?.state || address?.postalCode) {
    const cityStateZip = [];
    if (address?.city) {
      cityStateZip.push(address.city);
    }
    if (address?.state) {
      cityStateZip.push(address.state);
    }
    if (address?.postalCode) {
      cityStateZip.push(address.postalCode);
    }
    builder.push(cityStateZip.join(', '));
  }

  if (address?.use && (options?.all || options?.use)) {
    builder.push('[' + address.use + ']');
  }

  return builder.join(options?.lineSeparator || ', ').trim();
}

/**
 * Returns a number representing years since a date
 * @param date the date to calculate time from
 * @returns a number of years since the input date
 */
export function yearsSinceDate(date: string): number {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const millisecondsPerYear = 1000 * 60 * 60 * 24 * 365.25;
  return diff / millisecondsPerYear;
}

export function isSameFormAddressInput(
  a: FormAddressInput,
  b: FormAddressInput,
): boolean {
  return (
    a.city.toLowerCase() === b.city.toLowerCase() &&
    a.state.toLowerCase() === b.state.toLowerCase() &&
    a.postalCode === b.postalCode &&
    a.line1.toLowerCase() === b.line1.toLowerCase()
  );
}

export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.substring(1);
}
