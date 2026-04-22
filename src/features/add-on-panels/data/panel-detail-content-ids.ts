const PANEL_DETAIL_ITEM_IDS = new Set([
  'v2-advanced-cardio-bundle-march-2026-quest',
  'v2-lipoprotein-a-march-2026-quest',
  'v2-oxldl-march-2026-quest',
  'v2-adma-sdma-quest',
  'v2-metabolic-health-complete-march-2026-quest',
  'v2-weight-resistance-march-2026-quest',
  'v2-metabolic-core-march-2026-quest',
  'v2-womens-health-march-2026-quest',
  'v2-womens-hormones-march-2026-quest',
  'v2-fertility-and-family-planning-march-2026-quest',
  'v2-autoimmunity-march-2026-quest',
  'v2-thyroid-march-2026-quest',
  'v2-inflamation-march-2026-quest',
  'v2-celiac-disease-march-2026-quest',
  'v2-mens-health-complete-march-2026-quest',
  'v2-mens-health-core-march-2026-quest',
  'v2-mens-prostate-health-march-2026-quest',
  'v2-nutrients-bundle-quest',
  'v2-vitamins-march-2026-quest',
  'v2-minerals-march-2026-quest',
  'v2-methylation-bundle-quest',
  'v2-alzheimers-march-2026-quest',
  'v2-beta-amyloid-march-2026-quest',
  'v2-cardio-iq-apoe-genotype-march-2026-quest',
  'v2-ptau217-march-2026-quest',
  'v2-grail-galleri-multi-cancer-test-quest',
  'gut-microbiome-analysis',
  'mosaic-mycotox',
  'mosaic-toxic-metals',
  'v2-organ-age-bundle-quest',
  'v2-respiratory-allergy-panel-quest',
]);

function normalizePanelDetailKey(itemId: string) {
  return itemId.replace(/-(quest|bioref)$/, '');
}

const NORMALIZED_PANEL_DETAIL_ITEM_IDS = new Set<string>();
for (const itemId of PANEL_DETAIL_ITEM_IDS) {
  NORMALIZED_PANEL_DETAIL_ITEM_IDS.add(normalizePanelDetailKey(itemId));
}

export function hasPanelDetailContent(itemId: string) {
  return NORMALIZED_PANEL_DETAIL_ITEM_IDS.has(normalizePanelDetailKey(itemId));
}
