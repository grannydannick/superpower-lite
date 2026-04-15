/**
 * OOS supplement replacement mapping.
 *
 * When a recommended supplement is out of stock, the lookup hook will try
 * each alternative product ID in order and return the first one that is
 * in stock.
 *
 * Keys are the Shopify product ID of the *original* recommended supplement.
 * Values are ordered arrays of alternative Shopify product IDs.
 *
 * https://docs.google.com/spreadsheets/d/1Itkfb9Aab3sF3T85mlJmKymv_gCRztuEwDHYL_1rCWc/edit?gid=0#gid=0
 */

type SupplementAlternatives = Record<string, string[]>;

export const SUPPLEMENT_ALTERNATIVES: SupplementAlternatives = {
  // O.N.E. Omega → OmegaAvail TG1000, OmegaAvail Hi-Po
  '9704744386881': ['10185186640193', '10185184444737'],

  //  PE Ubiquinol-QH -> Thorne CoQ10 -> DFH CoQnol 200
  '10005650440513': ['8802371338561', '10191748792641'],

  // Magnesium Glycinate → DFH Mag Glycinate Complex, Thorne Mag Bisglycinate
  '9439914393921': ['9657523208513', '10042886684993'],

  // CholestePure → Thorne Metabolic Health (skipping combo alt per decision)
  '10087551107393': ['10193291608385'],

  // PureGenomics UltraMultivitamin → PE O.N.E. Multivitamin, Thorne Basic Nutrients 2/Day
  '9690945716545': ['10193340268865', '8802369143105'],

  // Berberine UltraSorb → DFH GlucoSupreme, Thorne Berberine
  '9747209486657': ['9569397801281', '8802369339713'],

  // Ashwagandha → , Thorne Ashwagandha 120mg
  '9439967314241': ['10042887471425'],

  // Creatine → DFH Creatine MonoHydrate Powder, Thorne Creatine
  '10165106344257': ['10191865348417', '8802372026689'],

  // Probiotic 50B → PE Probiotic G.I., DFH ProbioMed 50
  '9747237077313': ['9765288739137', '9855483674945'],

  // G.I. Integrity → DFH GI Revive, Thorne GI Relief
  '9752109285697': ['9568496124225', '8802373697857'],

  // Vitamin D Supreme → PE Vitamin D3 & K2 4000 IU, Quicksilver D3K2
  '9657492373825': ['10165113651521', '8692303692097'],

  // FiberMend → PE PureLean Fiber, DFH Fiber Prebiotic Complete
  '8802373402945': ['9580468437313', '9560264507713'],

  // Cinnamon WS → DFH GlucoSupreme Herbal, Quicksilver GLP-1 Amplifier
  '9743587836225': ['9569397801281', '10193330176321'],

  // OptiFerin-C → DFH Ferrochel, Thorne Advanced Iron Complex
  '9763529032001': ['10193287774529', '8802373271873'],

  // Red Yeast Rice + CoQ10 → DFH Red Yeast Rice
  '8802379661633': ['10193286693185'],

  // Ligament Restore → DFH ArthroSoothe, Thorne Joint Support Nutrients
  '9763525067073': ['10193284366657', '8802374877505'],

  // Calcium-D-Glucarate → DFH Calcium D-Glucarate
  '9937474715969': ['9691162444097'],

  // DIMPro → DFH DIM Evail (Alt 2 Thorne DIM Advantage not on marketplace)
  '10165106639169': ['10192958193985'],

  // Boron → DFH Libido Stim
  '9141689024833': ['10042621722945'],
};
