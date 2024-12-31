import {
  ServiceDetails,
  TestDetails,
} from '@/components/shared/healthcare-service-info-dialog-content/types/service';
import { AnimatedTimelineType } from '@/components/ui/animated-timeline';
import {
  AGREEMENT_COPIES,
  ENVIRONMENTAL_TOXINS,
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  GUT_MICROBIOME_ANALYSIS,
  LEGAL_DESCLAIMERS,
  TOTAL_TOXIN_TEST,
} from '@/const';
import { CollectionMethodType, HealthcareService } from '@/types/api';

export const getServiceTimeline = (
  healthcareService: HealthcareService | null,
  collectionMethod: CollectionMethodType | null,
): AnimatedTimelineType[] => {
  if (!healthcareService) return [];

  if (healthcareService.phlebotomy) {
    return [
      { title: 'Test ordered', complete: true },
      { title: 'Schedule a test appointment', complete: true },
      {
        title:
          collectionMethod === 'IN_LAB'
            ? 'Phlebotomist completes your blood draw appointment in ~15 minutes'
            : 'At-home testing',
        complete: false,
      },
      { title: 'Test results processed within 10 days', complete: false },
      { title: 'Results uploaded', complete: false },
      { title: 'Schedule a follow-up appointment', complete: false },
    ];
  }

  switch (healthcareService.name) {
    case GUT_MICROBIOME_ANALYSIS: {
      return [
        { title: 'Test ordered', complete: true },
        {
          title: 'At-home testing',
          complete: false,
        },
        { title: 'Test results processed within 2-4 weeks', complete: false },
        { title: 'Results uploaded', complete: false },
        { title: 'Schedule a follow-up appointment', complete: false },
      ];
    }
    default: {
      return [];
    }
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

    'Advanced Blood Panel': {
      'Why is this test important?': `Proactive laboratory testing can provide targeted insight into you body's current health status, identifying areas of optimal and suboptimal physiologic function. The advanced panel dives into further areas of health that are not covered in our baseline panel, including heavy metal testing, certain key nutrients like omega fatty acids, and even critical hormones like cortisol that may be causing you stress. Furthermore, this test can serve to track how your body is responding to your Superpower action plan.`,
      'Test Process': `"1. Order and schedule your advanced blood panel.

2. Fast and prepare for your at-home appointment.

3. Receive your phlebotomist and have your blood draw done.

4. Receive your results within 10 days.

5. Schedule a consultation with your clinical team to review your results and create an action plan."`,
      'Pre-test considerations': `°  Hydrate for 24 hours prior to sample collection and after your blood draw is completed.

° No eating 10 hours prior to the appointment. The sample should be collected in a fasted state.

° No caffeine 10 hours prior to your appointment -- just water.

° Continue taking your medications and supplements as scheduled.`,
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
      'Why is this test important?': `Cancer risk increases for everyone as they age regardless of family history—only 5% to 10% of cancers are inherited. Age is the biggest risk factor for cancer. In fact, adults over age 50 are 13 times more likely to have cancer compared to people under the age of 50.`,
      'Test process': `1. We'll order your test kit and deliver it directly to your house or confirmed address in 3-5 days.

2. Schedule your at-home blood draw appointment with a phlebotomist via your membership advisor.

3. Receive your results within 2-3 weeks. 

4. Schedule an optional consultation to review your results.`,
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

    'Total Toxins': {
      "What's measured?": `This test is a highly comprehensive test that measures your mycotoxins, heavy metals and environmental toxins which all elevate oxidative stress and increase demand on the body's detoxification pathways.

Mycotoxins are toxic compounds produced by certain types of fungi. These fungi can grow on various agricultural products e.g. grains, nuts, spices, dried fruits, apples, and coffee beans. You will get a complete picture of your mycotoxins sub grouped into Aflatoxins, Trichothecenes and Other Mycotoxins.

The Environmental Toxins test measures levels of environmental toxins in the body and various key markers such as your exposure to pesticides, herbicides, plastics, preservatives and other volatile organic compounds.

The Heavy Metals panel tests for exposure to harmful heavy metals and elements such as arsenic, lead, mercury and more that can be found in all regions of the United States  such as the air, soil, and water sources.

The heavy metals measured in the test include: Beryllium, Aluminum, Nickel, Arsenic, Palladium, Cadmium, Antimony, Tin, Tellurium, Cesium, Barium, Gadolinium, Tungsten, Platinum, Mercury, Lead, Thallium, Bismuth, Thorium, Uranium`,
      'Why is this test important?': `Many toxins bioaccumulate (build up) and persist in the body for decades, breaking down slowly or not at all, leaving you susceptible to other toxic build-ups or susceptibility to infections through impaired detoxification, compromised immunity, and increased oxidative stress.

The Total Tox Burden is a simple and quick test that provides complete insight into the levels of heavy metals, mold toxins, and environmental toxins in your body.

Knowing your toxic burden is the first step to creating a personalized detox and wellness plan to achieve better health.`,
      'Test process': `1. Follow our simple instructions to perform this urine test at home.
      
2. Before testing: There is no need to fast. However, fasting for 12 hours may increase the number of mycotoxins excreted in urine, so your clinician may recommend fasting for 12 hours prior to testing.

It is recommended for best test performance to collect the first-morning urine upon awakening, prior to eating or drinking.

Your clinician may ask you to discontinue medications or dietary supplements. Speak to your care team to learn more.

Avoid foods high in iodine (seafood, dairy, and seaweed) and selenium (Brazil nuts) as they may cause falsely lowered heavy metal results.

3. Send the sample to our labs for analysis and work with your care provider to understand the results`,
      'Pre-test considerations': `Urine test is required. There are no fasting requirements associated with this test. Connect with your membership advisor if you have any questions or concerns ahead of testing.`,
    },

    'Heavy Metals': {
      "What's measured?": `The Heavy Metals panel tests for exposure to harmful heavy metals and elements such as arsenic, lead, mercury and more.

Heavy metals can be found in all regions of the United States and can accumulate in air, soil, drinking and groundwater sources.

Those who are immunocompromised, have impaired liver function, or have reduced antioxidants and mineral activity can benefit from this panel.

The heavy metals measured in the test include: Beryllium, Aluminum, Nickel, Arsenic, Palladium, Cadmium, Antimony, Tin, Tellurium, Cesium, Barium, Gadolinium, Tungsten, Platinum, Mercury, Lead, Thallium, Bismuth, Thorium, Uranium`,
      'Why is this test important?': `Heavy metal toxicity is thought to affect over 1 million people annually, including children.

It is often underrepresented as a root cause of illness and disease in humans and can affect virtually all body systems.

The World Health Organization considers 13 heavy metals to be of significance to human and environmental health, but there are additional metals and metalloids that may be significant causes of disease and chronic illness in humans.

Heavy metal exposure may also be the root cause of neurological disorders, gastrointestinal disorders, autoimmune disease, and disorders associated with increased oxidative stress and cellular dysfunction.`,
      'Test process': `
1. Follow our simple instructions to perform this urine test at home
2. Before testing, there is no need to fast, however your clinician may ask you to discontinue medications or dietary supplements. Speak to your care team to learn more.
3. Send the test to our labs for analysis and speak to your care team to understand the results.`,
      'Pre-test considerations': `Urine test is required. There are no fasting requirements associated with this test.
Connect with your membership advisor if you have any questions or concerns ahead of testing`,
    },

    'Environmental Toxin': {
      "What's measured?": `The Environmental Toxins panel measures levels of environmental toxins in the body. Environmental toxins or toxicants are substances that are man-made or that occur naturally in the environment and can cause acute or chronic toxic overload when absorbed, inhaled, or ingested.

This test will measure various key markers such as your exposure to pesticides, herbicides, plastics, preservatives and other volatile organic compounds.`,
      'Why is this test important?': `The average America is exposed to over 700,000 toxins a day and over 80,000 chemicals.

Toxic overload can manifest in a variety of biological organs, tissue, and cellular-level systems and can be difficult to diagnose.

Environmental toxins wreak havoc on the body and can cause chronic inflammation and various serious diseases including cancer.

Testing for environmental toxins can help patients uncover the root causes of toxicity and chronic illness from environmental sources and create personalized wellness solutions to begin healing.`,
      'Test process': `1. Follow our simple instructions to perform this urine test at home
2. Before testing, there is no need to fast, however your clinician may ask you to discontinue medications or dietary supplements. Speak to your care team to learn more.
3. Send the test to our labs for analysis and speak to your care team to understand the results`,
      'Pre-test considerations': `Urine test is required. There are no fasting requirements associated with this test.
Connect with your membership advisor if you have any questions or concerns ahead of testing.`,
    },

    Mycotoxins: {
      "What's measured?": `Mycotoxins are toxic compounds produced by certain types of fungi. These fungi can grow on various agricultural products such as grains, nuts, spices, dried fruits, apples, and coffee beans.

The Mycotoxin test is used to identify and quantify the level of a large set of mycotixins from both and environmental molds and give you a complete picture of your levels of mycotoxins from your urine. The results are provided in 3 tables subgrouping the mycotoxins into Aflatoxins, Trichothecenes and Other Mycotoxins.`,
      'Why is this test important?': `According to the World Health Organization and Food and Agricultural Organization, 25% of the world’s agricultural products are contaminated with mycotoxins.

Symptoms of mycotoxin toxicity are often general and vague, and thus difficult to diagnose, leaving you at risk of long-term health damage.

High exposure to mycotoxins can lead to severe health risks, including liver and kidney damage, immune suppression, gastrointestinal issues, respiratory problems, hormonal disruption, neurological effects, and an increased risk of cancer.

A panel test is crucial for identifying exposure to toxic compounds and early detection can prevent serious long-term effects like cancer and organ damage.

If you were diagnosed with or suspect toxic burden, impaired immunity, autoimmune disease, or exposure to mold, this panel may also benefit you.`,
      'Test process': `
1. Follow our simple instructions to perform this urine test at home.
2. Before testing, there is no need to fast. However, fasting for 12 hours may increase the number of mycotoxins excreted in urine, so your clinician may recommend fasting for 12 hours prior to testing.

It is recommended for best test performance to collect the first-morning urine upon awakening, prior to eating or drinking.

Your clinician may ask you to discontinue medications or dietary supplements. Speak to your care team to learn more.
3. Send the test to our labs for analysis and speak to your care team to understand the results.`,
      'Pre-test considerations': `Urine test is required. There are no fasting requirements associated with this test.
Connect with your membership advisor if you have any questions or concerns ahead of testing.`,
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
      'Why is this test important?': `Important for assessing the risk of heart disease, especially in those with risk factors but no symptoms.`,
      'Test process': `A CT scan is used, involving brief exposure to radiation.`,
      'Pre-test considerations': `Involves radiation exposure; not recommended for routine screening in low-risk individuals.`,
    },
    'Gut Microbiome Analysis': {
      "What's measured?": `Four main indicators of gut health will be measured. The first is a gut diversity score, indicating the breath of species which indicate a healthier gut and immune system. The second is the levels of bacteria that support metabolic health and fight inflammation. Thirdly, we will look for red flags of intestinal permeability (“leaky gut”) that may contribute to disease. The last will be any common parasites, bacteria, and fungi that can cause infection.`,
      'Why is this test important?': `A gut microbiome analysis is essential in better understanding the bacteria that comprise your gut health. Novel research in the last decade has shown the immense impact in which gut health can not only affect digestion, but even our immune system, metabolism, and mood. This can manifest in symptoms like brain fog, fatigue, and digestive issues.`,
      'Test process': `A testing kit will be sent to you. A mess-free sample will be required from a soiled tissue paper in the comfort of your own home. This will then be shipped to a lab and analyzed.`,
      'Pre-test considerations': `Non-invasive but requires at-home sample collection from a soiled tissue paper. Non-invasive but requires careful sample collection. Diet and medication can influence results.`,
    },
    'Full Body MRI': {
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

export const getSampleReportLinkForService = (service: string) => {
  switch (service) {
    case GRAIL_GALLERI_MULTI_CANCER_TEST:
      return '/sample-reports/grail-galleri-multi-cancer-test.pdf';
    case GUT_MICROBIOME_ANALYSIS:
      return '/sample-reports/gut-microbiome-analysis.pdf';
    case TOTAL_TOXIN_TEST:
      return '/sample-reports/total-toxins.pdf';
    default:
      return undefined;
  }
};

/**
 * Retrieves the legal disclaimer for a specific healthcare service.
 * If the service does not have a specific disclaimer, the disclaimer for environmental toxins is used by default.
 *
 * @param service - The healthcare service for which to retrieve the legal disclaimer.
 * @returns {JSX.Element} The corresponding legal disclaimer for the given healthcare service.
 *
 * The function includes a default case where the disclaimer for "environmental toxins" is returned.
 * This default is applied when the healthcare service does not have a predefined legal disclaimer or falls under unspecified services.
 * This ensures that all services have a disclaimer, especially when the service is not explicitly mapped to one.
 *
 * @example
 * // Returns the legal disclaimer for GRAIL Galleri Multi-Cancer Test
 * const disclaimer = getLegalDisclaimerForService({
 *   name: 'GRAIL Galleri Multi-Cancer Test'
 * });
 *
 * // Returns the default legal disclaimer for environmental toxins
 * const disclaimer = getLegalDisclaimerForService({
 *   name: 'Unspecified Service'
 * });
 */
export const getInformedConsentForService = (service: string): JSX.Element => {
  switch (service) {
    case GRAIL_GALLERI_MULTI_CANCER_TEST:
      return LEGAL_DESCLAIMERS.grail;
    case ENVIRONMENTAL_TOXINS:
      return LEGAL_DESCLAIMERS.toxins;
    case GUT_MICROBIOME_ANALYSIS:
      return LEGAL_DESCLAIMERS.gut;
    default:
      return LEGAL_DESCLAIMERS.toxins;
  }
};

export const getDefaultAgreementCopyForService = (
  service: string,
): JSX.Element => {
  switch (service) {
    case GRAIL_GALLERI_MULTI_CANCER_TEST:
      return AGREEMENT_COPIES.grail;
    case GUT_MICROBIOME_ANALYSIS:
      return AGREEMENT_COPIES.gut;
    default:
      return AGREEMENT_COPIES.regular;
  }
};
