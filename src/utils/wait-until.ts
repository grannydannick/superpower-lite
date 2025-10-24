export async function waitUntil(
  predicate: () => Promise<boolean>,
  { tries = 6, delay = 300 } = {},
) {
  for (let i = 0; i < tries; i++) {
    if (await predicate()) return true;
    await new Promise((r) => setTimeout(r, delay));
  }
  return false;
}
