export const services = [
  {
    id: 'dc00d932-2f50-41cc-86f5-7fcd1bd196da',
    name: 'Superpower Blood Panel',
    description:
      '63 biomarkers tested in a fully comprehensive blood panel. Get tested at home or a partner lab closest to you.',
    price: 23200,
    active: true,
    image: '/services/superpower_blood_panel.png',
    phlebotomy: true,
    items: [],
  },
  {
    id: '95b787ba-9bc3-4ede-ad7a-5a575e0795ab',
    name: '1-1 Advisory Call',
    description:
      'Get expert advice & health planning from the Superpower medical team.',
    price: 10000,
    active: true,
    image: '/services/1-1_advisory_call.png',
    phlebotomy: false,
    items: [],
  },
  {
    id: '4141b614-2690-4eab-a3b2-5c834815c8f2',
    name: 'Grail Galleri Multi Cancer Test',
    description:
      'Detect signals of over 50 types of cancers at their earliest, most treatable stages.',
    price: 101900,
    active: true,
    image: '/services/grail_galleri_multi_cancer_test.png',
    phlebotomy: true,
    items: [],
  },
  {
    id: '23bcdab2-e2e3-4986-9b03-cae729ac6463',
    name: 'Food & Environmental Allergy Testing',
    description:
      'Determine your allergy and sensitivity status to over 350+ foods and common allergens.',
    price: 27900,
    active: false,
    image: '/services/food_&_environmental_allergy_testing.png',
    phlebotomy: true,
    items: [],
  },
  {
    id: '841398c0-b129-43fc-a5d3-977f88250789',
    name: 'Environmental Toxins',
    description:
      'Know how heavy metals, pesticides, plastics, and other environmental toxins may be harming your health.',
    price: 35900,
    active: true,
    image: '/services/environmental_toxins.png',
    phlebotomy: false,
    items: [],
  },
  {
    id: 'a79045d6-9240-496a-94ae-cc73bb363769',
    name: 'Intestinal Permeability Panel',
    description:
      'This test assesses how well your intestinal lining is preventing harmful substances from entering your bloodstream.',
    price: 24900,
    active: false,
    image: '/services/intestinal_permeability_panel.png',
    phlebotomy: true,
    items: [],
  },
  {
    id: 'ed15a784-ae5c-46f4-a07c-e353a7d15aa9',
    name: 'PFAS Chemicals',
    description:
      'Know how environmental toxins like Perfluoroalkyl and Polyfluoroalkyls chemicals may be harming your health.',
    price: 31900,
    active: false,
    image: '/services/pfas_chemicals.png',
    phlebotomy: false,
    items: [],
  },
  {
    id: '458ff64c-7d29-42c2-a7ab-6983ad16d504',
    name: 'Continuous Glucose Monitor',
    description:
      'Track your blood sugar in real time to improve energy and metabolic health (each sensor lasts 14 days).',
    price: 12900,
    active: true,
    image: '/services/continuous_glucose_monitor.png',
    phlebotomy: false,
    items: [],
  },
  {
    id: '0a1e3922-d658-4d4c-949d-677fdef8a3f2',
    name: 'Custom Blood Panel',
    description:
      'Build your own blood panel and choose from dozens of laboratory tests covering hundreds of biomarkers.',
    price: 4500,
    active: false,
    image: '/services/custom_blood_panel.png',
    phlebotomy: true,
    items: [
      {
        id: 'b87204ff-4797-4b4a-8a44-0e227cc4b055',
        name: 'Apolipoprotein B (Apo B)',
        description:
          'Evaluates the concentration of apolipoprotein B, a primary protein in low-density lipoprotein (LDL), crucial for lipid metabolism assessment and cardiovascular risk stratification.',
        price: '8.25',
      },
      {
        id: '26236484-72cc-4bfa-9169-b7bf6eb0d59e',
        name: 'Thyroxine (T4) Free',
        description:
          'Quantifies levels of thyroxine (free T4), an essential thyroid hormone crucial for metabolism, growth, and energy regulation. Important for diagnosing thyroid disorders, monitoring thyroid medication dosage, and assessing thyroid function.',
        price: '7',
      },
      {
        id: 'b164d338-9d26-4a36-a0d6-596d2f775c89',
        name: 'Zinc',
        description:
          'Determines zinc concentration, vital for immune function, wound healing, and enzyme activity. Essential for diagnosing zinc deficiency and monitoring nutritional status.',
        price: '7',
      },
      {
        id: 'a31ad437-5155-41a9-898d-81df3b8464d5',
        name: 'Methylmalonic Acid (MMA) b12',
        description:
          'Quantifies Vitamin B12 levels, crucial for nerve health, red blood cell formation, and DNA synthesis. Important for diagnosing anemia and monitoring nutritional status.',
        price: '6',
      },
      {
        id: '584dbb1d-428c-469d-8c10-347ac87b85fb',
        name: 'Thyroid Cascade Panel',
        description:
          'Includes measurements of Thyroid-Stimulating Hormone (TSH) and Thyroid Peroxidase (TPO) antibodies. Crucial for evaluating thyroid health, diagnosing autoimmune thyroid diseases, and guiding thyroid disorder management.',
        price: '6',
      },
      {
        id: '271feb0c-f07e-42ee-a6d7-389765a4e39c',
        name: 'Iron',
        description:
          'Analyzes total iron, total iron binding capacity (TIBC), unsaturated iron-binding capacity (UIBC), and iron saturation. Integral for assessing iron status, identifying anemia types, and monitoring iron therapy effectiveness.',
        price: '5',
      },
      {
        id: '0d41d8d3-7b81-412d-ac31-b035cf7e27d4',
        name: 'OmegaCheck(TM) (EPA+DPA+DHA)',
        description:
          'Evaluates EPA, DPA, DHA, arachidonic acid/EPA ratio, omega-6/omega-3 ratio, omega-3 total, omega-6 total, arachidonic acid, linoleic acid. This comprehensive test is pivotal for assessing dietary intake and balance of essential fatty acids, crucial for cardiovascular health, inflammation control, and overall wellness.',
        price: '38',
      },
      {
        id: 'd9d571aa-31fb-4fe7-b43a-a6eb27a31bec',
        name: 'Testosterone,Free and Total',
        description:
          'Includes measurements of free testosterone and "testosterone, total." Vital for evaluating androgen status, diagnosing hormonal imbalances, and guiding treatment in reproductive health, libido, and muscle mass management.',
        price: '30',
      },
      {
        id: 'ff609169-da25-4aba-8a5d-768aa33b8572',
        name: 'Sex Hormone Binding Globulin (SHBG)',
        description:
          'Measures levels of Sex Hormone Binding Globulin (SHBG), a protein that binds estrogen and testosterone, crucial for assessing hormonal balance and health, particularly in conditions related to fertility, menopause, and androgen disorders.',
        price: '20',
      },
      {
        id: '1dd56573-1ee4-4b24-aa9d-9e1298b81a3b',
        name: 'FSH & LH',
        description:
          'Evaluates levels of Luteinizing Hormone (LH) and Follicle Stimulating Hormone (FSH), pivotal for reproductive system regulation, fertility assessment, and menstrual cycle monitoring.',
        price: '19',
      },
      {
        id: 'e0471810-c7ce-496c-81c6-6655903da3f1',
        name: 'Homocysteine',
        description:
          'Evaluates homocysteine levels, an amino acid associated with heart health, vascular disease risk, and essential for monitoring conditions related to B-vitamin metabolism.',
        price: '18',
      },
      {
        id: '2eda9143-4230-4b06-850a-298236c3079b',
        name: 'DHEA-S',
        description:
          'Assesses levels of DHEA-Sulfate (DHEA-S), an androgen that serves as a biomarker for adrenal function and is a precursor to sex steroids. Valuable for endocrine health surveillance and hormonal balance evaluation.',
        price: '16',
      },
      {
        id: 'd6b3221a-0153-4441-a5ce-94d482638be0',
        name: 'Ferritin',
        description:
          'Determines ferritin concentration, a crucial intracellular protein that stores iron, providing a window into iron metabolism and aiding in the diagnosis of anemia or iron overload conditions.',
        price: '7',
      },
      {
        id: '8b13dc5e-7365-486b-8e8a-0a14c6840dfe',
        name: 'Comprehensive Metabolic Panel',
        description:
          'Includes glucose, total protein, total globulin, albumin, globulin A/G ratio, total bilirubin, blood urea nitrogen (BUN), BUN/creatinine ratio, total carbon dioxide, chloride, aspartate aminotransferase (AST), alanine aminotransferase (ALT), alkaline phosphatase (ALP), sodium, creatinine, calcium, potassium, estimated glomerular filtration rate (eGFR). Essential for evaluating organ function and general health status.',
        price: '4',
      },
      {
        id: '25200a87-7728-4474-8721-4c611b514fd5',
        name: 'Uric Acid, Serum',
        description:
          'Determines uric acid concentration, crucial for diagnosing gout, monitoring kidney function, and assessing risk factors for cardiovascular disease and metabolic syndrome.',
        price: '2.75',
      },
      {
        id: 'e3bea9ed-288f-479f-a47b-f80dfd705aed',
        name: 'Lipid Panel',
        description:
          'Measures VLDL cholesterol, "cholesterol, total", HDL cholesterol, LDL cholesterol, triglycerides. Essential for evaluating cardiovascular risk, managing cholesterol levels, and guiding dietary and medical interventions.',
        price: '5',
      },
      {
        id: '0a043b56-cd52-4bc4-9271-7ce752f972bd',
        name: 'CBC With Differential/Plat',
        description:
          'Incorporates essential markers such as hematocrit, hemoglobin, mean cell volume (MCV), mean cell hemoglobin (MCH), mean corpuscular hemoglobin concentration (MCHC), red cell distribution width (RDW), platelet count, neutrophils, lymphocytes, monocytes, basophils, immature granulocytes, and reticulocytes. These metrics are pivotal for evaluating blood health and diagnosing a range of conditions.',
        price: '4',
      },
      {
        id: '9550d959-62e6-4980-94b4-3c5c3059f342',
        name: 'Hemoglobin A1c (HbA1c)',
        description:
          'Measures Hemoglobin A1c levels, an important indicator of average blood sugar control over the past three months, vital for diabetes management and monitoring.',
        price: '4',
      },
      {
        id: '37c1b1fa-5c8b-4a0e-888b-ddd1faee9978',
        name: 'Vitamin D, 25-Hydroxy',
        description:
          'Measures vitamin D concentration, essential for bone health, immune function, and overall well-being. Important for diagnosing vitamin D deficiency or insufficiency and guiding supplementation.',
        price: '15',
      },
      {
        id: '23c364f2-38c5-418f-8a73-274239ae8610',
        name: 'High-sensitivity C-reactive protein (hs-CRP)',
        description:
          'Determines the concentration of C-Reactive Protein (CRP), a marker of inflammation in the body. Essential for detecting infection, chronic inflammatory diseases, and assessing cardiovascular risk.',
        price: '12',
      },
      {
        id: 'bc2b3da8-78d1-49ae-9839-0bca17438384',
        name: 'Magnesium RBC',
        description:
          'Determines magnesium concentration, vital for nerve, muscle function, and overall metabolic health. Essential in evaluating electrolyte balance and detecting magnesium deficiency or excess.',
        price: '12',
      },
      {
        id: '09690943-a026-4ad7-9b75-f06bcdc064bb',
        name: 'Prolactin',
        description:
          'Determines prolactin concentration, a hormone important for lactation and reproductive health. Essential for diagnosing prolactinomas, infertility, and menstrual irregularities.',
        price: '11',
      },
      {
        id: 'f5408ce8-f843-4473-8b48-b804e2061c7c',
        name: 'Cortisol',
        description:
          'Determines cortisol concentration, a vital hormone produced by the adrenal gland, indicative of stress response, metabolic function, and circadian rhythm regulation.',
        price: '9',
      },
      {
        id: '645e79ba-7926-4314-af58-898ce43fc839',
        name: 'Thyroglobulin Antibody',
        description:
          "Determines the presence of thyroglobulin antibodies (TgAb), indicative of autoimmune thyroid disorders. Essential for diagnosing conditions such as Hashimoto's thyroiditis and monitoring thyroid health.",
        price: '9',
      },
      {
        id: 'd957f00b-a39a-46c3-af98-92acb642f547',
        name: 'Insulin',
        description:
          'Assesses insulin levels, crucial for understanding glucose metabolism, diagnosing diabetes and insulin resistance, and managing blood sugar levels effectively.',
        price: '7',
      },
      {
        id: '80195987-ab0e-47e5-aec4-cec598ee08fa',
        name: 'Estradiol',
        description:
          'Quantifies estradiol, the primary female sex hormone, essential for reproductive and sexual health assessment and monitoring hormonal balance across various life stages.',
        price: '16',
      },
      {
        id: '4ef07ac4-1b82-4393-8b4a-d78d73ecb10e',
        name: 'Lipoprotein (a)',
        description:
          'Assesses levels of Lipoprotein (a), a significant marker for cardiovascular disease risk beyond traditional lipid metrics. Important for comprehensive heart health evaluation.',
        price: '16',
      },
    ],
  },
  {
    id: '626abefe-9164-499f-9637-16a1cdcc302a',
    name: 'Full Body MRI',
    description:
      'Non-invasive body scan to reveal hidden diseases and problems.',
    price: 0,
    active: true,
    image: '/services/full_body_mri.png',
    phlebotomy: false,
    items: [],
  },
  {
    id: '586841a9-b0ba-4222-ac87-1023f2fd5cc6',
    name: 'VO2 Max Test',
    description:
      'Benchmark the maximum amount of oxygen your body can utilize during intense exercise, a powerful marker of cardiovascular fitness and longevity.',
    price: 0,
    active: true,
    image: '/services/vo2_max_test.png',
    phlebotomy: false,
    items: [],
  },
  {
    id: '75a852b5-1eab-4661-8897-f3f328af961b',
    name: 'DEXA Scan',
    description: 'Get a detailed analysis of body composition and bone health.',
    price: 0,
    active: true,
    image: '/services/dexa_scan.png',
    phlebotomy: false,
    items: [],
  },
  {
    id: '0b4c855e-1023-4b03-957b-4436888d8d49',
    name: 'Heart Calcium Scan',
    description:
      'Measures the amount of calcified plaque in the coronary arteries.',
    price: 0,
    active: true,
    image: '/services/heart_calcium_scan.png',
    phlebotomy: false,
    items: [],
  },
  {
    id: '53986f8c-bc37-434d-8464-6268461b0d03',
    name: 'Gut Microbiome Analysis',
    description:
      'Analyzes the types of bacteria and other organisms in your digestive tract.',
    price: 0,
    active: true,
    image: '/services/gut_microbiome_analysis.png',
    phlebotomy: false,
    items: [],
  },
  {
    id: 'd65319ca-c2c1-4ca5-be7a-ee06f39d159f',
    name: 'Full Genetic Sequencing',
    description:
      'Examines your DNA to identify genetic predispositions to certain conditions.',
    price: 0,
    active: true,
    image: '/services/full_genetic_sequencing.png',
    phlebotomy: false,
    items: [],
  },
  {
    id: 'e3c1becb-f390-498d-92a5-aec61ff152b6',
    name: 'Total Toxins',
    description:
      'Know how heavy metals, mycotoxins, and other environmental toxins may be harming your health.',
    price: 55000,
    active: true,
    image: '/services/total_toxins.png',
    phlebotomy: false,
    items: [],
  },
  {
    id: 'bae9cfdc-ec4e-4b2a-925f-049205f2f382',
    name: 'Heavy Metals',
    description:
      'Learn how heavy metals may be affecting your body’s function and harming your health.',
    price: 19900,
    active: true,
    image: '/services/heavy_metals.png',
    phlebotomy: false,
    items: [],
  },
  {
    id: '4995f636-25c5-4973-8f83-8e64ec92de6f',
    name: 'Environmental Toxin',
    description:
      'The Environmental Toxins panel measures levels of environmental toxins in the body.',
    price: 34900,
    active: true,
    image: '/services/environmental_toxin.png',
    phlebotomy: false,
    items: [],
  },
  {
    id: '9c6f170e-0717-48ad-9cb5-a9092da71288',
    name: 'Mycotoxins',
    description:
      'Learn how mold levels from environmental or dietary may be harming your health.',
    price: 43900,
    active: true,
    image: '/services/mycotoxins.png',
    phlebotomy: false,
    items: [],
  },
];
