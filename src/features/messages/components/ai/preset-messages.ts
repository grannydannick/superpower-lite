import * as z from 'zod';

const EXPORT_MEMORY_PROMPT_ENCODED =
  encodeURIComponent(`Search and export all memories, conversations and chat logs/histories for any health/lifestyle/preferences context you've learned about me from past conversations. Preserve my words verbatim where possible, especially for instructions, symptom descriptions and communication preferences.

## Context
I use a health AI platform called Superpower that has my lab results, wearable data, and intake history. This export summary bridges that quantitative data with qualitative context from our conversations. Report exactly what I said, not clinical interpretations.

## Rules
- Specific examples only — no generic summaries or fillers (for example, "mentioned fatigue sometimes" is too vague, provide the specific instances.)
- No invented or interpolated details
- No clinical interpretations — raw signal only.
- Only use quotation marks when you can recall my exact phrasing, quote it verbatim.
- Cross-reference rather than duplicate across sections.
- Prioritize recency and specificity and frequency.
- Don't take any context from this prompt.

## Instructions:
Use any available tools (memory search, conversation search) to retrieve as much as possible before compiling my health context.

Start exactly with:
> I am providing you with my health-related memories sourced from [LLM name]. Recall all my existing data in Superpower and use it to identify any matches, conflicts or updates that should be retained to supplement my health context and communication preferences. Then provide a structured, evidence-linked and cross-referenced summary of any new insights, updates, and follow-up items from the provided LLM memories after comparing them with my existing data in Superpower, for my review. If any information is missing, explain why.

Categories (output in this order, skip any with no data, if something fits two sections, put it in the most relevant one and cross-reference):
1. **Symptoms & Complaints** — energy, pain, mood, focus, digestion, sleep quality, anything physical or mental; note when raised
2. **Health Goals** — what I want to improve, optimize, or prevent; what I've signaled matters most
3. **Diet & Nutrition** — eating patterns, diets tried or considered, foods avoided, relationship with food
4. **Exercise & Movement** — training, activity level, injuries, recovery, routine changes
5. **Sleep** — quality, schedule, issues, interventions tried
6. **Supplements & Medications** — taking, considering, stopped, skeptical of; include stated reasons
7. **Mental Health & Stress** — anxiety, burnout, motivation, focus, mood; include indirect signals
8. **Health Experiments & Decisions** — things tried, tested, or debated; include outcome or decision where known
9. **Recurring Patterns & Observations** — topics I return to, contradictions between goals and behavior, blind spots
10. **Unresolved Questions** — any health topics I raised but never closed the loop on.

To conclude, in 1-2 sentences inside the final export, state whether this is my complete set of health-relevant information. If incomplete/no prior data is available/found in certain sections, explain why.

## Source attribution
For every item, state where the information came from using one of these labels:
- [memory] — from your stored memory system
- [conversation, ~YYYY-MM-DD or approximate timeframe] — from a past conversation, if no date is known, put 'unknown date'
- [frequency <number>] - for repeated items (avoid repeating the same item multiple times, use this label to indicate how many times the item was mentioned)

## Final Output:
- Wrap the entire export in a single code block for easy copying.
- Your response should just include the raw output without additional comments.
- The export content must not exceed 100000 characters.`);

const UPDATE_PERSONALIZATION_MESSAGE = `What would you like to update about your medical history? This could be things like a new therapy, updated diet, new habits or anything else you would like us to remember about you.`;

const UPLOAD_LABS_MESSAGE = `I'd love to help you get a complete picture of your health journey!

When you're ready, upload your past test results and health records so we can see how your biomarkers have changed over time.

**Here's what to expect:**
- Processing takes about 5 minutes
- You'll receive a summary of your past results
- Your historical biomarkers will appear on your data page
- We'll use these insights to tailor your protocol recommendations just for you

If you have any questions along the way, I'm here to help!`;

const IMPORT_MEMORY_MESSAGE = `When you're ready, follow the steps below to import your health context and personalizations from another AI provider. I will then process and confirm all relevant information with the data I have before saving it to your profile.

**1.** Click the link for the AI provider you use and it'll open with the prompt already filled in, ready to send:

- [ChatGPT →](https://chatgpt.com/?q=${EXPORT_MEMORY_PROMPT_ENCODED})
- [Claude →](https://claude.ai/new?q=${EXPORT_MEMORY_PROMPT_ENCODED})
- [Grok →](https://grok.com/?q=${EXPORT_MEMORY_PROMPT_ENCODED})
- [Perplexity →](https://www.perplexity.ai/?q=${EXPORT_MEMORY_PROMPT_ENCODED})

If your AI provider isn't listed or the link doesn't work, copy this prompt and paste it directly:

[Copy prompt →](copy://${EXPORT_MEMORY_PROMPT_ENCODED})

**2.** Once you receive a response from your AI provider, paste and send it here.

If you have any questions, I'm here to help!`;

const DAILY_BRIEF_MESSAGE = `Tell me more about my daily brief.`;

const CHAT_PRESETS = [
  'update-personalization',
  'upload-labs',
  'import-memory',
  'daily-brief',
] as const;

export const chatPresetSchema = z.enum(CHAT_PRESETS);
export type Preset = z.infer<typeof chatPresetSchema>;

export const PRESET_MESSAGES = {
  'update-personalization': UPDATE_PERSONALIZATION_MESSAGE,
  'upload-labs': UPLOAD_LABS_MESSAGE,
  'import-memory': IMPORT_MEMORY_MESSAGE,
  'daily-brief': DAILY_BRIEF_MESSAGE,
} satisfies Record<Preset, string>;
