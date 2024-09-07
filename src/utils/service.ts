import {
  ServiceDetails,
  TestDetails,
} from '@/components/shared/healthcare-service-info-dialog-content/types/service';
import { HealthcareService } from '@/types/api';
import { TimelineType } from '@/types/timeline';

export const getServiceTimeline = (
  healthcareService: HealthcareService | null,
): TimelineType[] => {
  if (!healthcareService) return [];

  if (healthcareService.phlebotomy) {
    return [
      { title: 'Pre-appointment procedures', complete: true },
      {
        title:
          'Phlebotomist completes your blood draw appointment in ~15 minutes',
        complete: false,
      },
      { title: 'Test results processed within 10 days', complete: false },
      { title: 'Results uploaded ', complete: false },
    ];
  } else {
    return [];
  }
};

export const getDetailsForService = (
  healthcareServiceName: string,
): TestDetails | undefined => {
  const serviceDetails: ServiceDetails = {
    'Superpower Blood Panel': {
      'Why is this test important?': `Proactive laboratory testing can provide targeted insight into you body's current health status, identifying areas of optimal and suboptimal physiologic function. Establish a baseline or track how your body is responding to your Superpower action plan.`,
      'Test Process': `1. Order and schedule your blood panel.

2. Fast and prepare for your appointment.

3. Perform the phlebotomy visit and have your blood draw done.

4. Receive your results within 10 days. 

4. The Superpower clinical team will review your results and create an action plan.`,
      'Pre-test considerations': `°  Hydrate for 24 hours prior to sample collection and after your blood draw is completed. 

° No eating 10 hours prior to the appointment. The sample should be collected in a fasted state. 

° No caffeine 10 hours prior to your appointment -- just water. 

° Continue taking your medications and supplements as scheduled. 

° Text the Superpower SMS Concierge if you have any questions or concerns ahead of testing.`,
    },
    'Custom Blood Panel': {
      'Why is this test important?': `Proactive laboratory testing can provide targeted insight into you body's current health status, identifying areas of optimal and suboptimal physiologic function. Establish a baseline or track how your body is responding to your Superpower action plan.`,
      'Test Process': `1. Order and schedule your custom blood panel.

2. Fast and prepare for your appointment.

3. Perform the phlebotomy visit and have your blood draw done.

4. Receive your results within 10 days. 

4. The Superpower clinical team will review your results and create an action plan.`,
      'Pre-test considerations': `°  Hydrate for 24 hours prior to sample collection and after your blood draw is completed. 

° No eating 10 hours prior to the appointment. The sample should be collected in a fasted state. 

° No caffeine 10 hours prior to your appointment -- just water. 

° Continue taking your medications and supplements as scheduled. 

° Text the Superpower SMS Concierge if you have any questions or concerns ahead of testing.`,
    },
    'Grail Galleri Multi Cancer Test': {
      "What's measured?": `Galleri is a cancer screening test that leverages DNA sequencing and pattern-recognition technology to screen for the presence of a cancer signal and predict its most likely origin. Galleri uses DNA sequencing technology to analyze DNA fragments circulating in the blood, also known as cell-free DNA (cfDNA). Both non-cancer and cancer cells release cfDNA into the blood, but cfDNA from cancer cells has methylation patterns that are specific to cancer. Galleri checks over 1 million methylation sites covering >100,000 genomic regions in cfDNA and applies machine learning and pattern-recognition to identify abnormal methylation patterns that could signal the presence of cancer.

It is important to note that the Galleri test does not directly detect or diagnose cancer, but rather is capable of assessing the presence of DNA mutations associated with the development of several types of cancer.`,
      'Why is this test important?': `
Cancer risk increases for everyone as they age regardless of family history—only 5% to 10% of cancers are inherited. Age is the biggest risk factor for cancer. In fact, adults over age 50 are 13 times more likely to have cancer compared to people under the age of 50. 

Before ordering the test, you will meet with your dedicated Superpower physician to discuss your risk factors to determine whether this test is appropriate for you. `,
      'Test process': `1.  Your membership advisor will reach out to schedule a pre-test consultation with your physician to discuss the risk & benefits of testing.

2. We'll order your test kit and deliver it directly to your house or confirmed address in 3-5 days.

3. Schedule your at-home blood draw appointment with a phlebotomist via your membership advisor.

4. Receive your results within 2-3 weeks. 

5. Schedule a consultation with your physician to review your results and create an action plan.`,
      'Pre-test considerations': `There are no fasting requirements associated with this test. 
Connect with your membership advisor if you have any questions or concerns ahead of testing.`,
    },
    'Food & Environmental Allergy Testing': {
      "What's measured?": `This test measures IgE antibodies to over 150 food and environmental allergens as well as IgG antibodies to over 250 food allergens across the following categories:

      ° Pollen, including grass,
      trees, and weeds
      ° Mites
      ° Microorganisms and Spores,
      including yeast and mold
      ° Plant foods
      ° Cereals, including wheat,
      rye, barley, and more
      ° Fruits and Vegetables
      ° Nuts and Seeds, including
      component testing for
      peanuts, pecans, walnuts,
      poppy seeds
      ° Animal Food, including milk,
      eggs, seafood, and meat
      ° Insect Venoms, including
      component testing for
      wasps and honeybees`,
      'Test Process': `1. Order your test kit -- we'll deliver it directly to your house in 3-5 days.

2. Your membership advisor will reach out to schedule your at-home blood draw appointment with a phlebotomist.

3. Receive your results within two weeks. 

4. Schedule a consultation with your clinical team to review your results and create an action plan.`,
      'Why is this test important?': `There are important differences between food allergies and food allergies. Different arms of the immune system facilitate both conditions. True allergies are immediate, potentially life-threatening, mast-cell mediated, and often involve IgE antibodies, whereas food sensitivities are delayed reactions and elicit IgG antibodies.

It's best practice to measure IgE and IgG antibodies together as they independently create inflammation and play a role in symptoms driven by food. A food can elicit an IgE sensitivity response, an IgG antibody response, or both.`,
      'Pre-test considerations': `1. Hydrate the day prior to sample collection.

2. Drink water 30 minutes before you draw your blood.

3. Continue taking any nutritional supplements and medications unless advised differently by your healthcare provider.
    `,
    },
    'Environmental Toxins': {
      'Why is this test important?': `Toxic overload can manifest in a variety of biological organs, tissue, and cellular-level systems. Testing for environmental toxins can help uncover the root causes of toxicity and chronic illness from environmental sources and create personalized wellness solutions to begin healing.`,
      'Test process': `1. Order your test kit -- we'll deliver it directly to your house or confirmed in 3-5 days

2. Self-collect your sample 

3. Your membership advisor will reach out to schedule a  convenient time to have your sample picked up and shipped to the lab for you. 

3. Receive your results within two weeks. 

4. Schedule a consultation with your clinical team to review your results and create an action plan.`,
      'Pre-test considerations': `1. Do not collect samples while menstruating. 
2. Fasting is not required. However, fasting for 24 hours may increase the excretion of toxic chemicals. 
3. Please consult your healthcare practitioner prior to fasting. 
4. Do not drink more than 8 oz water 1 hour prior to urine collection. `,
    },
    'Intestinal Permeability Panel': {
      "What's measured?": `
      The following key markers can be found within the Wheat Zoomer tests:
      - All known deamidated gliadins
      - Alpha, alpha-beta, gamma and omega gliadin
      - HMW and LMW glutenin family
      - Zonulin protein
      - Anti-zonulin
      - Anti-actin
      - Anti-lipopolysaccharide (LPS)
      - tTG-DGP Fusion Peptides
      - Wheat germ agglutinin (WGA)
      - Differential transglutaminase: 2, 3 and 6
      - Wheat IgE antibodies (for wheat allergies)
      - Non-gluten wheat proteins
      - Farinins
      - Globulins
      - Serpins
      - Amylase/Protease Inhibitors`,
      'Why is this test important?': `One out of seven Americans is at least somewhat sensitive to wheat. This sensitivity may damage the intestinal lining, causing further inflammation.
Uncovering wheat sensitivities is an easy and critical step in developing a nutritional plan to reduce inflammation and prevent disease.`,
      'Test process': `1. Order your test kit -- we'll deliver it directly to your house in 3-5 days.

2. Your membership advisor will reach out to schedule your at-home blood draw appointment with a phlebotomist.

3. Receive your results within two weeks. 

4. Schedule a consultation with your clinical team to review your results and create an action plan.`,
      'Pre-test considerations': `
1. If you are currently taking (or have recently taken) any of the following medications, consult your healthcare provider regarding the timing of collection.
  -Steroids
  -Immunosuppressive medications
  -Biologic agents
  -Other immunomodulating medications
2. Hydrate the day prior to the test.
3. Freeze the provided ice packs for at least 24 hours prior to your blood draw.
    `,
    },
    'PFAS Chemicals': {
      "What's measured?": `The PFAS chemical test measures 21 different toxin markers in your blood associated with exposure to perfluoroalkyl and polyfluoroalkyl chemicals, commonly called ‘PFAS.’`,
      'Test process': `1. Order your test kit -- we'll deliver it directly to your house or confirmed in 3-5 days

2. Self-collect your sample 

3. Your membership advisor will reach out to schedule a  convenient time to have your sample picked up and shipped to the lab for you. 

3. Receive your results within two weeks. 

4. Schedule a consultation with your clinical team to review your results and create an action plan.`,
      'Why is this test important?': `
Testing for PFAS chemicals in your blood is important because:

°Toxins can bioaccumulate and persist in the body for decades, breaking down slowly or not at all. Toxic build-up can impair detoxification, compromise immunity, and increase oxidative stress.

°Testing for PFAS can reveal the status of toxic metabolites in the body.

°Knowing your PFAS exposure level is the first step to reducing toxic risk and creating a personalized detox and wellness plan to achieve better health.
    `,
      'Pre-test considerations': `1. Do not collect samples while menstruating. 
2. Fasting is not required. However, fasting for 12-24 hours prior to 
    collection may increase the excretion of toxins. 
3. Please consult your healthcare provider prior to fasting. 
4. Do not drink more than 8 oz water 1 hour prior to urine collection.`,
    },
    'Continuous Glucose Monitor': {
      "What's measured?": `A continuous glucose monitor (CGM) measures your interstitial blood glucose level in real-time with automatic readings sent to your smartphone.`,
      'Why is this test important?': `Data from continuous glucose monitors can be useful for early detection of insulin resistance and diabetes. Additionally, it provides real-time insight into how our blood sugar is affected by the foods we eat and our lifestyle habits.`,
      'Test process': `
1. Order your CGM -- we'll deliver it directly to your house in 3-5 days.

2. Your membership advisor will reach out to help guide you through the CGM's application.

3. If interested, schedule a consultation with your clinical team to review your results and create an action plan.`,
      'Pre-test considerations': `Connect with your membership advisor if you have any questions or concerns regarding the application of the device.`,
    },
    'Heart Calcium Scan': {
      "What's measured?": `Level of calcification in coronary arteries, indicating heart disease risk.`,
      // priceTextOverride: 'Price available on request.',
      // extendedDescription: `A coronary calcium score measures plaque built up in heart arteries and can reasonably predict the likelihood of a future heart attack.`,
      'Why is this test important?': `Important for assessing the risk of heart disease, especially in those with risk factors but no symptoms.`,
      'Test process': `A CT scan is used, involving brief exposure to radiation.`,
      'Pre-test considerations': `Involves radiation exposure; not recommended for routine screening in low-risk individuals.`,
    },
    'Gut Microbiome Analysis': {
      "What's measured?": `Balance of bacteria, presence of harmful organisms, diversity, and health of microbiome.`,
      'Why is this test important?': `Helps in understanding gut health, which can impact digestion, immunity, and even mood.`,
      'Test process': `A stool sample is collected and sent to a lab for analysis.`,
      'Pre-test considerations': `Non-invasive but requires careful sample collection. Diet and medication can influence results.`,
    },
    'Full Body MRI': {
      // extendedDescription: `This comprehensive scan uses magnetic resonance imaging to screen for early cancer and disease across your entire body with no exposure to radiation.`,
      "What's measured?": `The Full Body MRI takes a comprehensive and detailed set of images of your major organs, including the following:

      ° Brain
      ° Spine
      ° Thyroid
      ° Gallbladder
      ° Pancreas
      ° Spleen
      ° Liver
      ° Kidney
      ° Adrenal Glands
      ° Bladder
      ° Ovaries
      ° Uterus
      ° Prostate`,
      'Why is this test important?': `Ezra has designed a non-contrast MRI protocol that is intended to screen for gross lesions, evidence of disease and pre-disease states, as well as other anomalies located anywhere within the head, neck, spine, abdomen and pelvis. Advanced imaging technology allow the test to be performed in under 60 minutes. 

It is important to note that this scan does not directly diagnose cancer or disease and is intended to screen asymptomatic individuals, on a purely proactive basis, to identify areas of concern. We strongly recommend that you maintain a relationship with a primary care provider or other health care provider to discuss follow-up care, if needed, after your appointment.`,
      'Test process': `1. Order your scan. 

2. Your membership advisor will reach out to schedule a convenient time for your appointment at a clinic near you.

3. Activate your Ezra profile and complete your Medical Questionnaire.

4. Go to an Ezra Imaging Clinic partner and have your scan done. 

5. Receive your results in 5 business days.

6. Schedule a consultation with your clinical team to review your results and, if needed, create an action plan.`,
      'Pre-test considerations': `° No fasting is required.

° It is recommended to eat lighter (e.g. no fried, greasy, heavy foods) and to eat less gassy foods (e.g. soda, seltzer water, beans, broccoli, cabbage, etc.) before the scan.

° Try to limit fluid intake approximately 1.5 – 2 hours prior to your appointment so you don’t feel the need to stop the scan.

° Connect with your membership advisor if you have any questions or concerns ahead of testing.`,
    },
    'VO2 Max Test': {
      "What's measured?": `The VO2 Max test assesses your aerobic capacity, by measuring ventilation, and the maximal oxygen your body can consume during exercise (the oxygen and carbon dioxide concentration of the inhaled and exhaled air). In addition to measuring your fitness level, results will help you establish optimal heart rate (HR) zones for exercise as well as your resting and exercise metabolic rate (RMR / EMR).

Your results will include recorded VO2 and heart rate at start, Aerobic Threshold, Anaerobic Threshold, Max, and 2-minute heart rate recovery data.`,
      'Why is this test important?': `VO2 max is widely used as an indicator of health. In 2016, the American Heart Association published a scientific statement recommending that cardiorespiratory fitness (CRF), quantifiable as VO2 max, be regularly assessed and utilized as a clinical vital sign. This statement was based on mounting evidence that lower fitness levels are associated with high risk of cardiovascular disease, all-cause mortality, and mortality rates stemming from various types of cancers.

Additionally, understanding your resting and exercise metabolic rates provides increased resolution for structuring weight management, dietary, and fitness plans that are personalized to how your body utilizes fuel in resting and active states. `,
      'Test process': `1. Order your test. 

2. Your membership advisor will reach out to schedule a convenient time for your appointment.

4. Go to one of our partnered clinics and complete your test. 

5. Receive your results.

6. Schedule a consultation with your clinical team to review your results and create an action plan.`,
      'Pre-test considerations': `° Do not exercise for 24 hours prior to your appointment.

° Ensure you are properly hydrated before the test.

° Do not eat a heavy meal for two to three hours prior to the test.  

° Wear clothing and shoes you would normally exercise in.

° Connect with your membership advisor if you have any questions or concerns ahead of testing.`,
    },
    'Full Genetic Sequencing': {
      "What's measured?": `Genetic variants linked to diseases, carrier status for heritable diseases.`,
      'Why is this test important?': `Can inform on risk factors for diseases, allowing for preventive measures.`,
      'Test process': `A saliva sample or cheek swab is typically used for testing.`,
      'Pre-test considerations': `Results can have emotional impacts; consider genetic counseling. Privacy and data security are also concerns.`,
    },
    'DEXA Scan': {
      "What's measured?": `DEXA technology provides comprehensive, precise measurements of:

° Total body fat mass

° Total non-fat mass

° Bone mass

° Regional body fat and non-fat mass distribution (trunk, arms, legs and android/gynoid regions)

° Generalized bone mineral density

° Visceral Fat/Abdominal Fat (VAT) reading.`,
      'Why is this test important?': `Most people are accustomed to stepping on a bathroom scale every now and then, but monitoring weight – while helpful – is not a precise method of assessing wellness and fitness. 

A DEXA scan provides an in-depth body fat analysis including segmental fat mass, lean mass, and bone density. Knowing this information about your body is crucial for optimizing your wellness, preventing disease, and tracking change over time.`,
      'Test process': `1. Order your test. 

2. Your membership advisor will reach out to schedule a convenient time for your appointment at a testing location near you.

4. Go to one of our partnered clinics and complete your test. 

5. Receive your results.

6. Schedule a consultation with your clinical team to review your results and create an action plan.`,
      'Pre-test considerations': `° Do not wear any items with metal or hard plastic, such as buttons, zippers, jewelry, watches, hair clips, bras with metal clasps or underwires. 

° Inform the technician if you have metal in your body, such as a pin or replacement joint.

° Do not take calcium supplements for 24 hours prior to testing. 

° Best practice is to perform a 4-hour fast prior to testing, although it's not required.

° Arrive hydrated to your test.

° Refrain from this test if you believe you may be pregnant.

° Attire: Wear comfortable clothes, such as gym attire.

° Connect with your membership advisor if you have any questions or concerns ahead of testing. `,
    },
  };

  return serviceDetails[healthcareServiceName];
};
