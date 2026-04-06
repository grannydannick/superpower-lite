# $600 Day 90 ARPU + Data Centralization Sprint

**Date:** 2026-04-06
**Duration:** 4 weeks
**Team:** 3-4 engineers + 2 designers
**Status:** Approved

## Goals

| Metric | Current | Target |
|--------|---------|--------|
| Day 90 ARPU | $430 | $600 |
| Data source connections (5 days) | 12% | 75% |
| Onboarding upsell CVR | 40% | 55%+ |
| AI Coach retention (Day 90) | 25% | 50% |

## Strategic Thesis

The product today is a "test, get results, leave" cycle for 88% of users. Retention data shows three distinct phases:

- **The Dead Zone (Week 1):** 68% of members don't return. Waiting for lab results with nothing to do. Only 12% connect data sources beyond intake.
- **The Peak (Weeks 2-3):** Retention jumps to 52% when results arrive. This is the conversion window. Recent cohorts trending up (57-58%).
- **The Cliff (Weeks 4-12):** Steady decline from 52% to 23%. No recurring engagement hooks after protocol delivery.

**Core insight:** The two goals (ARPU and engagement) are the same problem. Data source connections create the engagement layer that drives retention, which drives protocol adherence, marketplace purchases, and re-testing. Each phase of this sprint addresses one retention phase, and they compound: Phase 1 creates the data foundation and AI relationship that makes Phase 3's conversion moment more powerful, and Phase 2 sustains the engagement that drives retest revenue.

## Sprint Structure

- **Phase 1 (Sprint Weeks 1-2):** Fill the Dead Zone — data source onboarding + AI reports
- **Phase 2 (Sprint Week 3):** Prevent the Cliff — retention comms + protocol timeline
- **Phase 3 (Sprint Week 4):** Maximize the Peak — post-reveal nurture + P1 items

## Already In Flight (not in sprint scope)

These are being worked on in parallel and complement this sprint:

- 5-Day Knock onboarding drip (shipping)
- Rx conversion MVP (shipping this week)
- Protocol bundle builder (exists)
- Test personalization in marketplace (exists, prototype ready)
- Personalized onboarding upsells (in progress)
- Inline purchase during protocol reveal (in progress)

---

## P0 Deliverables

### 1. Health Home Setup + Reports

**Phase:** 1 (Sprint Weeks 1-2)
**Type:** Product + AI
**Targets:** 12% → 75% data source connections within 5 days

#### What it is

After a member completes the existing onboarding flow (intake, panel selection, phlebotomy booking), they land on a new "Data" page: "Hi [Name], let's get to know you." All data source options are visible. The member chooses which to connect in whatever order they want. Each connection triggers an AI-generated report that builds cumulatively on all prior data. A pre-protocol primer unlocks as the capstone, combining everything into one cohesive health read.

#### The Core Loop

1. **Choose a source** — all options visible (wearables, lab uploads, AI context import). User picks their own starting point. Can do all in one session or across multiple visits.
2. **Connect** — wearable OAuth, lab PDF upload, or AI context import via concierge.
3. **Generate report** — AI analyzes the newly connected source IN CONTEXT of all previously connected data. Loading state: "Generating your wearables insight..."
4. **See report** — Chat-style delivery, light depth, focused on connecting the dots between data points. Example: "Your Oura data shows a declining HRV over the last 30 days, lining up with the fatigue you mentioned in your intake."
5. **Return to source list** — connected source shows completed state with report summary. Remaining sources visible. Repeat.

#### Cumulative Intelligence

Each report gets richer as more data connects:

- After intake only: baseline medical history, goals, symptoms
- \+ Oura connected: sleep + HRV trends analyzed against intake symptoms
- \+ Labs uploaded: historical biomarker trends + wearable correlations + intake context
- \+ AI context imported: full health narrative synthesis

#### Pre-Protocol Primer

- Unlocks after member connects data sources (incentivizes connections)
- Auto-generates before the member's protocol is completed, but no more than 10 days after joining (whichever comes first)
- Even with just 1 source beyond intake, it generates
- "See your early health picture" — combines ALL connected data into a cohesive report
- Delivery format: TBD (chat vs. structured report — to be decided during implementation)
- Sets expectations for what the protocol will focus on

#### Report Characteristics

- Light depth, not multi-section deep dives
- Chat-style delivery (at least initially)
- Focus: connecting dots between data points across sources
- Generated in background via AI prompting (async)
- Knock notification ("Your report is ready") if member navigates away during generation

#### UX Decisions

- **Nudge, not gate:** homepage loads with setup prominently surfaced but not blocking. Resurfaces on subsequent visits until sources are connected.
- **All sources visible:** user picks their own order and pace. Not sequential/forced.
- **Skippable:** each source can be skipped. Not everyone has a wearable or prior labs.
- **Fresh UX:** new design, not built on the existing onboarding circle component. Clean dedicated experience.

#### Success Metrics

- % of members connecting 1+ data source within 5 days (12% → 75%)
- % connecting 2+ sources within 5 days
- Report generation completion rate
- Pre-protocol primer generation rate
- Return visits during Week 1 (currently 32%)

---

### 2. Knock In-App Messaging

**Phase:** 1 (Sprint Weeks 1-2)
**Type:** Infrastructure
**Targets:** Foundation for all comms across all phases

#### What it is

First implementation of in-app messaging via Knock. Enables banners, modals, and toasts triggered by Knock workflows. No notification inbox, no feed, no bell icon. Just contextual messages that appear when relevant.

#### Message Types

- **Banner:** persistent top-of-page message. Example: "Your wearable report is ready — see what we found."
- **Modal:** interruptive for high-priority items. Example: pre-protocol primer ready.
- **Toast:** transient confirmation. Example: "Oura connected successfully."

#### What It Powers

- **Phase 1:** "Your report is ready" when user navigates away during generation. Pre-protocol primer notification.
- **Phase 2:** Retest nudge in-app surface. Protocol check-in prompts. Timeline milestone notifications.
- **Phase 3:** Post-reveal nurture in-app messages.

#### Implementation

- Knock React SDK for real-time WebSocket connection
- Message type field in Knock payload determines rendering (banner/modal/toast)
- Deep links in each message to relevant destination
- Dismiss/read state tracked via Knock API
- No custom notification feed UI — Knock handles state, app renders contextual messages

#### Success Metrics

- In-app message delivery rate
- Click-through rate on in-app messages
- Time to first in-app message view

---

### 3. Retest Nudge Ladder

**Phase:** 2 (Sprint Week 3)
**Type:** Comms
**Targets:** Increase re-testing within 90 days

#### What it is

Knock multi-channel sequence (SMS + email + push + in-app banner) at Day 45, 60, and 75 post-protocol-delivery that nudges members toward retesting. Each step escalates specificity and urgency. Deep-links to the marketplace "Recommended" tab where retest CTAs already exist.

#### Sequence

**Day 45 — "Halfway there"**
- Light check-in referencing protocol progress
- If wearable connected: reference specific trend data
- Channel: email + in-app banner
- CTA: "See your progress" → protocol timeline

**Day 60 — "Expect improvements"**
- Personalized to their protocol: "Based on your protocol, we'd expect improvements in [specific markers]."
- Channel: push + email + in-app banner
- CTA: "Browse retesting options" → marketplace Recommended tab

**Day 75 — "Your retest window is open"**
- Social proof: "Members who retest see 34% improvement in their Superpower score."
- Urgency: retest window framing
- Channel: SMS + push + email + in-app banner
- CTA: direct marketplace link to retest products

#### Design Decisions

- Knock handles channel dedup (if user opens from push, in-app banner dismisses)
- Sequence exits when member purchases a retest
- Each message personalized with protocol-specific markers and goals
- Deep-links to marketplace where the prototype's personalized retest cards are live

#### Success Metrics

- Retest purchase rate at Day 90 (current → target TBD based on baseline)
- Nudge open/click rates per step
- Conversion by channel (which channel drives most retests)

---

### 4. Protocol Timeline View

**Phase:** 2 (Sprint Week 3)
**Type:** Product
**Targets:** Create an in-app reason to return. 50% monthly retention.

#### What it is

Minimal visual timeline on the protocol page showing where a member is in their protocol journey. The in-app destination that gives all comms somewhere meaningful to land.

#### Timeline Elements

- Protocol start date
- Current day marker ("Day 42 of 90")
- Check-in milestones (Day 14, 30, 45, 60, 75) — shows completed/upcoming
- Retest target window
- Wearable trend indicators (if connected) — directional arrows, not charts

#### UX Decisions

- Lives on the protocol page (not homepage, not dedicated route)
- Minimal design — timeline + milestones. No inline sparklines, no adherence percentages, no rich data visualizations
- Comms deep-link here: "See your progress" → protocol page with timeline
- Responsive: works on mobile and desktop

#### Success Metrics

- Protocol page visits per member per week
- Click-through rate from comms to protocol timeline
- Correlation between timeline views and retest purchases

---

### 5. Protocol Check-In Sequence

**Phase:** 2 (Sprint Week 3)
**Type:** Comms
**Targets:** 25% → 50% AI Coach retention at Day 90

#### What it is

Knock-driven touchpoints at Day 14, 30, 45, 60, 75 post-protocol-delivery. Knock sends the initial message (SMS/email/push), which opens the concierge. The concierge surfaces the relevant check-in context. Member responds from there.

#### Flow

1. **Knock sends initial message** — "How's your protocol going? Check in with your AI doctor." Via SMS, email, or push.
2. **Message deep-links to concierge** — opens the AI concierge with check-in context pre-loaded.
3. **Concierge surfaces check-in** — AI has context on their protocol, Day X, connected data, and asks relevant questions. Example: "You're 30 days into your protocol. How are you feeling about [specific supplement/lifestyle change]?"
4. **Member responds in chat** — natural conversation. AI provides encouragement, troubleshooting, or adjusted guidance based on response.

#### Check-In Cadence

- **Day 14:** Early check — "How are you settling into your protocol?" Catch issues early.
- **Day 30:** Progress check — "One month in. What's feeling different?" Reference wearable data if available.
- **Day 45:** Midpoint — "Halfway there. Any questions about your protocol?" Coincides with first retest nudge.
- **Day 60:** Momentum — "Two months of progress. Here's what your data shows." Reference trends.
- **Day 75:** Pre-retest — "Almost time to see your results. How are you feeling about retesting?"

#### Design Decisions

- Knock is the pull-back mechanism only. The actual conversation happens in the concierge.
- AI concierge receives check-in context (day number, protocol details, connected data) as a pre-filled context message.
- Each check-in is a new concierge conversation thread, not continuation of a previous one.
- If member doesn't respond to Knock message, no additional follow-up for that check-in (move to next milestone).

#### Success Metrics

- Check-in response rate per milestone
- Concierge session length after check-in
- AI Coach monthly active usage (25% → 50%)
- Correlation between check-in engagement and retest purchase

---

### 6. Post-Reveal Nurture

**Phase:** 3 (Sprint Week 4)
**Type:** Comms
**Targets:** Increase protocol CVR (supplements, Rx, tests)

#### What it is

Tiered Knock sequences based on what a member purchased (or didn't) during protocol reveal. Same Knock → concierge pattern as check-ins. Segmented by purchase status, exits on conversion.

#### Tiers

**Non-purchaser (bought nothing during reveal):**
- Day 1 post-reveal: "Your protocol is ready. Here's where to start." → concierge, where AI walks through the most impactful first step.
- Day 3: Highlight single most impactful supplement for their protocol. → concierge for discussion.
- Day 7: "Members who start within a week see X% better adherence." → marketplace.

**Partial purchaser (bought some, not all):**
- Day 3: "You started with [purchased items]. Here's what adding [top unpurchased recommendation] would do for [specific goal]." → concierge for discussion.
- Day 7: Second unpurchased recommendation with specific benefit. → marketplace.

**Full purchaser (bought everything recommended):**
- Day 30: "You've been on your full protocol for a month. Lock in your retest to track your progress." → marketplace for retest.

#### Design Decisions

- Knock workflow branches on purchase status (full/partial/none)
- Sequence stops or changes tier when purchase status changes (partial → full moves to full track)
- All non-marketplace links open concierge where AI has full context on their protocol and purchase history
- Exit conditions: full purchase for non/partial tracks; retest purchase for full track
- Channels: SMS + email + push. In-app banner for the first message in each tier.

#### Success Metrics

- Supplement purchase rate post-reveal (by tier)
- Time from reveal to first purchase
- Tier progression rate (non → partial → full)
- Day 30 retest bundle conversion rate

---

## P1 Deliverables

Expected to ship during Week 4 and overflow. Lower priority than P0s but high value.

### 7. Marketplace Enhancements

**Type:** Product (cross-cutting Phases 2-3)

Extend the personalized card treatment from tests (already prototyped: biomarker-specific copy, marker tags, differentiated CTAs) to supplements and Rx. Make marketplace the conversion hub for all comms — retest nudge ladder, post-reveal nurture, and check-in follow-ups all land here. Add protocol-linked "For You" recommendations section.

### 8. Weekly AI Health Brief

**Type:** Comms

Knock-delivered weekly digest combining wearable trends, protocol adherence status, and one personalized AI insight. Multi-channel: push + email + in-app. Provides a recurring reason to engage weekly. Links to protocol timeline or concierge for deeper exploration.

### 9. Wearable Milestone Alerts

**Type:** Comms

Data-triggered Knock alerts when meaningful changes are detected in connected wearable data. Examples: "Your resting heart rate has dropped 4 bpm since starting your protocol — that's significant." "Your sleep efficiency improved 8% this week." Triggered by threshold-based rules on wearable data deltas.

### 10. Data-Enriched Authority Moment

**Type:** Product

Small UI addition before purchase moments in the protocol reveal: "Your protocol was built from 127 biomarkers, your Oura sleep data, and 3 years of lab history you uploaded." Shows the depth of analysis. Leverages Phase 1 data source connections to build trust at the conversion moment. Low effort, high trust impact.

### 11. AI Pre-Protocol Engagement

**Type:** Product + AI

Proactive AI coach messages during the Week 1 waiting period based on connected data. Examples: "I noticed your HRV dropped Tuesday. Here's what I'd look at when your results come in." "Based on your uploaded labs from 2024, your vitamin D has been trending down. We'll check this in your new panel." Deepens AI relationship before protocol, making check-ins and post-reveal nurture more effective.

---

## Knock Workflow Summary

All Knock workflows follow one of two patterns:

**Pattern A: Knock → Marketplace**
Used for purchase-oriented messages. Knock sends multi-channel notification, deep-links to marketplace.
- Retest Nudge Ladder (Day 45/60/75)
- Post-Reveal Nurture: marketplace-targeted messages

**Pattern B: Knock → Concierge**
Used for engagement-oriented messages. Knock sends multi-channel notification, deep-links to AI concierge with pre-loaded context.
- Protocol Check-In Sequence (Day 14/30/45/60/75)
- Post-Reveal Nurture: discussion-oriented messages
- Phase 1: report ready notifications (link to report, which lives in/near concierge)

| Workflow | Trigger | Channels | Destination | Exit Condition |
|----------|---------|----------|-------------|----------------|
| Report Ready | Data source report generated | In-app banner | Report page | User views report |
| Pre-Protocol Primer Ready | Primer generated (Day 10 or pre-protocol) | In-app modal + push | Primer report | User views primer |
| Retest Nudge Day 45 | 45 days post-protocol | Email + in-app | Protocol timeline | Retest purchased |
| Retest Nudge Day 60 | 60 days post-protocol | Push + email + in-app | Marketplace | Retest purchased |
| Retest Nudge Day 75 | 75 days post-protocol | SMS + push + email + in-app | Marketplace | Retest purchased |
| Check-In Day 14/30/45/60/75 | N days post-protocol | SMS/email/push | Concierge | Member responds |
| Post-Reveal: Non-Purchaser | 1/3/7 days post-reveal, no purchase | SMS/email/push + in-app | Concierge / Marketplace | Purchase made |
| Post-Reveal: Partial | 3/7 days post-reveal, partial purchase | SMS/email/push | Concierge / Marketplace | Full purchase |
| Post-Reveal: Full | 30 days post-reveal, full purchase | Email + push | Marketplace | Retest purchased |

---

## Team Allocation (Suggested)

### Sprint Weeks 1-2: Phase 1

| Person | Focus |
|--------|-------|
| Eng 1 | Health Home Setup flow — source selection UI, connection flows, state management |
| Eng 2 | AI report generation pipeline — background processing, cumulative context, chat delivery |
| Eng 3 | Knock in-app messaging infrastructure — SDK integration, banner/modal/toast rendering |
| Designer 1 | Health Home Setup UX — source cards, connection states, report presentation, pre-protocol primer |
| Designer 2 | Begin Phase 2 design — protocol timeline, check-in UX |

### Sprint Week 3: Phase 2

| Person | Focus |
|--------|-------|
| Eng 1 | Protocol Timeline View — minimal timeline component on protocol page |
| Eng 2 | Knock workflow configuration — retest nudge ladder, check-in sequences |
| Eng 3 | Concierge check-in integration — pre-loaded context, check-in conversation flow |
| Designer 1 | Protocol timeline visual design |
| Designer 2 | Phase 3 design — post-reveal nurture copy, marketplace concepts |

### Sprint Week 4: Phase 3 + P1s

| Person | Focus |
|--------|-------|
| Eng 1 | Post-reveal nurture Knock workflows — tier logic, exit conditions |
| Eng 2 | P1: Marketplace enhancements — supplement/Rx personalization, "For You" section |
| Eng 3 | P1: Weekly AI Health Brief + Wearable Milestone Alerts (Knock workflows + data triggers) |
| Eng 4 (if available) | P1: Data-Enriched Authority Moment + AI Pre-Protocol Engagement |
| Designers | Polish, QA, iteration based on Phase 1-2 early data |

---

## Open Questions

1. **Pre-protocol primer delivery format:** Chat-style (consistent with per-source reports) vs. structured report page (more authoritative). To be decided during Phase 1 implementation.
2. **Marketplace scope clarity:** The test personalization prototype exists. How much of the supplement/Rx personalization is new backend work vs. extending the existing pattern? Needs scoping during Week 2.
3. **Check-in concierge context:** How is the check-in context pre-loaded into the concierge? New preset message type? URL parameter with context? Needs alignment with the AI chat team.
4. **Wearable data pipeline maturity:** Phase 1 gets users connected. Do we have the data pipeline in place to compute trends and detect milestones for P1 items (Weekly Brief, Milestone Alerts)? If not, P1 items 8 and 9 may need backend data work.
