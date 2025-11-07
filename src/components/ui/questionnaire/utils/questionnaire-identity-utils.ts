//TODO: ideally this logic lives on the server side.

// Identity verification expires after 1 year
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

/**
 * Checks if a user's identity verification has expired.
 * Identity verification expires after 1 year from the last verification date.
 * @param identityUpdatedTime - The timestamp when the identity was last verified
 * @returns true if the verification has expired (older than 1 year) or if the time is invalid
 */
export function isIdentityVerificationExpired(
  identityUpdatedTime?: string | Date,
): boolean {
  if (!identityUpdatedTime) {
    return true;
  }
  return Date.now() - new Date(identityUpdatedTime).getTime() > ONE_YEAR_MS;
}
