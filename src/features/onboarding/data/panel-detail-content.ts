export interface PanelDetailContent {
  details: string;
  biomarkers: string[];
}

/**
 * Detail page content keyed by service slug (AddOnItem.id).
 * `details` is markdown rendered via StyledMarkdown.
 * `biomarkers` is a list of included biomarker names.
 * The short description comes from the API (AddOnItem.description).
 */
const CONTENT: Record<string, PanelDetailContent> = {
  // -----------------------------------------------------------------------
  // Extended Heart Health Panel (bundle)
  // -----------------------------------------------------------------------
  'v2-advanced-cardio-bundle-march-2026-quest': {
    details: `**What does this test for?**

Heart disease is the leading cause of death in the U.S., and it develops quietly over decades. Standard cholesterol panels catch some of the picture, but they miss critical markers that determine how and when heart disease actually starts.

This panel tests for genetic cholesterol risk, oxidative damage to your LDL particles, and early signs of blood vessel dysfunction. Together, these markers reveal whether your cardiovascular system is under stress long before symptoms show up.

3 out of 4 heart attack victims had "normal" cholesterol on standard tests. This panel looks at the markers that explain why.

**Who should get tested?**

- You have a family history of heart disease, stroke, or high cholesterol
- You exercise regularly and eat well but still wonder if something's being missed
- You're over 30 and want your true cardiovascular picture, not the abbreviated version from an annual physical

**What will you learn?**

Whether your risk is genetic, lifestyle-driven, or both, and what to do about each. If your Lp(a) is elevated, your prevention strategy shifts entirely. If oxidized LDL is high, it changes how aggressively you address inflammation. If vascular function is impaired, you catch artery damage years before it becomes dangerous.`,
    biomarkers: ['Lp(a)', 'Oxidized LDL', 'ADMA', 'SDMA'],
  },

  // Lipoprotein A
  'v2-lipoprotein-a-march-2026-quest': {
    details: `**What does this test for?**

Lp(a) is a cholesterol particle with an extra protein attached to it. Lp(a) binds to artery walls more aggressively than regular cholesterol. It also mimics your body's natural clot-dissolving protein, which means it interferes with your ability to clear clots.

Your Lp(a) level is set by your genes and barely moves with diet, exercise, or lifestyle changes. About 1 in 5 people have elevated levels, and most have never been tested.

Standard lipid panels don't include Lp(a). So someone can have "perfect" cholesterol numbers and still carry significant genetic cardiovascular risk.

**Who should get tested?**

- You have a family history of heart disease, or you want to rule it out
- You're over 30 (the AHA now recommends the test at this age)

**What will you learn?**

If it's elevated, your approach to heart health changes. A high Lp(a) with normal cholesterol means being more preventive, while a high Lp(a) with high cholesterol may mean considering medication over diet changes alone.`,
    biomarkers: ['Lp(a)'],
  },

  // Oxidized LDL
  'v2-oxldl-march-2026-quest': {
    details: `**What does this test for?**

Not all LDL cholesterol is equally dangerous. When LDL particles become oxidized, they trigger inflammation in your artery walls. This is what starts the chain reaction that leads to plaque buildup, narrowing, and eventually heart attacks or strokes.

Oxidized LDL is LDL that has been damaged by free radicals. Once oxidized, these particles are absorbed by immune cells in your artery walls, forming foam cells that become the foundation of arterial plaque. Standard cholesterol tests measure how much LDL you have. This test measures how much of it is actively causing damage.

Two people with the same LDL number can have very different levels of oxidized LDL, which means very different levels of actual risk.

**Who should get tested?**

- You have borderline or elevated cholesterol and want to know if your LDL is actively causing damage
- You have a history of inflammation, metabolic issues, or oxidative stress
- Your standard cholesterol panel looks "fine" but you want a clearer picture of what's happening inside your blood vessels

**What will you learn?**

Whether your cholesterol is causing active damage right now, not whether it could theoretically cause problems someday. If oxidized LDL is high, the priority shifts to reducing inflammation and oxidative stress through targeted diet changes, specific antioxidants, and in some cases medication. It changes the conversation from "your cholesterol is a little high" to "here's what's actually going on and here's what to do about it."`,
    biomarkers: ['Oxidized LDL'],
  },

  // Blood Vessel Function
  'v2-adma-sdma-quest': {
    details: `**What does this test for?**

ADMA and SDMA are molecules that interfere with nitric oxide production in your blood vessels. Nitric oxide is what keeps your arteries flexible, dilated, and healthy. When ADMA levels rise, nitric oxide drops, and your blood vessels start to stiffen and narrow.

This process happens gradually and silently. By the time it shows up on imaging or causes symptoms like high blood pressure, years of damage have already occurred. ADMA is one of the earliest detectable signals that your vascular system is under stress.

SDMA works differently. It doesn't block nitric oxide directly but accumulates when kidney function starts to decline, making it a secondary signal for both vascular and kidney health.

**Who should get tested?**

- You have a family history of high blood pressure, stroke, or kidney disease
- You're showing early signs of metabolic dysfunction like elevated blood sugar or insulin resistance
- You want to catch vascular aging at its earliest, most reversible stage

**What will you learn?**

Whether your blood vessels are aging faster than the rest of your body. Elevated ADMA is a signal to focus on the things that restore nitric oxide: specific dietary changes, targeted exercise, and addressing the underlying inflammation or metabolic issues that caused the elevation. Catching this early means you can reverse course before it shows up as high blood pressure or arterial stiffness on a standard exam.`,
    biomarkers: ['ADMA', 'SDMA'],
  },

  // -----------------------------------------------------------------------
  // Extended Metabolic Health Panel (bundle)
  // -----------------------------------------------------------------------
  'v2-metabolic-health-complete-march-2026-quest': {
    details: `**What does this test for?**

Your metabolism isn't one thing. It's a system of hormones and signals that determine how your body handles energy: how efficiently you burn fat, how you respond to food, and whether your blood sugar stays stable or swings unpredictably throughout the day.

Standard metabolic panels check blood sugar and maybe HbA1c. This panel goes deeper, measuring the hormones that regulate fat storage, appetite, and insulin sensitivity. These markers often shift years before blood sugar becomes a problem.

1 in 3 U.S. adults has metabolic syndrome. Most don't know it, because the early signals don't show up on standard tests.

**Who should get tested?**

- You're dealing with unexplained weight gain, energy crashes, or difficulty losing weight despite real effort
- You have a family history of diabetes or metabolic syndrome
- Your body seems to handle food and energy differently than it used to, and you want to understand why

**What will you learn?**

Whether your metabolism is working with you or against you, and specifically where the dysfunction is happening. If it's a hormone issue, you'll know which one. If it's insulin resistance developing, you'll catch it years before a diabetes diagnosis. This changes your approach from generic advice to targeted action.`,
    biomarkers: [
      'Adiponectin',
      'Leptin',
      'Insulin',
      'C-Peptide',
      'Fructosamine',
    ],
  },

  // Weight and Appetite Hormones
  'v2-weight-resistance-march-2026-quest': {
    details: `**What does this test for?**

Adiponectin and leptin are hormones produced by your fat cells, but they do very different things. Adiponectin improves insulin sensitivity and helps your body burn fat for fuel. Higher levels are protective. Leptin signals your brain that you've eaten enough and can stop.

When this system works correctly, your body regulates weight naturally. When it doesn't, things break down. Leptin resistance means your brain stops hearing the "full" signal, so you stay hungry even when your body has plenty of stored energy. Low adiponectin means your cells become less responsive to insulin and less efficient at burning fat.

These hormonal imbalances explain why some people can't lose weight no matter how disciplined they are. The problem isn't willpower. It's biology.

**Who should get tested?**

- You've hit a weight loss plateau despite consistent diet and exercise
- You have stubborn belly fat that doesn't respond to lifestyle changes
- You want to understand the hormonal reasons behind weight gain, rather than guessing

**What will you learn?**

Whether a hormonal imbalance is driving your weight issues, and which specific hormones are out of balance. If leptin is high but you're still hungry, that points to leptin resistance, which requires a different approach than calorie restriction. If adiponectin is low, the focus shifts to improving insulin sensitivity through targeted interventions. This turns "eat less, move more" into a specific plan based on what your body actually needs.`,
    biomarkers: ['Adiponectin', 'Leptin'],
  },

  // Insulin and Blood Sugar
  'v2-metabolic-core-march-2026-quest': {
    details: `**What does this test for?**

Insulin is the hormone that moves sugar from your blood into your cells. C-Peptide is a byproduct of insulin production that shows how much insulin your pancreas is actually making. Fructosamine measures your average blood sugar over the past 2-3 weeks, giving a more recent snapshot than HbA1c.

Together, these markers reveal the early stages of metabolic dysfunction that standard tests miss. Insulin resistance often develops 10-15 years before blood sugar levels become abnormal. During that time, your pancreas compensates by producing more and more insulin, keeping blood sugar in the "normal" range while the underlying problem gets worse.

By the time a standard test flags high blood sugar, you've often been insulin resistant for a decade.

**Who should get tested?**

- You have a family history of type 2 diabetes
- You experience energy crashes, brain fog, or increased hunger after meals
- You've been told your blood sugar is "borderline" or "pre-diabetic" and want the full picture
- You want to catch insulin resistance at its earliest, most reversible stage

**What will you learn?**

Whether your body is already working overtime to keep blood sugar in range. If insulin and C-Peptide are elevated but blood sugar looks normal, that's early insulin resistance, and the interventions are different from what you'd do for established high blood sugar. Fructosamine shows you how your blood sugar has actually been behaving recently, which helps you measure the impact of dietary changes in weeks rather than months.`,
    biomarkers: ['Insulin', 'C-Peptide', 'Fructosamine'],
  },

  // -----------------------------------------------------------------------
  // Extended Women's Health Panel (bundle)
  // -----------------------------------------------------------------------
  'v2-womens-health-march-2026-quest': {
    details: `**What does this test for?**

Women's hormones don't exist in isolation. Estrogen, progesterone, thyroid function, and reproductive hormones all interact in ways that affect energy, mood, weight, cycle regularity, and fertility. When one shifts, the others often follow.

This panel measures the full hormonal picture: reproductive hormones through precise methods (LC/MS, the gold standard for accuracy), pituitary signals that regulate the whole system, and thyroid antibodies that can indicate autoimmune thyroid disease. Many of these markers are rarely tested in routine care, even when symptoms are clearly present.

Conditions like PCOS, perimenopause, thyroid autoimmunity, and unexplained infertility often have overlapping symptoms. Without comprehensive testing, they're easy to misdiagnose or dismiss entirely.

**Who should get tested?**

- You're experiencing irregular cycles, unexplained fatigue, mood changes, weight shifts, or hair loss
- You're entering or navigating perimenopause and want clear data instead of guessing
- You're planning for pregnancy
- You've been told "your labs look fine" when you don't feel fine

**What will you learn?**

Exactly where your hormones stand, individually and in relation to each other. Whether symptoms like fatigue or mood changes are hormonal, thyroid-related, or both. Whether perimenopause has started and how far along it is. And whether thyroid antibodies are present, which can indicate Hashimoto's years before TSH becomes abnormal.`,
    biomarkers: [
      'Estradiol (Ultrasensitive, LC/MS)',
      'Progesterone (LC/MS)',
      'FSH',
      'LH',
      'Prolactin',
      '17-Hydroxyprogesterone',
      'Thyroid Peroxidase Antibodies',
      'Thyroglobulin Antibodies',
    ],
  },

  // Advanced Hormones (women)
  'v2-womens-hormones-march-2026-quest': {
    details: `**What does this test for?**

This panel measures the hormones that regulate your menstrual cycle, mood, energy, and body composition, using LC/MS testing for estradiol and progesterone (the most accurate method available, and the one most standard labs don't use).

Estradiol is your primary estrogen. It affects bone density, brain function, skin health, and cardiovascular protection. Progesterone balances estrogen and is essential for cycle regularity and sleep quality. FSH and LH are the pituitary hormones that regulate ovulation and signal where you are in your reproductive timeline. Prolactin, when elevated, can disrupt cycles and cause symptoms that mimic other conditions. 17-Hydroxyprogesterone screens for enzyme deficiencies that affect hormone production.

Thyroid antibodies (TPO and thyroglobulin) are included because autoimmune thyroid disease is the most common autoimmune condition in women, and it directly disrupts hormonal balance. Symptoms often overlap with perimenopause, making it difficult to know what's actually causing the problem without testing both.

**Who should get tested?**

- You have irregular cycles, worsening PMS, unexplained weight changes, fatigue, brain fog, or mood shifts
- You're in your late 30s or 40s and wondering whether perimenopause has started
- You've been prescribed birth control or antidepressants for symptoms that might be hormonal
- Your thyroid has only ever been tested with TSH

**What will you learn?**

Whether your symptoms are driven by estrogen decline, progesterone deficiency, thyroid autoimmunity, or a combination. If FSH is rising and estradiol is dropping, perimenopause is likely underway, and that changes how you approach everything from sleep to supplementation. If thyroid antibodies are present, it signals a different treatment path than hormone replacement alone.`,
    biomarkers: [
      'Estradiol (Ultrasensitive, LC/MS)',
      'Progesterone (LC/MS)',
      'FSH',
      'LH',
      'Prolactin',
      '17-Hydroxyprogesterone',
      'Thyroid Peroxidase Antibodies',
      'Thyroglobulin Antibodies',
    ],
  },

  // Fertility Planning
  'v2-fertility-and-family-planning-march-2026-quest': {
    details: `**What does this test for?**

Anti-Mullerian Hormone (AMH) is produced by the small follicles in your ovaries and is the most reliable marker of ovarian reserve, meaning how many eggs you have remaining. Unlike other fertility markers, AMH stays relatively stable throughout your cycle, so it can be tested on any day.

AMH doesn't tell you about egg quality, but it gives a clear picture of quantity, which is critical information for anyone thinking about their reproductive timeline. A low AMH in your 20s or early 30s can signal that your fertility window may be shorter than expected.

Mercury is included because it's a reproductive toxin that accumulates from fish consumption, dental amalgams, and environmental exposure. Elevated mercury levels are associated with reduced fertility, increased miscarriage risk, and developmental concerns during pregnancy. It's rarely tested in preconception care, but it should be.

**Who should get tested?**

- You're considering pregnancy in the next few years and want to understand your timeline
- You have a family history of early menopause or diminished ovarian reserve
- You eat fish regularly and want to check mercury levels before conceiving
- You want data to inform decisions about egg freezing, IVF timing, or family planning

**What will you learn?**

Where your ovarian reserve stands relative to your age, which helps inform decisions about timing. If AMH is lower than expected, it doesn't mean you can't get pregnant, but it may mean moving faster or exploring preservation options. If mercury is elevated, you'll want to reduce exposure and allow time for levels to drop before conceiving, which is much better to know before pregnancy than during it.`,
    biomarkers: ['Anti-Mullerian Hormone (AMH)', 'Mercury'],
  },

  // -----------------------------------------------------------------------
  // Extended Autoimmune Health Panel (bundle)
  // -----------------------------------------------------------------------
  'v2-autoimmunity-march-2026-quest': {
    details: `**What does this test for?**

Autoimmune diseases happen when your immune system attacks your own tissues. They affect roughly 1 in 5 Americans, but diagnosis takes an average of 4-5 years because symptoms overlap with so many other conditions: fatigue, joint pain, brain fog, digestive issues, skin changes.

This panel screens for thyroid autoimmunity (the most common autoimmune condition), systemic autoimmune markers, rheumatoid arthritis, and celiac disease. These are the conditions most likely to be developing silently in the background, especially in women.

Many autoimmune conditions are detectable through antibody testing years before symptoms become severe enough for a clinical diagnosis. Catching them early changes the outcome significantly.

**Who should get tested?**

- You have a family history of autoimmune disease (thyroid, lupus, rheumatoid arthritis, celiac, or type 1 diabetes)
- You have persistent, unexplained symptoms like fatigue, joint pain, digestive problems, or skin issues
- You've been told "everything looks normal" while your symptoms persist

**What will you learn?**

Whether your immune system is producing antibodies against your own tissues, and which ones. If antibodies are present, you'll know which specialists to see and which conditions to monitor. Early detection often means simpler interventions: dietary changes for celiac, thyroid medication for Hashimoto's, or targeted treatment for rheumatoid arthritis before joint damage occurs.`,
    biomarkers: [
      'Thyroid Peroxidase Antibodies',
      'Thyroglobulin Antibodies',
      'Free T3',
      'ANA Screen',
      'Rheumatoid Factor',
      'CCP Antibody (IgG)',
      'Celiac Disease Comprehensive Panel (tTG-IgA + IgA)',
    ],
  },

  // Thyroid Antibodies
  'v2-thyroid-march-2026-quest': {
    details: `**What does this test for?**

Most thyroid testing stops at TSH. If TSH is normal, you're told your thyroid is fine. But TSH only shows whether your brain is asking your thyroid to work harder. It doesn't show whether your thyroid is under autoimmune attack, or whether it's converting T4 into Free T3, the active form your cells actually use.

Thyroid Peroxidase (TPO) and Thyroglobulin antibodies detect Hashimoto's thyroiditis, the most common cause of hypothyroidism. These antibodies can be elevated for years before TSH becomes abnormal. During that time, you may experience fatigue, weight gain, hair loss, and brain fog while being told your thyroid is "fine."

Free T3 measures the active thyroid hormone. Some people produce enough T4 but don't convert it well to T3, which means their cells aren't getting the energy signal they need, even though standard labs look normal.

**Who should get tested?**

- You have fatigue, weight gain, hair thinning, cold sensitivity, or brain fog that hasn't been explained
- You have a family history of thyroid disease or autoimmune conditions
- Your TSH test came back "normal" but you still don't feel right
- You're a woman (autoimmune thyroid disease affects women 5-8 times more often than men)

**What will you learn?**

Whether your thyroid is under autoimmune attack, even if your TSH is still in range. If TPO antibodies are elevated, you have Hashimoto's, and your provider can begin monitoring and potentially treating it before your thyroid function fully declines. If Free T3 is low despite normal TSH, it points to a conversion problem that responds to specific nutritional and lifestyle interventions.`,
    biomarkers: [
      'Thyroid Peroxidase Antibodies',
      'Thyroglobulin Antibodies',
      'Free T3',
    ],
  },

  // Autoimmune Screening
  'v2-inflamation-march-2026-quest': {
    details: `**What does this test for?**

ANA (antinuclear antibody) is a broad screening marker that detects whether your immune system is producing antibodies against your own cell nuclei. A positive ANA can point toward lupus, Sjogren's syndrome, scleroderma, and other systemic autoimmune diseases. The reflex titer and pattern help identify which specific condition may be developing.

Rheumatoid Factor and CCP antibodies are specific to rheumatoid arthritis. Rheumatoid Factor is the traditional screening marker, but CCP antibodies are more specific and can appear years before joint symptoms begin. When both are positive, the likelihood of developing rheumatoid arthritis is high.

These conditions share symptoms with dozens of other problems: joint stiffness, fatigue, dry eyes, skin rashes, muscle aches. Without antibody testing, people cycle through misdiagnoses for years.

**Who should get tested?**

- You have unexplained joint pain, stiffness, or swelling, especially if it's worse in the morning
- You have persistent fatigue, dry eyes or mouth, skin rashes, or recurrent fevers
- You have a family history of lupus, rheumatoid arthritis, or other autoimmune conditions
- You've been given a vague diagnosis like "fibromyalgia" or "chronic fatigue" without autoimmune markers being checked

**What will you learn?**

Whether your immune system is producing the specific antibodies associated with systemic autoimmune disease. A positive result doesn't mean you have a diagnosis today, but it tells you and your doctor exactly what to monitor and when to intervene. Catching rheumatoid arthritis before joint damage starts, or identifying lupus before organ involvement, changes the trajectory of the disease.`,
    biomarkers: [
      'ANA Screen IFA with Reflex to Titer and Pattern',
      'Rheumatoid Factor',
      'CCP Antibody (IgG)',
    ],
  },

  // Celiac and Gluten Sensitivity
  'v2-celiac-disease-march-2026-quest': {
    details: `**What does this test for?**

Celiac disease is an autoimmune reaction to gluten that damages the lining of the small intestine. When someone with celiac eats gluten, their immune system produces antibodies that attack the intestinal villi, the tiny projections that absorb nutrients from food. Over time, this leads to malabsorption, nutrient deficiencies, and a cascade of symptoms that extend far beyond digestion.

The tTG-IgA test detects the primary antibody associated with celiac. IgA is measured alongside it because a small percentage of people are IgA-deficient, which would cause a false negative on the tTG test. Together, they provide a reliable screen.

An estimated 1 in 100 people worldwide has celiac disease, but roughly 80% are undiagnosed. Symptoms range from obvious (bloating, diarrhea, abdominal pain) to subtle (anemia, fatigue, brain fog, skin rashes, joint pain, unexplained weight loss). Many people with celiac have no digestive symptoms at all.

**Who should get tested?**

- You have unexplained digestive issues, especially bloating, diarrhea, or abdominal pain after eating
- You've been diagnosed with iron-deficiency anemia, unexplained nutrient deficiencies, or osteoporosis at a young age
- You have a family history of celiac disease (first-degree relatives have a 1 in 10 chance)
- You have another autoimmune condition, since celiac frequently coexists with thyroid disease, type 1 diabetes, and others

**What will you learn?**

Whether your immune system is reacting to gluten. If tTG-IgA is positive, it strongly suggests celiac disease and your doctor will likely recommend a confirmation biopsy. A diagnosis means a gluten-free diet isn't a preference or a trend; it's the treatment, and it can resolve symptoms that have persisted for years. If the test is negative and you're not IgA-deficient, celiac is effectively ruled out, which is valuable information on its own.`,
    biomarkers: ['Celiac Disease Comprehensive Panel (tTG-IgA + IgA)'],
  },

  // -----------------------------------------------------------------------
  // Extended Men's Health Panel (bundle)
  // -----------------------------------------------------------------------
  'v2-mens-health-complete-march-2026-quest': {
    details: `**What does this test for?**

Men's hormonal health is more than testosterone. It's a system where testosterone, its metabolites, pituitary signals, growth factors, and binding proteins all interact. When one shifts, the downstream effects touch everything from energy and body composition to mood, sleep, and sexual function.

This panel measures testosterone through the most accurate methods available (dialysis for free testosterone, mass spectrometry for total), along with the hormones that regulate testosterone production, the protein that determines how much is available to your tissues, and growth factors that affect muscle, recovery, and aging.

Prostate health is included because PSA screening is one of the most important and underused tools in men's preventive care, especially after 40.

**Who should get tested?**

- You're experiencing low energy, decreased motivation, difficulty building or maintaining muscle, increased body fat, mood changes, or changes in sexual function
- You're over 35, when testosterone begins its gradual decline
- You're on or considering testosterone replacement therapy and need a full baseline
- You want to understand the hormones that affect how you feel, perform, and age

**What will you learn?**

Whether your symptoms are hormonal, and precisely where in the system the issue sits. Low total testosterone tells a different story than low free testosterone with normal total (which points to high SHBG binding up your available supply). Elevated LH with low testosterone suggests the problem is in the testes, while low LH with low testosterone points to the brain. This level of detail determines whether the right approach is lifestyle changes, supplementation, or hormone therapy.`,
    biomarkers: [
      'Testosterone Free (Dialysis)',
      'Testosterone Total (MS)',
      'SHBG',
      'FSH',
      'LH',
      'Dihydrotestosterone',
      'Prolactin',
      'IGF-1',
      'PSA Free',
      'PSA Total',
    ],
  },

  // Advanced Hormones (men)
  'v2-mens-health-core-march-2026-quest': {
    details: `**What does this test for?**

This panel measures the hormones that most directly affect how men feel, function, and age. Testosterone Free and Total are measured using dialysis and mass spectrometry, the gold-standard methods that are far more accurate than the immunoassay methods most standard labs use.

SHBG (sex hormone-binding globulin) binds to testosterone and makes it unavailable to your tissues. High SHBG with normal total testosterone means you may have less usable testosterone than your numbers suggest. FSH and LH are pituitary hormones that tell your testes to produce testosterone and sperm. Their levels help identify where a problem originates.

Dihydrotestosterone (DHT) is a potent metabolite of testosterone that affects hair, prostate, and body composition. Prolactin, when elevated in men, can suppress testosterone production and affect libido. IGF-1 is a growth factor linked to muscle recovery, cellular repair, and aging. Together, these markers give a complete picture of the hormonal system, not a snapshot of one number.

**Who should get tested?**

- You have fatigue, low motivation, difficulty losing weight or gaining muscle, mood changes, or decreased libido
- You're over 35, when testosterone production begins to decline
- You're on TRT and need comprehensive monitoring
- You've had testosterone tested but only received a total number without free testosterone, SHBG, or pituitary context

**What will you learn?**

Exactly where your hormonal system stands and what, if anything, needs attention. If total testosterone is normal but SHBG is high, your free (usable) testosterone may be low, which explains symptoms even when "your testosterone is fine." If LH is elevated, it means your brain is asking for more testosterone but your testes aren't keeping up. If IGF-1 is low, it affects recovery, body composition, and cellular repair in ways that go beyond hormones alone.`,
    biomarkers: [
      'Testosterone Free (Dialysis)',
      'Testosterone Total (MS)',
      'SHBG',
      'FSH',
      'LH',
      'Dihydrotestosterone',
      'Prolactin',
      'IGF-1',
    ],
  },

  // Prostate Screening (PSA)
  'v2-mens-prostate-health-march-2026-quest': {
    details: `**What does this test for?**

PSA (prostate-specific antigen) is a protein produced by the prostate gland. Total PSA measures the overall amount in your blood. Free PSA measures the portion that isn't bound to proteins. The ratio between them helps distinguish between benign prostate conditions and something that warrants further investigation.

A high total PSA can be caused by many things: an enlarged prostate, inflammation, infection, or cancer. The free-to-total ratio adds clarity. Benign conditions tend to produce more free PSA, while prostate cancer tends to produce more bound PSA. This distinction reduces unnecessary biopsies and anxiety.

Prostate cancer is the second most common cancer in men. It develops slowly in most cases, which makes early detection especially valuable because intervention is most effective and least invasive when it's caught early.

**Who should get tested?**

- You're over 40, when prostate screening becomes relevant
- You have a family history of prostate cancer (especially a father or brother)
- You have urinary symptoms like increased frequency, difficulty starting, or weak flow
- You're a Black man (higher incidence; screening is recommended starting at 40)

**What will you learn?**

Whether your PSA levels are within normal range, and if elevated, whether the free-to-total ratio suggests a benign cause or something that needs follow-up. An elevated total PSA with a low free PSA percentage warrants further evaluation. A normal PSA with a healthy ratio provides reassurance. Either way, having a baseline now means future changes are easier to detect and interpret.`,
    biomarkers: ['PSA Free', 'PSA Total'],
  },

  // -----------------------------------------------------------------------
  // Nutrient Levels (bundle)
  // -----------------------------------------------------------------------
  'v2-nutrients-bundle-quest': {
    details: `**What does this test for?**

Micronutrient deficiencies are remarkably common. 95% of adults fall short on at least one essential vitamin or mineral. And deficiencies don't always produce obvious symptoms. They show up as fatigue, poor sleep, weak immunity, slow recovery, brain fog, or mood changes that get attributed to aging, stress, or "just life."

This panel measures the vitamins and minerals that are hardest to get from diet alone and most impactful when they're low. It goes beyond standard tests by checking intracellular levels (like RBC magnesium instead of serum magnesium) and testing nutrients that are rarely included in routine bloodwork.

Most people supplement based on general recommendations or guesswork. This panel tells you what you actually need.

**Who should get tested?**

- You're taking supplements and want to know if they're actually working
- You have fatigue, poor sleep, frequent illness, or slow recovery from exercise
- You're on a restricted diet (vegan, vegetarian, low-carb, or elimination diets)
- You want to stop guessing about what your body needs and start knowing

**What will you learn?**

Which nutrients you're deficient in, which ones are adequate, and which ones you might be over-supplementing (which can be just as problematic). This turns your supplement routine from a generic stack into a targeted protocol based on your actual levels. It also reveals whether symptoms you've been attributing to other causes might be driven by a simple, correctable deficiency.`,
    biomarkers: [
      'Vitamin C',
      'Vitamin B12',
      'Folate',
      'Vitamin E (Tocopherol)',
      'Vitamin K',
      'Magnesium RBC',
      'Selenium',
    ],
  },

  // Vitamin Levels
  'v2-vitamins-march-2026-quest': {
    details: `**What does this test for?**

This panel tests four vitamins that play critical roles in immune function, energy, brain health, and cardiovascular protection, and that are rarely included in routine bloodwork.

Vitamin C is the body's primary water-soluble antioxidant. It protects cells from oxidative damage, supports immune function, and is essential for collagen production. Deficiency is more common than people realize, especially under stress. Vitamin B12 and Folate work together in methylation, a process that affects DNA repair, neurotransmitter production, and energy metabolism. Low B12 causes fatigue, nerve problems, and cognitive decline. Low folate affects cell division and is critical before and during pregnancy. Vitamin E protects cell membranes from oxidative damage and supports immune and cardiovascular health. Vitamin K regulates calcium in your body, directing it into bones and teeth and away from arteries. Low Vitamin K is associated with both weaker bones and arterial calcification.

Standard bloodwork almost never tests for these. Most people don't know they're deficient until symptoms accumulate.

**Who should get tested?**

- You have fatigue, brain fog, frequent illness, or slow healing
- You're on a restrictive diet or have absorption issues
- You're taking supplements and want to verify they're reaching adequate levels
- You're over 40, when absorption of several vitamins naturally declines

**What will you learn?**

Whether you have specific deficiencies that are contributing to symptoms, and whether your current supplements are actually bringing your levels into range. This is the difference between taking a multivitamin because it seems like a good idea and knowing exactly which nutrients your body needs more of, and in what amounts.`,
    biomarkers: [
      'Vitamin C',
      'Vitamin B12 (Cobalamin)',
      'Folate',
      'Vitamin E (Tocopherol)',
      'Vitamin K',
    ],
  },

  // Mineral Levels
  'v2-minerals-march-2026-quest': {
    details: `**What does this test for?**

Magnesium is involved in over 300 enzymatic reactions in your body. It affects muscle function, nerve signaling, blood sugar regulation, blood pressure, and sleep quality. The standard serum magnesium test is nearly useless for detecting deficiency because your body pulls magnesium from cells to keep blood levels stable. You can be significantly deficient while serum levels look fine. RBC magnesium measures the magnesium inside your red blood cells, which is a far more accurate reflection of your body's actual stores.

Selenium is a trace mineral that's essential for thyroid function, immune defense, and antioxidant protection. Your thyroid contains more selenium per gram than any other organ. It's needed to convert T4 to the active T3 hormone and to protect the thyroid from oxidative damage. Selenium also supports glutathione production, your body's master antioxidant.

Both minerals are commonly deficient due to soil depletion, dietary patterns, and stress, and both are rarely tested in standard care.

**Who should get tested?**

- You have muscle cramps, poor sleep, anxiety, or irregular heartbeat (common signs of magnesium deficiency)
- You have thyroid issues or a family history of thyroid disease
- You're under chronic stress, which depletes magnesium rapidly
- You want to verify that your mineral intake is actually sufficient, rather than assuming

**What will you learn?**

Whether your body's magnesium and selenium stores are actually adequate, not whether your blood has enough to maintain the illusion of normal levels. If RBC magnesium is low, targeted supplementation can improve sleep, reduce muscle tension, support blood sugar, and calm the nervous system. If selenium is low, it may be contributing to thyroid dysfunction or weakened immune defenses, both of which respond to repletion.`,
    biomarkers: ['Magnesium RBC', 'Selenium'],
  },

  // -----------------------------------------------------------------------
  // Methylation and B Vitamins (standalone)
  // -----------------------------------------------------------------------
  'v2-methylation-bundle-quest': {
    details: `**What does this test for?**

Methylation is a biochemical process that happens billions of times per second in every cell of your body. It's involved in producing neurotransmitters (affecting mood and cognition), repairing DNA (affecting cancer risk), detoxifying harmful compounds (affecting inflammation), and converting food into energy.

When methylation isn't working efficiently, the effects ripple across multiple systems. Homocysteine builds up, which damages blood vessels and increases cardiovascular risk. Methylmalonic acid rises when B12 isn't being used properly, even if blood levels of B12 look normal. Folate RBC shows your long-term folate stores inside cells, not the snapshot that serum folate provides. B6 is a cofactor in over 100 enzyme reactions and is essential for neurotransmitter synthesis. B12 is the linchpin of the entire methylation cycle.

These markers are rarely tested together, but they tell a connected story about a process that touches nearly every aspect of your health.

**Who should get tested?**

- You have a known MTHFR gene variant (which affects roughly 40% of the population and impairs methylation)
- You've had elevated homocysteine on previous testing
- You have fatigue, brain fog, mood issues, or cardiovascular concerns that haven't been fully explained
- You have a family history of heart disease, stroke, or neurological conditions
- You want to understand whether your body is efficiently running one of its most fundamental processes

**What will you learn?**

Whether your methylation cycle is functioning well and where the bottlenecks are if it isn't. Elevated homocysteine tells you the cycle is stalled and cardiovascular risk is increased. High methylmalonic acid reveals functional B12 deficiency that standard tests miss. Low Folate RBC or B6 identifies the specific nutrients you need to support the cycle. This panel turns "take a B-complex" into a precise protocol based on where your methylation pathway needs support.`,
    biomarkers: [
      'Homocysteine',
      'Methylmalonic Acid',
      'Folate RBC',
      'Vitamin B6 (Plasma)',
      'Vitamin B12 (Cobalamin)',
    ],
  },

  // -----------------------------------------------------------------------
  // Brain and Cognitive Risk Panel (bundle)
  // -----------------------------------------------------------------------
  'v2-alzheimers-march-2026-quest': {
    details: `**What does this test for?**

Alzheimer's disease begins in the brain 15-20 years before the first symptoms of memory loss or cognitive decline appear. During that time, specific proteins accumulate in ways that are now measurable through blood tests. This panel detects those changes at the earliest known stage.

Beta Amyloid 42/40 measures the ratio of two forms of amyloid protein in your blood. When amyloid plaques start forming in the brain, the 42/40 ratio shifts in a characteristic pattern that's detectable in blood. This test (AD-Detect) has been validated against PET brain scans, the previous gold standard that costs thousands of dollars and requires a specialized facility.

APOE Genotype identifies which version of the APOE gene you carry. APOE4 is the strongest known genetic risk factor for late-onset Alzheimer's. Carrying one copy increases risk moderately; two copies increase it more significantly. But APOE4 is not destiny. Many carriers never develop the disease, and many people with Alzheimer's don't carry it.

pTau 217 (phosphorylated tau) is one of the most promising blood biomarkers in Alzheimer's research. When tau proteins in the brain become hyperphosphorylated, they form tangles that destroy neurons. pTau 217 levels in blood rise in the earliest stages of this process, making it a powerful indicator of active disease pathology.

**Who should get tested?**

- You have a family history of Alzheimer's or dementia and want to understand your personal risk profile
- You're over 45 and value having the most complete picture of your cognitive health
- You're experiencing subtle memory changes and wondering whether they're normal aging or something else
- You prefer to plan ahead with data rather than wait for symptoms to answer the question

This is not a test you need to take. It's a test that exists for people who would rather know than wonder. For many people, knowing their risk profile provides clarity and motivation to take specific, evidence-based steps that reduce that risk.

**What will you learn?**

Whether the earliest biomarkers of Alzheimer's pathology are present in your blood, and what your genetic risk profile looks like. If markers are normal, that's meaningful reassurance. If one or more are elevated, you'll have specific, actionable information. Research shows that cardiovascular exercise, sleep quality, metabolic health, social engagement, and cognitive activity all influence Alzheimer's progression. Knowing your risk means knowing exactly how much those interventions matter for you personally, and having the motivation to prioritize them.

This is not a diagnosis. It's information. And for the people who want it, it's some of the most powerful health information available today.`,
    biomarkers: ['AD-Detect Beta Amyloid 42/40', 'APOE Genotype', 'pTau 217'],
  },

  // Alzheimer's Amyloid Plaque Screening
  'v2-beta-amyloid-march-2026-quest': {
    details: `**What does this test for?**

Beta Amyloid 42/40 measures the ratio of two forms of amyloid protein in your blood. In a healthy brain, amyloid proteins are cleared normally. When Alzheimer's pathology begins, amyloid-beta 42 starts accumulating into plaques in the brain, which pulls it out of the bloodstream and shifts the 42/40 ratio in a detectable way.

This test (AD-Detect) has been validated against amyloid PET brain scans, the previous gold standard for detecting plaque buildup. A PET scan costs thousands of dollars and requires a specialized imaging facility. This blood test provides comparable information from a standard blood draw.

The shift in amyloid ratio can be detected 15-20 years before cognitive symptoms appear, making it one of the earliest possible signals of Alzheimer's pathology.

**Who should get tested?**

- You have a family history of Alzheimer's and want to know if amyloid changes are already underway
- You're over 50 and want the most direct measure of early plaque formation available
- You want a blood-based alternative to expensive PET imaging

**What will you learn?**

Whether the amyloid ratio in your blood suggests plaque formation is occurring. A normal ratio is reassuring. A shifted ratio doesn't mean you have Alzheimer's, but it indicates the biological process has started, which is exactly the kind of early signal that makes preventive action most effective. This information is valuable for conversations with your neurologist and for motivating the lifestyle interventions shown to slow progression.`,
    biomarkers: ['AD-Detect Beta Amyloid 42/40'],
  },

  // Alzheimer's Genetic Risk (ApoE)
  'v2-cardio-iq-apoe-genotype-march-2026-quest': {
    details: `**What does this test for?**

The APOE gene comes in three common variants: APOE2, APOE3, and APOE4. Everyone inherits two copies (one from each parent). APOE4 is the variant associated with increased Alzheimer's risk. Carrying one copy of APOE4 increases risk moderately. Carrying two copies increases it more significantly. APOE2, on the other hand, appears to be protective.

APOE4 is not a diagnosis and not a certainty. Many people with APOE4 never develop Alzheimer's, and many people with Alzheimer's don't carry it. But knowing your genotype gives you information about where you fall on the risk spectrum, which can shape decisions about monitoring, prevention, and lifestyle.

This is a one-time test. Your APOE genotype doesn't change, so you only need to take it once.

**Who should get tested?**

- You have a family history of Alzheimer's or dementia and want to understand your genetic risk
- You want to know whether aggressive preventive measures are especially important for you
- You're planning long-term and want genetic information to factor into health decisions
- You prefer knowing your risk profile over uncertainty

**What will you learn?**

Which APOE variants you carry and what that means for your risk profile. If you carry APOE4, it doesn't mean Alzheimer's is inevitable, but it does mean the lifestyle factors that reduce risk (cardiovascular exercise, sleep quality, metabolic health, cognitive engagement) matter even more for you specifically. If you don't carry APOE4, that's one significant risk factor you can set aside.`,
    biomarkers: ['APOE Genotype'],
  },

  // Alzheimer's pTau 217
  'v2-ptau217-march-2026-quest': {
    details: `**What does this test for?**

Tau is a protein that normally stabilizes the internal structure of neurons. In Alzheimer's disease, tau becomes hyper-phosphorylated, meaning it gets loaded with phosphate groups that cause it to detach, misfold, and clump into tangles. These tangles destroy neurons from the inside, and their spread through the brain tracks closely with cognitive decline.

pTau 217 (phosphorylated tau at position 217) is one of the most sensitive and specific blood biomarkers for Alzheimer's pathology currently available. Elevated pTau 217 indicates that tau tangles are forming, which represents active disease progression, not just risk.

Research shows pTau 217 rises early in the disease process and correlates strongly with both amyloid PET and tau PET scan results, making it a powerful complement to amyloid screening.

**Who should get tested?**

- You want the most direct blood-based measure of active Alzheimer's pathology available
- You have a family history of Alzheimer's and want to know if the disease process has started

**What will you learn?**

Whether phosphorylated tau is elevated in your blood, which would indicate that tau tangle formation is underway. Normal pTau 217 is meaningful reassurance that active neurodegeneration is not occurring. Elevated pTau 217, especially combined with a shifted amyloid ratio, provides the clearest currently available blood-based picture of early Alzheimer's pathology. This is not a diagnosis, but it is information that your neurologist can act on, and that you can use to prioritize the interventions with the strongest evidence for slowing progression.`,
    biomarkers: ['pTau 217'],
  },

  // -----------------------------------------------------------------------
  // Grail Galleri Multi Cancer Test (standalone)
  // -----------------------------------------------------------------------
  'v2-grail-galleri-multi-cancer-test-quest': {
    details: `**What does this test for?**

Most cancers are found too late. Standard screening covers fewer than five cancer types: breast, cervical, colon, lung (for smokers), and prostate. That leaves the vast majority of cancers, including some of the deadliest, with no routine screening at all. Pancreatic, ovarian, liver, and stomach cancers are typically caught only after symptoms appear, which often means stage 3 or 4.

The Galleri test detects cell-free DNA (cfDNA) signals in your blood that are shed by cancer cells. When cells become cancerous, they release DNA fragments with distinctive methylation patterns into the bloodstream.

Using advanced DNA sequencing and machine learning, Galleri checks over 1 million methylation sites to identify those patterns and, when a signal is detected, predicts the tissue of origin, telling you where in the body the signal is likely coming from.

A single blood draw screens across more than 50 cancer types. When cancer is caught in stage 1, the five-year survival rate is four to five times higher than when it's caught in stage 4. This test exists to shift the odds.

**Who should get tested?**

- You're over 40, when cancer incidence begins to rise
- You have a family history of cancer, especially types without standard screening (pancreatic, ovarian, liver, stomach)
- You have risk factors like smoking history, environmental exposures, chronic inflammation, or obesity
- You want the broadest possible early-warning screen beyond what routine care provides

**What will you learn?**

Whether cancer-associated DNA signals are present in your blood and if so, where they're likely coming from. A clean result is meaningful reassurance across dozens of cancer types. A detected signal gives your care team a specific starting point instead of a diagnostic fishing expedition.`,
    biomarkers: [
      'Cell-Free DNA (cfDNA) Signal Detection',
      'Cancer Signal Origin Prediction',
      'Multi-Cancer Coverage (50+ types)',
    ],
  },

  // -----------------------------------------------------------------------
  // Gut Microbiome Analysis (standalone)
  // -----------------------------------------------------------------------
  'gut-microbiome-analysis': {
    details: `**What does this test for?**

70% of your immune system lives in your gut. The bacteria in your digestive tract do far more than break down food. They produce neurotransmitters that affect mood, regulate immune responses, influence how you store fat, and determine how well you absorb nutrients from everything you eat.

This test screens 120,000+ microbes including bacteria, parasites, and fungi, measuring diversity, the balance of beneficial and harmful species, intestinal permeability, and the metabolic output of your gut ecosystem.

Gut imbalances are linked to conditions ranging from IBS, bloating, and skin issues to anxiety, autoimmune disease, and metabolic dysfunction. Parasites, fungal overgrowth, and compromised gut lining can all drive symptoms that standard tests miss entirely. Many people with these symptoms have been tested for everything except the ecosystem that connects them all.

**Who should get tested?**

- You have persistent digestive issues like bloating, gas, constipation, diarrhea, or acid reflux
- You have skin problems, brain fog, low energy, or mood issues that haven't been explained by standard tests
- You've taken multiple rounds of antibiotics, which can disrupt the microbiome for months or years
- You eat well but still don't feel right, and you want to understand what's happening at the gut level
- You have an autoimmune condition, since gut health and immune regulation are deeply connected

**What will you learn?**

Whether your gut ecosystem is working for you or against you. You'll see where diversity is strong, where harmful organisms have taken hold, and whether your gut lining is intact or compromised. That changes your approach from general gut health advice to a targeted protocol — the right probiotics, the right dietary shifts, and a clear picture of what's actually driving your symptoms.`,
    biomarkers: [
      'Microbiome Diversity Score',
      'Beneficial Bacteria Levels',
      'Pathogenic Bacteria Panel',
      'Short-Chain Fatty Acids',
      'Intestinal Permeability Markers (Leaky Gut)',
      'Harmful Organisms (parasites, fungi)',
    ],
  },

  // -----------------------------------------------------------------------
  // Mycotoxins (standalone)
  // -----------------------------------------------------------------------
  'mosaic-mycotox': {
    details: `**What does this test for?**

Mycotoxins are toxic compounds produced by common indoor molds like Aspergillus, Stachybotrys, and Penicillium. You don't have to see mold to be exposed to it. Mycotoxins are airborne and can be present in buildings with hidden water damage, poor ventilation, or aging HVAC systems. They settle into dust, furniture, and clothing, creating ongoing exposure even after the visible mold is gone.

The symptoms — chronic fatigue, brain fog, sinus congestion, joint pain, anxiety — overlap with dozens of other conditions, which is why mold illness is one of the most commonly missed diagnoses in medicine.

This is an at-home urine test that measures specific mycotoxins your body has absorbed and is actively processing.

**Who should get tested?**

- You have chronic fatigue, brain fog, sinus issues, or respiratory symptoms that haven't been explained
- You live or work in a building with known or suspected water damage
- You've been given a diagnosis like chronic fatigue syndrome or fibromyalgia without mold exposure being investigated
- You have a weakened immune system or mast cell activation symptoms

**What will you learn?**

Whether mold toxins are present in your body, which types, and at what levels. Different mycotoxins point to different sources — indoor mold, food contamination, or specific mold species — and each calls for a different response. Your results guide both treatment and remediation, because clearing the toxins only works if you also address where they're coming from.`,
    biomarkers: ['Aflatoxins', 'Trichothecenes', 'Ochratoxins'],
  },

  // -----------------------------------------------------------------------
  // Heavy Metals (standalone)
  // -----------------------------------------------------------------------
  'mosaic-toxic-metals': {
    details: `**What does this test for?**

Heavy metals enter your body through food, water, air, dental work, and occupational exposure. Unlike most toxins, they don't flush out easily — lead stores in bones for decades, mercury settles in brain tissue, and others accumulate in kidneys and lungs.

The problem is that low-level, chronic exposure rarely looks like anything specific. It shows up as cognitive decline, kidney stress, cardiovascular risk, or neurological symptoms that get chalked up to aging or stress.

Standard checkups almost never tests for heavy metals unless acute poisoning is suspected. But chronic, subclinical exposure is far more common and arguably more dangerous because it goes undetected for years.

**Who should get tested?**

- You eat fish regularly, especially large species like tuna, swordfish, or king mackerel
- You have older plumbing, live near industrial areas, or drink unfiltered well water
- You have dental amalgam fillings (which contain mercury)
- You have unexplained neurological symptoms like brain fog, tremors, numbness, or memory issues
- You're planning for pregnancy and want to ensure metal levels are safe before conceiving
- You have occupational exposure through manufacturing, construction, painting, or mining

**What will you learn?**

Which metals are in your body, how much, and where they're most likely coming from. That's the part that matters — the source tells you what to do about it.`,
    biomarkers: [
      'Lead',
      'Mercury',
      'Arsenic',
      'Aluminum',
      'Cadmium',
      'Uranium',
    ],
  },
};

function normalizePanelDetailKey(itemId: string) {
  return itemId.replace(/-(quest|bioref)$/, '');
}

// Build prefix lookup: strip the lab-variant suffix (-quest, -bioref) from keys
const PREFIX_MAP = new Map<string, PanelDetailContent>();
for (const [slug, content] of Object.entries(CONTENT)) {
  PREFIX_MAP.set(normalizePanelDetailKey(slug), content);
}

export function getPanelDetailContent(
  itemId: string,
): PanelDetailContent | null {
  return PREFIX_MAP.get(normalizePanelDetailKey(itemId)) ?? null;
}
