# GeoTechieX — Put Yourself On The Map
## Agentic Content Studio Future-Series Planning & Pre-Augmentation Specification

Version: 1.0
Series: Put Yourself On The Map
Hashtag: #PutYourselfOnTheMap
Brand: GeoTechieX

---

## 1. PURPOSE

This document defines how the GeoTechieX Content Studio should plan, store, pre-augment, generate, and promote future arcs for the recurring community series:

**Put Yourself On The Map**

The system must understand that this is a COMMUNITY CHALLENGE SERIES.

GeoTechieX is not telling its own story in these posts.

Each episode gives OTHER SURVEYORS a concrete prompt to film or write about one specific moment from their own surveying work and publish publicly using:

#PutYourselfOnTheMap

The platform should therefore be designed so future series can be prepared in advance while only ONE arc is promoted as the current/live challenge at any given time.

---

## 2. CORE SERIES MODEL

The permanent series identity is:

- Series name: `Put Yourself On The Map`
- Hashtag: `#PutYourselfOnTheMap`
- Brand: `GeoTechieX`

The series does not change.

What changes over time is the active ARC.

### Arc

An arc is a connected batch of episodes covering one real surveying process, situation, problem, or theme.

Required fields:

```json
{
  "arcId": "",
  "arcTitle": "",
  "arcHook": "",
  "status": "planned",
  "seasonOrder": 1,
  "episodeCount": 0,
  "episodes": []
}
```

Recommended status values:

- `planned`
- `pre_augmented`
- `ready`
- `current`
- `archived`

Only ONE arc may have:

```text
status = current
```

at any time.

---

## 3. EPISODE MODEL

Every arc contains 5–10 episodes.

Episodes MUST remain in fixed chronological order.

Never shuffle episode order.

Each episode must represent ONE distinct physical, filmable moment.

Required structure:

```json
{
  "episodeId": "",
  "episodeNumber": 1,
  "title": "",
  "prompt": "",
  "status": "planned"
}
```

### Title rules

- 2–5 words
- Concrete
- Physical
- Easy to understand
- Avoid abstract concepts
- Avoid motivational language

Good:

- `The Battery Dies`
- `Finding the Beacon`
- `Downloading the Data`
- `Back to Site`
- `The Fence Is Different`

Bad:

- `Embrace Accuracy`
- `The Power of Persistence`
- `Understanding Professional Excellence`

### Prompt rules

The prompt must:

- Speak directly to another surveyor.
- Use second person.
- Tell them exactly what moment to show or describe.
- Focus on something physically observable.
- Be filmable.
- Be relatable to working surveyors.
- Still make sense to someone outside surveying.

The prompt is NOT a GeoTechieX personal story.

---

## 4. AUDIENCE REQUIREMENT

Every arc and episode must work for BOTH audiences.

### Audience A — Surveyors

A working surveyor should immediately recognize the situation as something that can genuinely happen in field or office work.

The system must avoid unrealistic surveying scenarios.

### Audience B — General Public

Someone with no surveying background should understand what is happening and find the moment interesting or surprising.

Do not turn every episode into a textbook explanation.

The physical moment should carry the story.

---

## 5. BRAND VOICE

Use:

- Minimal
- Technical
- Documentary
- Concrete
- Physical
- Honest
- Understated
- Real-world
- Professional

Avoid:

- Hype
- Fake urgency
- Growth hacks
- Fake statistics
- Overnight-success language
- Motivational clichés
- Corporate marketing language
- Generic creator language
- AI-startup clichés

The principle is:

**Show the work. Show the struggle. Let the moment speak.**

---

# 6. FUTURE ARC ROADMAP

The following arcs should be pre-planned so the Content Studio can generate and prepare future content before an arc becomes active.

These are PLANNED future arcs. They are not automatically current.

---

## ARC 01 — How We Get Each Point on a Survey Plan

Status:

```text
current / active
```

Hook:

> The struggle to get your plan ready.

Core concept:

Follow the connected journey from the beginning of a survey job through site inspection, setup, observations, checks, processing, and the final survey plan.

Suggested episode progression:

1. The First Site Visit
2. Checking the Ground
3. Setting Up
4. Taking the Point
5. Checking the Measurements
6. Downloading the Data
7. Building the Plan

Important:

The exact approved/current episode list stored in the Content Studio database is authoritative. Do not silently replace it with this planning example if production data already exists.

---

# ARC 02 — What Happens When the Ground Doesn't Match the Plan

Status:

```text
planned
```

Suggested arcHook:

> The drawing says one thing. The ground says another.

Core concept:

Explore what happens when physical site conditions do not appear to match existing plans, records, or expectations.

Suggested episodes:

1. The Plan Looks Different
2. The Fence Is Somewhere Else
3. The Beacon Is Missing
4. The Measurements Don't Agree
5. Back to the Records
6. Checking the Evidence
7. Back to the Site
8. Updating the Plan

Production principle:

Do not imply that a visible fence automatically represents a legal boundary.

The content should show investigation and professional checking rather than making unsupported legal conclusions.

---

# ARC 03 — The Day You Have to Find a Beacon

Status:

```text
planned
```

Suggested arcHook:

> Some points aren't waiting where the plan says they are.

Suggested episodes:

1. Finding the Old Description
2. Walking the Boundary
3. Clearing the Spot
4. Searching for the Beacon
5. Something Is Buried
6. Checking the Position
7. The Point Is Confirmed

Core concept:

A physical search for boundary evidence or survey marks.

The story should emphasize the actual fieldwork involved rather than presenting beacon recovery as a simple treasure hunt.

---

# ARC 04 — What Surveyors Actually See on Site

Status:

```text
planned
```

Suggested arcHook:

> A surveyor sees more than an empty plot.

Suggested episodes:

1. The Site Entrance
2. The Existing Fence
3. The Road Access
4. The Drainage
5. The Buildings
6. The Terrain
7. The Hidden Features
8. The Field Notes

Core concept:

Show the physical features surveyors observe that ordinary visitors may overlook.

---

# ARC 05 — From Field Data to Survey Plan

Status:

```text
planned
```

Suggested arcHook:

> The fieldwork is over. The processing begins.

Suggested episodes:

1. Downloading the Data
2. Opening the Points
3. Cleaning the Data
4. Connecting the Features
5. Checking the Coordinates
6. Building the Boundary
7. Adding the Details
8. Checking the Plan
9. Printing the Plan

Core concept:

Follow the transition from collected observations to a usable survey drawing.

This arc is especially suitable for connecting surveying with GIS, CAD, automation, and software workflows.

---

# ARC 06 — When a Survey Goes Wrong

Status:

```text
planned
```

Suggested arcHook:

> Not every survey goes according to plan.

Suggested episodes:

1. The Battery Dies
2. The Point Is Blocked
3. No GNSS Signal
4. The Line of Sight Is Gone
5. The Coordinates Don't Agree
6. Something Was Missed
7. Back to Site
8. Fixing the Survey

Core concept:

Document real operational problems without manufacturing drama.

Never invent a failure simply to make content interesting.

---

# ARC 07 — The Things Clients Never See

Status:

```text
planned
```

Suggested arcHook:

> The finished plan hides a lot of work.

Suggested episodes:

1. Packing the Equipment
2. Checking the Batteries
3. Driving to Site
4. Setting Up
5. Taking the Measurements
6. Checking the Data
7. Processing the Survey
8. Drawing the Plan
9. Final Review

Core concept:

Expose the invisible preparation, fieldwork, processing, and quality-control work behind a deliverable.

---

# ARC 08 — How We Know a Point Is Right

Status:

```text
planned
```

Suggested arcHook:

> You don't just measure a point once and trust it.

Suggested episodes:

1. Setting the Control
2. Taking the Observation
3. Checking the Backsight
4. Repeating the Measurement
5. Comparing the Results
6. Checking the Error
7. Confirming the Point

Core concept:

Show practical verification and quality-control moments.

Do not turn this into an abstract lecture about accuracy.

---

# ARC 09 — A Surveyor's Day in the Field

Status:

```text
planned
```

Suggested arcHook:

> One day. One site. More work than it looks.

Suggested episodes:

1. Arriving on Site
2. Unloading the Gear
3. Walking the Property
4. Setting Up
5. Taking Observations
6. Field Problems
7. Final Checks
8. Packing Up
9. Returning to Office

Core concept:

A chronological documentary day-in-the-life arc.

---

# ARC 10 — The Boundary Is Not Always the Fence

Status:

```text
planned
```

Suggested arcHook:

> What you can see isn't always what you're looking for.

Suggested episodes:

1. The Visible Fence
2. Finding the Beacon
3. Checking the Plan
4. Comparing the Evidence
5. Measuring the Position
6. Finding the Difference
7. Recording the Evidence
8. Reviewing the Boundary

Core concept:

Explore the difference between visible occupation/features and the professional process of determining and representing boundary information.

Avoid unsupported legal advice.

---

# ARC 11 — What Happens Before We Measure

Status:

```text
planned
```

Suggested arcHook:

> The first measurement starts long before the instrument.

Suggested episodes:

1. Getting the Job Details
2. Checking the Documents
3. Planning the Visit
4. Checking Access
5. Choosing the Equipment
6. Preparing the Team
7. Reaching the Site
8. Starting the Survey

Core concept:

Show the preparation that makes field measurement possible.

---

# ARC 12 — The Survey Equipment Has a Job

Status:

```text
planned
```

Suggested arcHook:

> Every piece of equipment has a reason to be there.

Suggested episodes:

1. The Tripod
2. The Total Station
3. The Prism
4. The GNSS Rover
5. The Data Collector
6. The Ranging Pole
7. The Batteries
8. Packing the Case

Core concept:

Each episode focuses on one physical equipment moment.

Avoid turning the series into product advertising unless a specific product is intentionally being featured.

---

# 7. PRE-AUGMENTATION SYSTEM

The agentic Content Studio should NOT wait until an arc becomes current before planning it.

For every future arc, the system should pre-generate structured content metadata.

Each planned arc should have:

```text
Arc metadata
↓
Episode sequence
↓
Episode prompts
↓
Video script seeds
↓
Visual scene suggestions
↓
Caption seeds
↓
Hashtag set
↓
Poster copy
↓
Thumbnail/headline copy
↓
Publishing order
↓
Quality-control checks
```

The generated material should remain in `planned` or `pre_augmented` status until approved.

The system must never automatically publish a future arc simply because its content has been generated.

---

# 8. PRE-AUGMENTED EPISODE OBJECT

Recommended internal structure:

```json
{
  "arcId": "arc-02",
  "episodeNumber": 1,
  "title": "The Plan Looks Different",
  "prompt": "",
  "content": {
    "hook": "",
    "relatable": "",
    "scenes": [],
    "cta": "",
    "caption": "",
    "hashtags": []
  },
  "visual": {
    "posterHeadline": "",
    "posterBody": "",
    "visualDirection": ""
  },
  "production": {
    "estimatedDurationSeconds": 30,
    "platforms": ["TikTok", "Instagram Reels", "YouTube Shorts"],
    "status": "planned"
  }
}
```

The agent may generate these fields ahead of time, but human approval should be required before changing production status to `ready`.

---

# 9. CURRENT ARC RULE

The platform must maintain exactly ONE current arc.

Recommended state:

```json
{
  "currentArcId": "arc-01"
}
```

When an arc finishes:

1. Mark the old arc `archived`.
2. Select the next approved arc.
3. Change the new arc to `current`.
4. Reset episode progression to episode 1.
5. Never reorder old episodes.
6. Keep historical performance data attached to the archived arc.
7. Do not modify already-published content unless explicitly requested.

---

# 10. FUTURE ARC PREPARATION WORKFLOW

The agent should follow this pipeline:

### Phase 1 — Arc Planning

Define:

- Arc title
- Arc hook
- Core situation/process
- 5–10 episodes
- Fixed episode order

### Phase 2 — Reality Check

For every episode ask:

1. Is this a real surveying moment?
2. Can a surveyor physically film it?
3. Is it one distinct moment?
4. Would a non-surveyor understand what is happening?
5. Is the wording technically credible?
6. Does it avoid unsupported legal/professional claims?

If any answer is NO, revise the episode.

### Phase 3 — Content Pre-Augmentation

Generate:

- Hook
- Relatable line
- 4–8 scene beats
- Voiceover lines
- CTA
- Caption
- Hashtags
- Poster copy
- Visual direction

### Phase 4 — Consistency Check

Verify:

- GeoTechieX spelling
- Put Yourself On The Map naming
- #PutYourselfOnTheMap
- Correct arc
- Correct episode number
- Correct episode order
- Second-person community directive
- No GeoTechieX-as-surveyor storytelling
- No hype
- No invented statistics
- No abstract motivational episode

### Phase 5 — Approval

Set:

```text
status = ready
```

only after review.

### Phase 6 — Activation

When the current arc is exhausted:

```text
current → archived
ready future arc → current
```

Do not activate an unapproved `planned` arc.

---

# 11. DAILY CONTENT GENERATION RULE

When generating Day N:

1. Find the current arc.
2. Find episode N within that arc.
3. Never substitute an episode from another arc.
4. Never shuffle the sequence.
5. Generate content from that episode's physical moment.
6. Maintain the arc's hook/theme where appropriate.
7. Keep the community directive intact.

If an episode has already been published, do not regenerate it as a new episode unless explicitly requested.

---

# 12. EPISODE-TO-VIDEO TRANSLATION

An episode prompt is NOT automatically the video script.

The transformation should be:

```text
Episode physical moment
→
scroll-stopping concrete hook
→
relatable observation
→
4–8 filmable beats
→
short voiceover
→
community CTA
```

The resulting video should still feel like a real surveying moment.

Do not add drama that isn't present in the original episode.

---

# 13. VISUAL CONTENT RULES

GeoTechieX visual identity should remain:

- Minimal
- Technical
- Documentary
- Black / off-white / neutral gray
- Electric blue accent
- Real surveying equipment
- Real field environments
- Realistic developer/GIS environments where relevant
- Subtle grain
- Strong typography

Avoid:

- AI robots
- Humanoid robots
- Holograms
- Neon cyberpunk
- Floating fake code
- Generic SaaS imagery
- Stock businessmen
- Luxury cars
- Cash
- Crypto imagery
- Overly glossy 3D
- Fake futuristic surveying equipment
- Misspelled GeoTechieX
- Tiny unreadable text

---

# 14. COMMUNITY DIRECTIVE RULE

Every Put Yourself On The Map episode must ultimately answer:

> What specific moment can another surveyor show us from their own work?

The CTA should encourage participation, not merely passive viewing.

Good:

> Show us what happened when you found the missing beacon and tag #PutYourselfOnTheMap.

Bad:

> Follow us for more amazing surveying content!

The community member is the subject.

GeoTechieX is the platform facilitating the challenge.

---

# 15. ARC DIFFERENTIATION

Future arcs should not repeat the same story from a different title.

Before approving a new arc, compare it against existing arcs.

The new arc should have a distinct:

- Problem
- Process
- Physical environment
- Viewer curiosity
- Episode progression

For example:

`From Field Data to Survey Plan`

and

`How We Get Each Point on a Survey Plan`

overlap heavily.

The system should flag that overlap before creating another near-duplicate arc.

---

# 16. ARC ROADMAP IS EXTENSIBLE

The 12 arcs in this document are the initial roadmap, not the permanent limit.

Future arcs may be added.

Every new arc must follow the same structure:

```text
arcTitle
arcHook
coreConcept
episodes[5–10]
status
seasonOrder
```

New arcs should be appended rather than silently replacing existing roadmap entries.

---

# 17. DATA MODEL RECOMMENDATION

If using a database, use a structure similar to:

```text
series
├── id
├── name
├── hashtag
└── description

arcs
├── id
├── series_id
├── season_order
├── title
├── hook
├── core_concept
├── status
├── created_at
└── updated_at

episodes
├── id
├── arc_id
├── episode_number
├── title
├── prompt
├── status
├── published_at
└── created_at

episode_content
├── episode_id
├── hook
├── relatable
├── scenes
├── cta
├── caption
├── hashtags
├── poster_copy
├── visual_direction
└── approved_at

publication_history
├── episode_id
├── platform
├── published_at
├── url
└── performance_metadata
```

The content model should allow future episodes to be pre-generated without making them live.

---

# 18. AGENTIC BEHAVIOR

The agent should behave like a content-production planner, not just a text generator.

It should proactively:

- Detect the current arc.
- Prepare upcoming episodes.
- Pre-augment future arcs.
- Identify duplicate themes.
- Check episode ordering.
- Flag weak/abstract episodes.
- Flag technically questionable surveying scenarios.
- Maintain consistent naming.
- Keep future arcs ready for approval.
- Preserve published content.
- Maintain historical archives.
- Never activate or publish unapproved content.

The agent should prefer preparation over last-minute generation.

---

# 19. QUALITY GATE

Before any arc becomes `ready`, run this checklist:

- [ ] Arc has a concrete process/theme.
- [ ] Arc has a short hook.
- [ ] Arc contains 5–10 episodes.
- [ ] Episodes are chronologically ordered.
- [ ] Every episode is physically filmable.
- [ ] Every episode is distinct.
- [ ] Every prompt addresses another surveyor directly.
- [ ] No episode is abstract or motivational.
- [ ] Surveyors would recognize the situation.
- [ ] General viewers can follow the moment.
- [ ] No invented statistics.
- [ ] No hype.
- [ ] No fake success claims.
- [ ] No unsupported legal claims.
- [ ] GeoTechieX is spelled correctly.
- [ ] #PutYourselfOnTheMap is used correctly.
- [ ] Future content is not accidentally marked current.
- [ ] No duplicate/near-duplicate arc exists.

---

# 20. SUCCESS CRITERIA

The Content Studio is working correctly when:

1. Multiple future arcs can exist in the database before they are needed.
2. Each future arc already has an ordered episode roadmap.
3. Future episodes can be pre-augmented into production-ready drafts.
4. Only one arc is current.
5. The current arc controls daily episode generation.
6. Archived arcs remain unchanged and searchable.
7. New arcs can be added without changing existing historical content.
8. The agent can detect duplicate or weak future arcs.
9. A human can approve an entire future arc before activation.
10. Daily content generation requires minimal last-minute planning.

---

## FINAL PRINCIPLE

**Plan the season before publishing the episode.**

Put Yourself On The Map should feel like an ongoing documentary archive of real surveying work contributed by surveyors themselves.

GeoTechieX provides the prompt.

Surveyors provide the real moment.

The platform organizes the journey.
