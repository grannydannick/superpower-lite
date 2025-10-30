import {
  ADVANCED_BLOOD_PANEL,
  CUSTOM_BLOOD_PANEL,
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  GUT_MICROBIOME_ANALYSIS,
  SUPERPOWER_BLOOD_PANEL,
  TOTAL_TOXIN_TEST,
  ENVIRONMENTAL_TOXIN_TEST,
  FOOD_ENVIRONMENTAL_ALLERGY,
  HEAVY_METALS_TEST,
  MYCOTOXINS_TEST,
  INTESTINAL_PERMEABILITY_PANEL,
  PFAS_CHEMICALS,
  CONTINUOUS_GLUCOSE_MONITOR,
  HEART_CALCIUM_SCAN,
  FULL_BODY_MRI,
  VO2_MAX_TEST,
  FULL_GENETIC_SEQUENCING,
  DEXA_SCAN,
  CARDIOVASCULAR_PANEL,
  METABOLIC_PANEL,
  METHYLATION_PANEL,
  FEMALE_FERTILITY_PANEL,
  AUTOIMMUNITY_AND_CELIAC_PANEL,
  NUTRIENT_AND_ANTIOXIDANT_PANEL,
} from '@/const/services';
import { ServiceDetails } from '@/types/service';

export const SERVICE_DETAILS: Record<string, ServiceDetails> = {
  [SUPERPOWER_BLOOD_PANEL]: {
    faqs: [
      {
        question: "What's tested?",
        answer: 'https://superpower.com/biomarkers',
      },
      {
        question: 'Why is this test important?',
        answer:
          "Proactive laboratory testing can provide targeted insight into you body's current health status, identifying areas of optimal and suboptimal physiologic function. Establish a baseline or track how your body is responding to your Superpower action plan.",
      },
      {
        question: 'Test Process',
        answer:
          '1. Order and schedule your blood panel.\n2. Fast and prepare for your appointment.\n3. Perform the phlebotomy visit and have your blood draw done.\n4. Receive your results within 10 days.\n5. The Superpower clinical team will review your results and create an action plan.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          '- Hydrate for 24 hours prior to sample collection and after your blood draw is completed.\n- No eating 10 hours prior to the appointment. The sample should be collected in a fasted state.\n- No caffeine 10 hours prior to your appointment -- just water.\n- Stop taking supplements containing biotin such as multivitamins, B-complex, or hair skin and nail vitamins. Continue taking prescribed medications.\n- Text the Superpower SMS Concierge if you have any questions or concerns ahead of testing.',
      },
    ],
  },

  [ADVANCED_BLOOD_PANEL]: {
    faqs: [
      {
        question: "What's tested?",
        answer: 'https://superpower.com/biomarkers',
      },
      {
        question: 'Why is this test important?',
        answer:
          "Proactive laboratory testing can provide targeted insight into you body's current health status, identifying areas of optimal and suboptimal physiologic function. The advanced panel dives into further areas of health that are not covered in our baseline panel, including in-depth hormone testing, genetic heart risk and nutrient status. Furthermore, this test can serve to track how your body is responding to your Superpower action plan.",
      },
      {
        question: 'Test Process',
        answer:
          '1. Order and schedule your advanced blood panel.\n2. Fast and prepare for your at-home appointment.\n3. Receive your phlebotomist and have your blood draw done.\n4. Receive your results within 10 days.\n5. Schedule a consultation with your clinical team to review your results and create an action plan.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          '- Hydrate for 24 hours prior to sample collection and after your blood draw is completed.\n- No eating 10 hours prior to the appointment. The sample should be collected in a fasted state.\n- No caffeine 10 hours prior to your appointment -- just water.\n- Stop taking supplements containing biotin such as multivitamins, B-complex, or hair skin and nail vitamins. Continue taking prescribed medications.',
      },
    ],
  },

  [CUSTOM_BLOOD_PANEL]: {
    faqs: [
      {
        question: 'Why is this test important?',
        answer:
          "Proactive laboratory testing can provide targeted insight into you body's current health status, identifying areas of optimal and suboptimal physiologic function. Establish a baseline or track how your body is responding to your Superpower action plan.",
      },
      {
        question: 'Test Process',
        answer:
          '1. Order and schedule your custom blood panel.\n2. Fast and prepare for your appointment.\n3. Perform the phlebotomy visit and have your blood draw done.\n4. Receive your results within 10 days.\n5. The Superpower clinical team will review your results and create an action plan.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          '- Hydrate for 24 hours prior to sample collection and after your blood draw is completed.\n- No eating 10 hours prior to the appointment. The sample should be collected in a fasted state.\n- No caffeine 10 hours prior to your appointment -- just water.\n- Continue taking your medications and supplements as scheduled.\n- Text the Superpower SMS Concierge if you have any questions or concerns ahead of testing.',
      },
    ],
  },

  [CARDIOVASCULAR_PANEL]: {
    faqs: [
      {
        question: "Who's this for?",
        answer:
          'Anyone wanting a fuller picture of heart & vascular health. Especially useful if you have a family history of heart disease, high cholesterol, diabetes, or want more insight than a standard cholesterol test provides.',
      },
      {
        question: "What's included in this panel?",
        answer:
          ' - **Lipoprotein Fractionation (NMR):** Goes beyond basic cholesterol by showing how many cholesterol particles you have, their size, and how they behave.\n\n  - **LDL particles:** Smaller, denser LDL particles are more damaging as they more easily penetrate artery walls and drive plaque buildup.\n  - **HDL particles:** Larger HDL particles are more protective, helping carry cholesterol away from arteries for removal.\n  - **VLDL particles:** Carry triglycerides; larger VLDL particles add strain on metabolism and increase cardiovascular risk.\n\n- **Lipoprotein(a):** A genetically influenced cholesterol particle that can raise heart risk even when other numbers look normal.\n\n- **ADMA / SDMA:** Molecules that affect blood vessel flexibility and nitric oxide production, giving insight into circulation and blood pressure.\n\n*Note: In NY/NJ, ADMA/SDMA are not available, and VLDL measures are excluded from the NMR panel.*',
      },
      {
        question: 'Why is this test important?',
        answer:
          'Cardiovascular disease is the leading cause of death worldwide, yet standard cholesterol tests can miss hidden risks. This advanced panel evaluates lipoprotein particle quality, kidney health, and vascular function to provide a more accurate picture of long-term heart health.\n\n**This test may be especially helpful if you:**\n\n- Have a family history of heart disease or stroke.\n- Have “normal” cholesterol but elevated risk factors (e.g., diabetes, hypertension, metabolic syndrome).\n- Experience fatigue, brain fog, or poor exercise recovery linked to circulation.\n- Want a more precise measure of how well your kidneys support cardiovascular health.\n- Are considering or already on cholesterol-lowering therapy and want deeper insights.',
      },
      {
        question: 'Test process',
        answer:
          'A simple blood draw at a nearby partner lab — or at home with a licensed phlebotomist. Your results are analyzed and delivered to your dashboard in an easy-to-understand report, complete with clear, actionable next steps.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          'To ensure the most accurate results:\n\n- Fast for 8-12 hours before your blood draw (water is fine).\n- Continue prescription medications unless directed otherwise by your provider. Statins, blood pressure medications, or diabetes drugs may affect results — let us know if youre taking them.\n- Avoid alcohol, smoking, and heavy caffeine for 24 hours before testing.\n- Stay hydrated by drinking water before your appointment.\n- Morning collection is preferred for consistency.',
      },
    ],
  },

  [METABOLIC_PANEL]: {
    faqs: [
      {
        question: "Who's this for?",
        answer:
          'Anyone looking to understand their risk for diabetes, metabolic syndrome, or unexplained weight changes. Especially useful if you have a family history of diabetes, experience fatigue after meals, or want a clearer picture of insulin sensitivity.',
      },
      {
        question: "What's included in this bundle?",
        answer:
          '- **Adiponectin** — a hormone produced by fat cells; higher levels are protective and improve insulin sensitivity.\n- **Leptin** — a hormone that regulates appetite and fat storage; imbalances can contribute to weight gain or difficulty losing weight.\n- **Insulin** — shows how much insulin your body is making.\n- **Insulin Resistance Score** — integrates insulin and C-peptide to give a direct measure of insulin sensitivity.\n- **C-Peptide** — reflects how much insulin is produced by your pancreas.\n- **Fructosamine** — reflects average blood sugar levels over the past 2-3 weeks, complementing HbA1c and glucose testing.\n\n*Note: In NY/NJ, Adiponectin and the Insulin Resistance Score are not available. The Metabolic Health Panel is offered at a reduced price of $79.*',
      },
      {
        question: 'Why is this test important?',
        answer:
          'Insulin resistance often develops silently for years before diabetes is diagnosed. Early detection allows for targeted nutrition, lifestyle, and medical interventions to restore balance and reduce long-term risk.\n\n**This test may be especially helpful if you:**\n- Struggle with weight gain or difficulty losing weight.\n- Experience fatigue, brain fog, or sugar cravings after meals.\n- Have a family history of type 2 diabetes or metabolic syndrome.\n- Show borderline changes in glucose, HbA1c, or cholesterol.\n- Want to measure the impact of diet, exercise, or medication on your metabolism.',
      },
      {
        question: 'Test process',
        answer:
          'A simple blood draw at a nearby partner lab — or right at home with a licensed phlebotomist. Your results are carefully analyzed and delivered straight to your dashboard in an easy-to-understand report, complete with clear, actionable next steps.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          'For the most accurate results:\n- Fast for 8-12 hours before your blood draw (water is fine).\n- Continue prescription medications unless directed otherwise by your provider. Some drugs (e.g., steroids, diabetes medications) can affect results — let us know if you`re taking them.\n- Avoid alcohol, smoking, and excess caffeine for 24 hours before testing.\n- Stay hydrated by drinking water before your appointment.\n- Morning collection is preferred for consistency.',
      },
    ],
  },

  [METHYLATION_PANEL]: {
    faqs: [
      {
        question: "Who's this for?",
        answer:
          'Anyone looking to optimize energy, focus, and long-term health. Especially useful if you experience fatigue, mood changes, or have a family history of heart disease, cognitive decline, or genetic variants affecting methylation (like MTHFR).',
      },
      {
        question: "What's included in this panel?",
        answer:
          '- **Homocysteine** — shows how well your body recycles methyl groups.\n- **Methylmalonic Acid (MMA)** — reflects vitamin B12 use.\n- **Folate (RBC)** — long-term folate status, vital for DNA and red blood cells.\n- **Vitamin B6** — supports brain chemistry and homocysteine clearance.\n- **Vitamin B12 (Cobalamin)** — essential for methylation, energy, and nerve health.',
      },
      {
        question: 'Why is this test important?',
        answer:
          'Methylation is one of your body’s core systems for producing energy, balancing mood, detoxifying, and maintaining cellular repair. When it slows down, the effects can appear across many systems.\n\n**This test may be especially helpful if you have:**\n- Fatigue, low mood, poor focus, or sleep problems\n- High homocysteine, anemia, or low folate/B12 despite supplements\n- Cardiovascular risks (cholesterol, clotting, hypertension)\n- Memory issues or a family history of dementia\n- Sensitivity to alcohol, meds, or chemicals\n- Chronic inflammation, infections, or autoimmunity',
      },
      {
        question: 'Test process',
        answer:
          'A simple blood draw at a partner lab or right at home with a licensed phlebotomist. Results appear in your dashboard with a clear, actionable report.',
      },
      {
        question: 'Pre‑test considerations',
        answer:
          'To make sure your results are as accurate and meaningful as possible, please follow these guidelines:\n- Fast 8-12 hours (water OK)\n- Pause high-dose B vitamins 48-72h (unless advised otherwise)\n- Continue prescriptions unless told by your provider (let us know if you take metformin, PPIs, anticonvulsants, methotrexate)\n- Avoid alcohol, smoking, and heavy caffeine for 24h\n- Stay hydrated\n- Morning collection preferred',
      },
    ],
  },

  [FEMALE_FERTILITY_PANEL]: {
    faqs: [
      {
        question: "Who's this for?",
        answer:
          'Anyone trying to conceive, planning for the future, or experiencing irregular cycles, hormone-related symptoms, or difficulty getting pregnant. Especially useful if you want a clearer picture of hormone balance, ovarian reserve, thyroid function, or toxin exposure.',
      },
      {
        question: "What's included in this panel?",
        answer:
          '- **Anti-Müllerian Hormone (AMH)** — a key marker of ovarian reserve and egg quantity.\n- **Progesterone** — confirms ovulation and supports implantation and early pregnancy.\n- **FSH (Follicle Stimulating Hormone)** — regulates ovarian function and helps assess ovarian reserve.\n- **LH (Luteinizing Hormone)** — triggers ovulation; measured alongside FSH to evaluate cycle balance.\n- **Estradiol (E2, ultrasensitive LC/MS)** — the main estrogen; reflects ovarian activity and cycle health.\n- **Prolactin** — high levels can disrupt ovulation and menstrual cycles.\n- **Thyroid Antibodies (TPO, ATG)** — markers of autoimmune thyroid disease, which can interfere with fertility and pregnancy.\n- **Insulin & Glucose (fasting)** — evaluate blood sugar control and metabolic health, important for conditions like PCOS.\n- **Mercury (whole blood)** — screens for heavy metal exposure that can impact fertility.\n- **17-Hydroxyprogesterone** — helps assess adrenal and ovarian hormone pathways, relevant in PCOS and other hormone disorders.',
      },
      {
        question: 'Why is this test important?',
        answer:
          'Hormonal imbalances, thyroid autoimmunity, and metabolic dysfunction are common, underdiagnosed causes of fertility challenges. Identifying these factors early can help guide interventions — from lifestyle and nutrition changes to medical treatment — that improve reproductive outcomes and overall health.\n\n**This test may be especially helpful if you:**\n- Have irregular or absent periods.\n- Experience PMS, heavy bleeding, or signs of hormone imbalance.\n- Have been trying to conceive without success.\n- Have a family history of thyroid disease or autoimmune conditions.\n- Suspect PCOS or insulin resistance.\n- Want a comprehensive fertility “check-in” before starting a family.',
      },
      {
        question: 'Test process',
        answer:
          'A simple blood draw at a nearby partner lab — or right at home with a licensed phlebotomist. Your results are carefully analyzed and delivered straight to your dashboard in an easy-to-understand report, complete with clear, actionable next steps.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          '- **Cycle timing matters:** For the most complete picture, this panel is best collected early in the menstrual cycle (days 2-5). At this time, FSH, LH, estradiol, and AMH give the clearest insights into ovarian reserve and cycle balance. Progesterone is included in this panel and, when measured early in the cycle, reflects baseline levels.\n- **Fasting required** for glucose and insulin (8-12 hours; water is fine).\n- **Continue prescription medications** unless instructed otherwise by your provider.\n- **Avoid high-dose biotin supplements** for 48 hours, as they can interfere with hormone assays.\n- **Stay hydrated** before your appointment.\n- **Morning collection** is preferred for consistency.',
      },
    ],
  },

  [AUTOIMMUNITY_AND_CELIAC_PANEL]: {
    faqs: [
      {
        question: "Who's this for?",
        answer:
          'Anyone with ongoing fatigue, joint pain, digestive issues, skin changes, or a family/personal history of autoimmune disease. Especially useful if you have thyroid concerns or unexplained inflammation.',
      },
      {
        question: "What's included in this panel?",
        answer:
          '- **TPO & Thyroglobulin Antibodies** — markers of autoimmune thyroid disease (Hashimoto’s, Graves’).\n- **ANA Screen, IFA + Reflex** — flags antibodies linked to systemic autoimmune conditions (e.g., lupus); expands to 11 more if positive.\n- **Rheumatoid Factor (RF)** — often elevated in rheumatoid arthritis.\n- **dsDNA Antibody** — specific marker for lupus.\n- **CCP IgG** — early antibody for rheumatoid arthritis.\n- **tTG IgA** — key test for celiac disease.\n- **Total IgA** — confirms accurate celiac results by checking for IgA deficiency.\n\n*Note: For Quest members, ANA reflex testing only if the screen is positive. In NY/NJ, the panel also includes SSA 52, SSA 60, dsDNA, SS-B, Smith & RNP antibodies.*',
      },
      {
        question: 'Why is this test important?',
        answer:
          'Autoimmune diseases often build slowly with vague, overlapping symptoms. Detecting antibodies early helps explain what’s driving inflammation and gives you clearer next steps.\n- Ongoing fatigue, joint pain, or stiffness\n- Digestive problems (bloating, diarrhea, malabsorption)\n- Unexplained rashes, hair loss, or skin changes\n- Thyroid dysfunction\n- Family history of autoimmune disorders',
      },
      {
        question: 'Test process',
        answer:
          'A quick blood draw at a partner lab or at home with a licensed phlebotomist. Results are delivered in a clear, actionable report through your dashboard.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          '- No fasting required\n- Continue prescriptions unless told otherwise\n- Stop high-dose biotin (B7) for 48h before\n- Drink water beforehand\n- Morning collection preferred',
      },
    ],
  },

  [NUTRIENT_AND_ANTIOXIDANT_PANEL]: {
    faqs: [
      {
        question: "Who's this for?",
        answer:
          'Anyone looking to optimize energy, immunity, and overall resilience. Especially useful if you experience fatigue, frequent illness, slow recovery, or follow a restricted diet (vegan, vegetarian, keto, etc.).',
      },
      {
        question: "What's included in this panel?",
        answer:
          'Nutrients don’t act in isolation. These panels measure vitamins and minerals in the context of their pathways, cofactors, and interactions - giving you a more accurate picture of true nutritional balance. \n\n This bundle includes:\n- **Vitamin E** — antioxidant protection & cell stability\n- **Vitamin K** — bone & heart health, clotting balance\n- **Vitamin C** — immune defense, collagen, iron absorption\n- **Selenium** — thyroid support & antioxidant defense\n- **Magnesium (RBC)** — energy, nerves & muscle function',
      },
      {
        question: 'Why is this test important?',
        answer:
          'Nutrient status shapes how well your body produces energy, supports immune defenses, balances hormones, and controls inflammation. Even with a balanced diet, genetics, absorption issues, stress, or lifestyle factors can create gaps.\n\n**This test is especially valuable if you are:**\n- Actively supplementing and want to confirm absorption, utilization, or avoid imbalances.\n- Considering supplements and want clarity on what you truly need before starting.\n- Feeling tired, foggy, or low in mood, and noticing slower recovery, wound healing, or changes in your skin and hair.\n- Managing thyroid, hormonal, or cardiometabolic concerns (e.g., cholesterol, blood sugar, blood pressure).\n- Living with digestive issues (IBS, IBD, celiac) or other conditions that affect nutrient absorption.\n- Facing increased demands — athletes, people under chronic stress, or recovering from illness.\n- Following a restricted diet (vegan, vegetarian, keto, etc.) or eating pattern that limits nutrient intake.',
      },
      {
        question: 'Test process',
        answer:
          'A quick blood draw at a local lab or at home with a licensed phlebotomist. Results land in your dashboard with clear insights and next steps tailored to you.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          'For the most accurate results:\n- **Fast for 8-12 hours** before your blood draw (water is fine).\n- **Continue prescription medications** unless instructed otherwise by your provider. Some drugs (e.g., PPIs, metformin, oral contraceptives) can influence nutrient levels — let us know if you’re taking them.\n- **Pause high-dose supplements** (vitamins, minerals, fish oil, iron) for 48-72 hours unless otherwise directed.\n- **Refrain from eating liver** ~24 hours before your draw.\n- **Avoid alcohol, smoking, and excess caffeine** for 24 hours before testing.\n- **Avoid unusually high intakes** of fortified foods or supplements the day before (especially vitamin C).\n- **Stay hydrated** by drinking water before your appointment.\n- **Morning collection** is preferred for consistency.',
      },
    ],
  },

  [GRAIL_GALLERI_MULTI_CANCER_TEST]: {
    image: '/services/transparent/grail_galleri_multi_cancer_test.png',
    faqs: [
      {
        question: 'Why this matters?',
        answer:
          "- Cancer risk increases with age, regardless of family history.\n- Only 5-10% of cancers are inherited — meaning most are not genetic.\n- The remaining 90-95% are sporadic, caused by environmental exposures, lifestyle and aging-related somatic mutations\n- Adults over 50 are 13x more likely to develop cancer than those under 50.\n\nEarly detection saves lives. Most cancers show no symptoms until it's too late.",
      },
      {
        question: "What's measured?",
        answer:
          "The Galleri test uses advanced DNA sequencing and machine learning to analyze fragments of DNA (cfDNA) in your blood.\n\nCancer cells shed DNA with unique methylation patterns. Galleri checks over 1 million sites to detect abnormalities that may signal cancer and predict where it's coming from.",
      },
      {
        question: "What's the process?",
        answer:
          '1. Receive your kit at home in 3-5 days.\n2. Schedule an at-home blood draw with a licensed phlebotomist (no fasting required).\n3. Get results in 2-3 weeks via your Superpower dashboard.',
      },
    ],
  },

  [FOOD_ENVIRONMENTAL_ALLERGY]: {
    faqs: [
      {
        question: "What's measured?",
        answer:
          'This test measures IgE antibodies to over 150 food and environmental allergens as well as IgG antibodies to over 250 food allergens across the following categories:\n\n- Pollen, including grass, trees, and weeds\n- Mites\n- Microorganisms and Spores, including yeast and mold\n- Plant foods\n- Cereals, including wheat, rye, barley, and more\n- Fruits and Vegetables\n- Nuts and Seeds, including component testing for peanuts, pecans, walnuts, poppy seeds\n- Animal Food, including milk, eggs, seafood, and meat\n- Insect Venoms, including component testing for wasps and honeybees',
      },
      {
        question: 'Test Process',
        answer:
          "1. Order your test kit -- we'll deliver it directly to your house in 3-5 days.\n2. Your membership advisor will reach out to schedule your at-home blood draw appointment with a phlebotomist.\n3. Receive your results within two weeks.\n4. Schedule a consultation with your clinical team to review your results and create an action plan.",
      },
      {
        question: 'Why is this test important?',
        answer:
          "There are important differences between food allergies and food allergies. Different arms of the immune system facilitate both conditions. True allergies are immediate, potentially life-threatening, mast-cell mediated, and often involve IgE antibodies, whereas food sensitivities are delayed reactions and elicit IgG antibodies.\n\nIt's best practice to measure IgE and IgG antibodies together as they independently create inflammation and play a role in symptoms driven by food. A food can elicit an IgE sensitivity response, an IgG antibody response, or both.",
      },
      {
        question: 'Pre-test considerations',
        answer:
          '1. Hydrate the day prior to sample collection.\n2. Drink water 30 minutes before you draw your blood.\n3. Continue taking any nutritional supplements and medications unless advised differently by your healthcare provider.',
      },
    ],
  },

  [TOTAL_TOXIN_TEST]: {
    image: '/services/transparent/environmental_toxin_test.png',
    faqs: [
      {
        question: 'Why this matters?',
        answer:
          'Most people carry toxins for years without knowing. This test measures them, helps pinpoint sources, and supports a targeted detox plan.\n' +
          '\n' +
          '**Signs this test may be helpful:**\n' +
          '\n' +
          '- **From your bloodwork:** Any combination of the elevated inflammation, impaired liver/kidney function, abnormal iron status, low essential nutrients (vitamin D, B12, folate), or hormone imbalances.\n' +
          '- Multiple unexplained symptoms across energy, mood, digestion, or immunity.\n' +
          '- Past or ongoing exposure to environmental chemicals, heavy metals, or mold.\n' +
          '- You want a full-screen for hidden toxic burden before starting a detox plan.',
      },
      {
        question: "What's measured?",
        answer:
          '- **Heavy Metals:** Lead, mercury, arsenic, aluminum, cadmium & more\n' +
          '- **Mycotoxins:** Aflatoxins, trichothecenes, ochratoxins & other mold toxins\n' +
          '- **Environmental Toxins:** Pesticides, plastics (BPA, phthalates), VOCs & preservatives',
      },
      {
        question: "What's the process?",
        answer:
          'At-home urine test. Follow the kit instructions, mail your sample back for analysis, and receive results plus an updated Action Plan.',
      },
    ],
  },

  [HEAVY_METALS_TEST]: {
    faqs: [
      {
        question: "What's measured?",
        answer:
          '20+ toxic metals including lead, mercury, arsenic, aluminum, cadmium, and uranium.',
      },
      {
        question: 'Why is this test important?',
        answer:
          'Even low-level exposure can cause fatigue, brain fog, and long-term health issues. Knowing your levels lets you take targeted steps to remove them.\n' +
          '\n' +
          '**Signs this test may be helpful:**\n' +
          '\n' +
          '- **From your bloodwork:** Low hemoglobin/hematocrit, iron panel imbalances (iron, ferritin, TIBC), abnormal kidney or liver function, elevated uric acid, or unexplained neurological symptoms.\n' +
          '- Fatigue, muscle weakness, numbness/tingling, digestive issues, or memory/concentration problems.\n' +
          '- Living in an older home with possible lead pipes or paint, high seafood consumption, or occupational exposure (e.g., welding, manufacturing, mining).',
      },
      {
        question: 'Test process',
        answer:
          'At-home urine test. Follow the kit instructions, mail your sample back for analysis, and receive results plus an updated Action Plan.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          'No fasting required. Connect with your care team if you have questions before testing.',
      },
    ],
  },

  [ENVIRONMENTAL_TOXIN_TEST]: {
    image: '/services/transparent/environmental_toxin_test.png',
    faqs: [
      {
        question: "What's measured?",
        answer:
          'Pesticides, herbicides, plastics (BPA, phthalates), preservatives, and volatile organic compounds (VOCs).',
      },
      {
        question: 'Why is this test important?',
        answer:
          'Measuring your toxin load is the first step to reducing it — and protecting your energy, immunity & longevity.\n' +
          '\n' +
          '**Signs this test may be helpful:**\n' +
          '\n' +
          '- **From your bloodwork:** Low or high liver enzymes (ALT, AST, GGT, bilirubin), abnormal kidney markers (creatinine, BUN), or signs of chronic inflammation (elevated CRP).\n' +
          '- Ongoing fatigue, headaches, brain fog, skin irritation, or unexplained allergies.\n' +
          '- Frequent exposure to chemicals through work, hobbies, or home environment (e.g., pesticides, solvents, plastics).\n' +
          '- Unexplained hormone changes or fertility issues.',
      },
      {
        question: 'Test process',
        answer:
          'Simple at-home urine test. Follow the kit instructions, mail your sample back for analysis, and receive results plus an updated Action Plan.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          'No fasting required. Connect with your care team if you have questions before testing.',
      },
    ],
  },

  [MYCOTOXINS_TEST]: {
    faqs: [
      {
        question: "What's measured?",
        answer:
          'Aflatoxins, trichothecenes, ochratoxins, and other toxic compounds from mold in food (grains, nuts, coffee) and environmental sources.',
      },
      {
        question: 'Why is this test important?',
        answer:
          'Mycotoxin exposure is common and linked to serious health risks over time. \n' +
          '\n' +
          '**Signs this test may be helpful:**\n' +
          '\n' +
          '- **From your bloodwork:** Low vitamin D, abnormal liver markers (ALT, AST, GGT, bilirubin), elevated inflammatory markers (CRP, ESR), or signs of suppressed immunity (low WBC count).\n' +
          '\n' +
          'Any combination of:\n' +
          '\n' +
          '- Chronic sinus congestion, persistent cough, shortness of breath, or asthma-like symptoms.\n' +
          '- Digestive issues, joint pain, mood changes, or immune weakness without a clear cause.\n' +
          '- Living/working in water-damaged buildings or consuming mold-prone foods (coffee, grains, nuts).',
      },
      {
        question: 'Test process',
        answer:
          'At-home urine test. Follow the kit instructions, mail your sample back for analysis, and receive results plus an updated Action Plan.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          'Fasting for 12 hours before collection can improve detection. First-morning urine is preferred. Connect with your care team if you have questions before testing.',
      },
    ],
  },

  [INTESTINAL_PERMEABILITY_PANEL]: {
    faqs: [
      {
        question: "What's measured?",
        answer:
          'The following key markers can be found within the Wheat Zoomer tests:\n\n- All known deamidated gliadins\n- Alpha, alpha-beta, gamma and omega gliadin\n- HMW and LMW glutenin family\n- Zonulin protein\n- Anti-zonulin\n- Anti-actin\n- Anti-lipopolysaccharide (LPS)\n- tTG-DGP Fusion Peptides\n- Wheat germ agglutinin (WGA)\n- Differential transglutaminase: 2, 3 and 6\n- Wheat IgE antibodies (for wheat allergies)\n- Non-gluten wheat proteins\n- Farinins\n- Globulins\n- Serpins\n- Amylase/Protease Inhibitors',
      },
      {
        question: 'Why is this test important?',
        answer:
          'One out of seven Americans is at least somewhat sensitive to wheat. This sensitivity may damage the intestinal lining, causing further inflammation. Uncovering wheat sensitivities is an easy and critical step in developing a nutritional plan to reduce inflammation and prevent disease.',
      },
      {
        question: 'Test process',
        answer:
          "1. Order your test kit -- we'll deliver it directly to your house in 3-5 days.\n2. Your membership advisor will reach out to schedule your at-home blood draw appointment with a phlebotomist.\n3. Receive your results within two weeks.\n4. Schedule a consultation with your longevity advisor team to review your results and create an action plan.",
      },
      {
        question: 'Pre-test considerations',
        answer:
          'If you are currently taking (or have recently taken) any of the following medications, consult your healthcare provider regarding the timing of collection: Steroids, Immunosuppressive medications, Biologic agents, Other immunomodulating medications\n\nHydrate the day prior to the test.\n\nFreeze the provided ice packs for at least 24 hours prior to your blood draw.',
      },
    ],
  },

  [PFAS_CHEMICALS]: {
    faqs: [
      {
        question: "What's measured?",
        answer:
          "The PFAS chemical test measures 21 different toxin markers in your blood associated with exposure to perfluoroalkyl and polyfluoroalkyl chemicals, commonly called 'PFAS.'",
      },
      {
        question: 'Test process',
        answer:
          "1. Order your test kit -- we'll deliver it directly to your house or confirmed in 3-5 days\n2. Self-collect your sample\n3. Your membership advisor will reach out to schedule a convenient time to have your sample picked up and shipped to the lab for you.\n4. Receive your results within two weeks.\n5. Schedule a consultation with your care team to review your results and create an action plan.",
      },
      {
        question: 'Why is this test important?',
        answer:
          'Testing for PFAS chemicals in your blood is important because:\n\n- Toxins can bioaccumulate and persist in the body for decades, breaking down slowly or not at all. Toxic build-up can impair detoxification, compromise immunity, and increase oxidative stress.\n- Testing for PFAS can reveal the status of toxic metabolites in the body.\n- Knowing your PFAS exposure level is the first step to reducing toxic risk and creating a personalized detox and wellness plan to achieve better health.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          '1. Do not collect samples while menstruating.\n2. Fasting is not required. However, fasting for 12-24 hours prior to collection may increase the excretion of toxins.\n3. Please consult your healthcare provider prior to fasting.\n4. Do not drink more than 8 oz water 1 hour prior to urine collection.',
      },
    ],
  },

  [CONTINUOUS_GLUCOSE_MONITOR]: {
    faqs: [
      {
        question: "What's measured?",
        answer:
          'A continuous glucose monitor (CGM) measures your interstitial blood glucose level in real-time with automatic readings sent to your smartphone.',
      },
      {
        question: 'Why is this test important?',
        answer:
          'Data from continuous glucose monitors can be useful for early detection of insulin resistance and diabetes. Additionally, it provides real-time insight into how our blood sugar is affected by the foods we eat and our lifestyle habits.',
      },
      {
        question: 'Test process',
        answer:
          "1. Order your CGM -- we'll deliver it directly to your house in 3-5 days.\n2. Your membership advisor will reach out to help guide you through the CGM's application.\n3. If interested, schedule a consultation with your care team to review your results and create an action plan.",
      },
      {
        question: 'Pre-test considerations',
        answer:
          'Connect with your membership advisor if you have any questions or concerns regarding the application of the device.',
      },
    ],
  },

  [HEART_CALCIUM_SCAN]: {
    faqs: [
      {
        question: "What's measured?",
        answer:
          'Level of calcification in coronary arteries, indicating heart disease risk.',
      },
      {
        question: 'Why is this test important?',
        answer:
          'Important for assessing the risk of heart disease, especially in those with risk factors but no symptoms.',
      },
      {
        question: 'Test process',
        answer: 'A CT scan is used, involving brief exposure to radiation.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          'Involves radiation exposure; not recommended for routine screening in low-risk individuals.',
      },
    ],
  },

  [GUT_MICROBIOME_ANALYSIS]: {
    tag: 'Most popular',
    image: '/services/transparent/gut_microbiome_analysis.png',
    faqs: [
      {
        question: 'Why this matters?',
        answer:
          'Understanding your gut can help prevent or address:\n\n- Bloating, brain fog, fatigue\n- Food intolerances\n- Autoimmune flare-ups\n- Poor recovery and low energy\n\nMost people never test their gut, even though it affects almost every system in the body.',
      },
      {
        question: "What's measured?",
        answer:
          '1. Gut Diversity Score: Measures the variety of bacteria in your microbiome — higher diversity is linked to stronger immunity and resilience.\n2. Beneficial Bacteria Levels: Tracks microbes that support metabolism, reduce inflammation, and produce essential nutrients like short-chain fatty acids.\n3. Intestinal Permeability Markers (Leaky Gut): Screens for signs of gut lining damage, which may allow harmful substances to pass into your bloodstream.\n4. Harmful Organisms: Identifies common parasites, overgrowth of bad bacteria, and fungi that can lead to digestive or systemic symptoms.',
      },
      {
        question: "What's the process?",
        answer:
          'This is a non-invasive test.\n\nA testing kit will be sent to you. A mess-free sample will be required from a soiled tissue paper in the comfort of your own home. This will then be shipped to a lab and analyzed.\n\nDiet and medication can influence results.',
      },
    ],
  },

  [FULL_BODY_MRI]: {
    faqs: [
      {
        question: "What's measured?",
        answer:
          'The Full Body MRI takes a comprehensive and detailed set of images of your major organs, including the following:\n\n- Brain\n- Spine\n- Thyroid\n- Gallbladder\n- Pancreas\n- Spleen\n- Liver\n- Kidney\n- Adrenal Glands\n- Bladder\n- Ovaries\n- Uterus\n- Prostate',
      },
      {
        question: 'Why is this test important?',
        answer:
          'Ezra has designed a non-contrast MRI protocol that is intended to screen for gross lesions, evidence of disease and pre-disease states, as well as other anomalies located anywhere within the head, neck, spine, abdomen and pelvis. Advanced imaging technology allow the test to be performed in under 60 minutes.\n\nIt is important to note that this scan does not directly diagnose cancer or disease and is intended to screen asymptomatic individuals, on a purely proactive basis, to identify areas of concern. We strongly recommend that you maintain a relationship with a primary care provider or other health care provider to discuss follow-up care, if needed, after your appointment.',
      },
      {
        question: 'Test process',
        answer:
          '1. Order your scan.\n2. Your membership advisor will reach out to schedule a convenient time for your appointment at a clinic near you.\n3. Activate your Ezra profile and complete your Medical Questionnaire.\n4. Go to an Ezra Imaging Clinic partner and have your scan done.\n5. Receive your results in 5 business days.\n6. Schedule a consultation with your clinical team to review your results and, if needed, create an action plan.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          "- No fasting is required.\n- It is recommended to eat lighter (e.g. no fried, greasy, heavy foods) and to eat less gassy foods (e.g. soda, seltzer water, beans, broccoli, cabbage, etc.) before the scan.\n- Try to limit fluid intake approximately 1.5 - 2 hours prior to your appointment so you don't feel the need to stop the scan.\n- Connect with your membership advisor if you have any questions or concerns ahead of testing.",
      },
    ],
  },

  [VO2_MAX_TEST]: {
    faqs: [
      {
        question: "What's measured?",
        answer:
          'The VO2 Max test assesses your aerobic capacity, by measuring ventilation, and the maximal oxygen your body can consume during exercise (the oxygen and carbon dioxide concentration of the inhaled and exhaled air). In addition to measuring your fitness level, results will help you establish optimal heart rate (HR) zones for exercise as well as your resting and exercise metabolic rate (RMR / EMR).\n\nYour results will include recorded VO2 and heart rate at start, Aerobic Threshold, Anaerobic Threshold, Max, and 2-minute heart rate recovery data.',
      },
      {
        question: 'Why is this test important?',
        answer:
          'VO2 max is widely used as an indicator of health. In 2016, the American Heart Association published a scientific statement recommending that cardiorespiratory fitness (CRF), quantifiable as VO2 max, be regularly assessed and utilized as a clinical vital sign. This statement was based on mounting evidence that lower fitness levels are associated with high risk of cardiovascular disease, all-cause mortality, and mortality rates stemming from various types of cancers.\n\nAdditionally, understanding your resting and exercise metabolic rates provides increased resolution for structuring weight management, dietary, and fitness plans that are personalized to how your body utilizes fuel in resting and active states.',
      },
      {
        question: 'Test process',
        answer:
          '1. Order your test.\n2. Your membership advisor will reach out to schedule a convenient time for your appointment.\n3. Go to one of our partnered clinics and complete your test.\n4. Receive your results.\n5. Schedule a consultation with your clinical team to review your results and create an action plan.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          '- Do not exercise for 24 hours prior to your appointment.\n- Ensure you are properly hydrated before the test.\n- Do not eat a heavy meal for two to three hours prior to the test.\n- Wear clothing and shoes you would normally exercise in.\n- Connect with your membership advisor if you have any questions or concerns ahead of testing.',
      },
    ],
  },

  [FULL_GENETIC_SEQUENCING]: {
    faqs: [
      {
        question: "What's measured?",
        answer:
          'Genetic variants linked to diseases, carrier status for heritable diseases.',
      },
      {
        question: 'Why is this test important?',
        answer:
          'Can inform on risk factors for diseases, allowing for preventive measures.',
      },
      {
        question: 'Test process',
        answer: 'A saliva sample or cheek swab is typically used for testing.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          'Results can have emotional impacts; consider genetic counseling. Privacy and data security are also concerns.',
      },
    ],
  },

  [DEXA_SCAN]: {
    faqs: [
      {
        question: "What's measured?",
        answer:
          'DEXA technology provides comprehensive, precise measurements of:\n\n- Total body fat mass\n- Total non-fat mass\n- Bone mass\n- Regional body fat and non-fat mass distribution (trunk, arms, legs and android/gynoid regions)\n- Generalized bone mineral density\n- Visceral Fat/Abdominal Fat (VAT) reading.',
      },
      {
        question: 'Why is this test important?',
        answer:
          'Most people are accustomed to stepping on a bathroom scale every now and then, but monitoring weight - while helpful - is not a precise method of assessing wellness and fitness.\n\nA DEXA scan provides an in-depth body fat analysis including segmental fat mass, lean mass, and bone density. Knowing this information about your body is crucial for optimizing your wellness, preventing disease, and tracking change over time.',
      },
      {
        question: 'Test process',
        answer:
          '1. Order your test.\n2. Your membership advisor will reach out to schedule a convenient time for your appointment at a testing location near you.\n3. Go to one of our partnered clinics and complete your test.\n4. Receive your results.\n5. Schedule a consultation with your clinical team to review your results and create an action plan.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          "- Do not wear any items with metal or hard plastic, such as buttons, zippers, jewelry, watches, hair clips, bras with metal clasps or underwires.\n- Inform the technician if you have metal in your body, such as a pin or replacement joint.\n- Do not take calcium supplements for 24 hours prior to testing.\n- Best practice is to perform a 4-hour fast prior to testing, although it's not required.\n- Arrive hydrated to your test.\n- Refrain from this test if you believe you may be pregnant.\n- Attire: Wear comfortable clothes, such as gym attire.\n- Connect with your membership advisor if you have any questions or concerns ahead of testing.",
      },
    ],
  },
};
