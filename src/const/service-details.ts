import {
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  GUT_MICROBIOME_ANALYSIS,
  TOTAL_TOXIN_TEST,
} from '@/const/services';
import { ServiceDetails } from '@/types/service';

export const SERVICE_DETAILS: Record<string, ServiceDetails> = {
  'Superpower Blood Panel': {
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
          '- Hydrate for 24 hours prior to sample collection and after your blood draw is completed.\n- No eating 10 hours prior to the appointment. The sample should be collected in a fasted state.\n- No caffeine 10 hours prior to your appointment -- just water.\n- Continue taking your medications and supplements as scheduled.\n- Text the Superpower SMS Concierge if you have any questions or concerns ahead of testing.',
      },
    ],
  },

  'Advanced Blood Panel': {
    faqs: [
      {
        question: "What's tested?",
        answer: 'https://superpower.com/biomarkers',
      },
      {
        question: 'Why is this test important?',
        answer:
          "Proactive laboratory testing can provide targeted insight into you body's current health status, identifying areas of optimal and suboptimal physiologic function. The advanced panel dives into further areas of health that are not covered in our baseline panel, including heavy metal testing, certain key nutrients like omega fatty acids, and even critical hormones like cortisol that may be causing you stress. Furthermore, this test can serve to track how your body is responding to your Superpower action plan.",
      },
      {
        question: 'Test Process',
        answer:
          '1. Order and schedule your advanced blood panel.\n2. Fast and prepare for your at-home appointment.\n3. Receive your phlebotomist and have your blood draw done.\n4. Receive your results within 10 days.\n5. Schedule a consultation with your clinical team to review your results and create an action plan.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          '- Hydrate for 24 hours prior to sample collection and after your blood draw is completed.\n- No eating 10 hours prior to the appointment. The sample should be collected in a fasted state.\n- No caffeine 10 hours prior to your appointment -- just water.\n- Continue taking your medications and supplements as scheduled.',
      },
    ],
  },

  'Custom Blood Panel': {
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

  [GRAIL_GALLERI_MULTI_CANCER_TEST]: {
    image: '/services/transparent/grail_galleri_multi_cancer_test.png',
    faqs: [
      {
        question: 'Why this matters?',
        answer:
          "- Cancer risk increases with age, regardless of family history.\n- Only 5–10% of cancers are inherited — meaning most are not genetic.\n- The remaining 90–95% are sporadic, caused by environmental exposures, lifestyle and aging-related somatic mutations\n- Adults over 50 are 13× more likely to develop cancer than those under 50.\n\nEarly detection saves lives. Most cancers show no symptoms until it's too late.",
      },
      {
        question: "What's measured?",
        answer:
          "The Galleri test uses advanced DNA sequencing and machine learning to analyze fragments of DNA (cfDNA) in your blood.\n\nCancer cells shed DNA with unique methylation patterns. Galleri checks over 1 million sites to detect abnormalities that may signal cancer and predict where it's coming from.",
      },
      {
        question: "What's the process?",
        answer:
          '1. Receive your kit at home in 3–5 days.\n2. Schedule an at-home blood draw with a licensed phlebotomist (no fasting required).\n3. Get results in 2–3 weeks via your Superpower dashboard.\n4. (Optional) Book a consultation to review results with our care team.',
      },
    ],
  },

  'Food & Environmental Allergy Testing': {
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
    image: '/services/transparent/total_toxins.png',
    faqs: [
      {
        question: 'Why this matters?',
        answer:
          '- Toxins can build up silently in your body for decades.\n- Exposure to specific toxins can impair detoxification processes, affect immune function, and increase oxidative stress.\n- These physiological disruptions are associated with symptoms like fatigue and cognitive difficulties.\n\nMost people carry toxins, but have never measured them.',
      },
      {
        question: "What's measured?",
        answer:
          '1. Heavy Metals Panel: Screens for 20+ toxic elements, including lead, mercury, arsenic, aluminum, and uranium — often found in air, water, and food.\n2. Mycotoxins Panel (Mold Toxins): Detects toxic compounds produced by mold (e.g. in coffee, grains, nuts) — categorized by Aflatoxins, Trichothecenes, and more.\n3. Environmental Toxins Panel: Measures exposure to pesticides, plastics (like BPA), preservatives, and volatile organic compounds — all of which strain your detox system and hormones.',
      },
      {
        question: "What's the process?",
        answer:
          "This is a non-invasive at-home urine test.\n\n1. Collect your first-morning urine sample following simple instructions.\n2. We recommend fasting for 12 hours for optimal mycotoxin detection.\n3. Avoid foods high in iodine or selenium before testing to ensure accurate results.\n\nWe'll ship your sample kit, you'll send it to our lab, and results will appear in your Superpower dashboard.",
      },
    ],
  },

  'Heavy Metals': {
    faqs: [
      {
        question: "What's measured?",
        answer:
          'The Heavy Metals panel tests for exposure to harmful heavy metals and elements such as arsenic, lead, mercury and more.\n\nHeavy metals can be found in all regions of the United States and can accumulate in air, soil, drinking and groundwater sources.\n\nThose who are immunocompromised, have impaired liver function, or have reduced antioxidants and mineral activity can benefit from this panel.\n\nThe heavy metals measured in the test include: Beryllium, Aluminum, Nickel, Arsenic, Palladium, Cadmium, Antimony, Tin, Tellurium, Cesium, Barium, Gadolinium, Tungsten, Platinum, Mercury, Lead, Thallium, Bismuth, Thorium, Uranium',
      },
      {
        question: 'Why is this test important?',
        answer:
          'Heavy metal toxicity is thought to affect over 1 million people annually, including children.\n\nIt is often underrepresented as a root cause of illness and disease in humans and can affect virtually all body systems.\n\nThe World Health Organization considers 13 heavy metals to be of significance to human and environmental health, but there are additional metals and metalloids that may be significant causes of disease and chronic illness in humans.\n\nHeavy metal exposure may also be the root cause of neurological disorders, gastrointestinal disorders, autoimmune disease, and disorders associated with increased oxidative stress and cellular dysfunction.',
      },
      {
        question: 'Test process',
        answer:
          '1. Follow our simple instructions to perform this urine test at home\n2. Before testing, there is no need to fast, however your longevity advisor may ask you to discontinue medications or dietary supplements. Speak to your care team to learn more.\n3. Send the test to our labs for analysis and speak to your care team to understand the results.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          'Urine test is required. There are no fasting requirements associated with this test. Connect with your membership advisor if you have any questions or concerns ahead of testing',
      },
    ],
  },

  'Environmental Toxin': {
    faqs: [
      {
        question: "What's measured?",
        answer:
          'The Environmental Toxins panel measures levels of environmental toxins in the body. Environmental toxins or toxicants are substances that are man-made or that occur naturally in the environment and can cause acute or chronic toxic overload when absorbed, inhaled, or ingested.\n\nThis test will measure various key markers such as your exposure to pesticides, herbicides, plastics, preservatives and other volatile organic compounds.',
      },
      {
        question: 'Why is this test important?',
        answer:
          'The average America is exposed to over 700,000 toxins a day and over 80,000 chemicals.\n\nToxic overload can manifest in a variety of biological organs, tissue, and cellular-level systems and can be difficult to diagnose.\n\nEnvironmental toxins wreak havoc on the body and can cause chronic inflammation and various serious diseases including cancer.\n\nTesting for environmental toxins can help patients uncover the root causes of toxicity and chronic illness from environmental sources and create personalized wellness solutions to begin healing.',
      },
      {
        question: 'Test process',
        answer:
          '1. Follow our simple instructions to perform this urine test at home\n2. Before testing, there is no need to fast, however your longevity advisor may ask you to discontinue medications or dietary supplements. Speak to your care team to learn more.\n3. Send the test to our labs for analysis and speak to your care team to understand the results',
      },
      {
        question: 'Pre-test considerations',
        answer:
          'Urine test is required. There are no fasting requirements associated with this test. Connect with your membership advisor if you have any questions or concerns ahead of testing.',
      },
    ],
  },

  Mycotoxins: {
    faqs: [
      {
        question: "What's measured?",
        answer:
          'Mycotoxins are toxic compounds produced by certain types of fungi. These fungi can grow on various agricultural products such as grains, nuts, spices, dried fruits, apples, and coffee beans.\n\nThe Mycotoxin test is used to identify and quantify the level of a large set of mycotixins from both and environmental molds and give you a complete picture of your levels of mycotoxins from your urine. The results are provided in 3 tables subgrouping the mycotoxins into Aflatoxins, Trichothecenes and Other Mycotoxins.',
      },
      {
        question: 'Why is this test important?',
        answer:
          "According to the World Health Organization and Food and Agricultural Organization, 25% of the world's agricultural products are contaminated with mycotoxins.\n\nSymptoms of mycotoxin toxicity are often general and vague, and thus difficult to diagnose, leaving you at risk of long-term health damage.\n\nHigh exposure to mycotoxins can lead to severe health risks, including liver and kidney damage, immune suppression, gastrointestinal issues, respiratory problems, hormonal disruption, neurological effects, and an increased risk of cancer.\n\nA panel test is crucial for identifying exposure to toxic compounds and early detection can prevent serious long-term effects like cancer and organ damage.\n\nIf you were diagnosed with or suspect toxic burden, impaired immunity, autoimmune disease, or exposure to mold, this panel may also benefit you.",
      },
      {
        question: 'Test process',
        answer:
          '1. Follow our simple instructions to perform this urine test at home.\n2. Before testing, there is no need to fast. However, fasting for 12 hours may increase the number of mycotoxins excreted in urine, so your longevity advisor may recommend fasting for 12 hours prior to testing. It is recommended for best test performance to collect the first-morning urine upon awakening, prior to eating or drinking. Your longevity advisor may ask you to discontinue medications or dietary supplements. Speak to your care team to learn more.\n3. Send the test to our labs for analysis and speak to your care team to understand the results.',
      },
      {
        question: 'Pre-test considerations',
        answer:
          'Urine test is required. There are no fasting requirements associated with this test. Connect with your membership advisor if you have any questions or concerns ahead of testing.',
      },
    ],
  },

  'Environmental Toxins': {
    faqs: [
      {
        question: 'Why is this test important?',
        answer:
          'Toxic overload can manifest in a variety of biological organs, tissue, and cellular-level systems. Testing for environmental toxins can help uncover the root causes of toxicity and chronic illness from environmental sources and create personalized wellness solutions to begin healing.',
      },
      {
        question: 'Test process',
        answer:
          "1. Order your test kit -- we'll deliver it directly to your house or confirmed in 3-5 days\n2. Self-collect your sample\n3. Your membership advisor will reach out to schedule a convenient time to have your sample picked up and shipped to the lab for you.\n4. Receive your results within two weeks.\n5. Schedule a consultation with your longevity advisor team to review your results and create an action plan.",
      },
      {
        question: 'Pre-test considerations',
        answer:
          '1. Do not collect samples while menstruating.\n2. Fasting is not required. However, fasting for 24 hours may increase the excretion of toxic chemicals.\n3. Please consult your healthcare practitioner prior to fasting.\n4. Do not drink more than 8 oz water 1 hour prior to urine collection.',
      },
    ],
  },

  'Intestinal Permeability Panel': {
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

  'PFAS Chemicals': {
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

  'Continuous Glucose Monitor': {
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

  'Heart Calcium Scan': {
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

  'Full Body MRI': {
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
          "- No fasting is required.\n- It is recommended to eat lighter (e.g. no fried, greasy, heavy foods) and to eat less gassy foods (e.g. soda, seltzer water, beans, broccoli, cabbage, etc.) before the scan.\n- Try to limit fluid intake approximately 1.5 – 2 hours prior to your appointment so you don't feel the need to stop the scan.\n- Connect with your membership advisor if you have any questions or concerns ahead of testing.",
      },
    ],
  },

  'VO2 Max Test': {
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

  'Full Genetic Sequencing': {
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

  'DEXA Scan': {
    faqs: [
      {
        question: "What's measured?",
        answer:
          'DEXA technology provides comprehensive, precise measurements of:\n\n- Total body fat mass\n- Total non-fat mass\n- Bone mass\n- Regional body fat and non-fat mass distribution (trunk, arms, legs and android/gynoid regions)\n- Generalized bone mineral density\n- Visceral Fat/Abdominal Fat (VAT) reading.',
      },
      {
        question: 'Why is this test important?',
        answer:
          'Most people are accustomed to stepping on a bathroom scale every now and then, but monitoring weight – while helpful – is not a precise method of assessing wellness and fitness.\n\nA DEXA scan provides an in-depth body fat analysis including segmental fat mass, lean mass, and bone density. Knowing this information about your body is crucial for optimizing your wellness, preventing disease, and tracking change over time.',
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
