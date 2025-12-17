export function getOrganAgeBiomarkers<T extends { name: string }>(
  biomarkers: T[] | undefined | null,
): T[] {
  return (biomarkers ?? []).filter((b) =>
    b.name.toLowerCase().includes('organ age'),
  );
}

export function resolveRelatedBiomarkers<
  T extends { name: string; value?: any },
>(organAge: T, allBiomarkers: T[] | undefined | null): T[] {
  const latest = organAge?.value?.[organAge?.value?.length - 1];

  const titles = ((latest?.component ?? [])
    .map((c: any) => c.title)
    .filter(Boolean) ?? []) as string[];

  const all = allBiomarkers ?? [];

  return all.filter(
    (bm) =>
      titles.includes(bm.name) && !bm.name.toLowerCase().includes('organ age'),
  );
}
