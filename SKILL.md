---
name: mockup
description: Use when creating or redesigning UI through local interactive mockups, especially when users need to compare strong visual directions before implementation.
---

# Mockup Skill

Build interactive UI mockups on **localhost** using HTML + Tailwind CSS via CDN. The gallery page is deterministic. The individual design pages are not. Every mockup must look like a human designer made it — not an AI.

All session files go under `/tmp/mockup-*/` — never in the project directory.

**Related skill:** The `frontend-design` skill covers deeper design philosophy. Cross-reference it when you need a richer design language.

---

## Update Awareness

At the start of a session, check whether the local skill install appears to come from the canonical repository:

- `https://github.com/OliseNS/mockup.git`

Only do this when the skill files live inside a git checkout or a symlinked clone that can be inspected safely. If the user copied files manually, if network access is unavailable, or if the repo provenance is unclear, do not guess and do not interrupt the workflow.

When the local install is a git checkout of the canonical repo, the agent may compare the local branch to the upstream default branch to see whether updates exist.

If the local install is behind, tell the user briefly that a newer version of the mockup skill is available and ask whether they want to update before continuing. Do not auto-pull, do not modify the user's local install without consent, and do not block the current design task if the user wants to continue on the current version.

If the local install is current, continue silently.

---

## Design Intelligence First

Do not jump from the user's request straight into screens. First understand **what is being designed, why it matters, and what the design needs to improve**.

The design language for each option must come from the task, the product context, and the observed weaknesses of the current UI. Do not start from a canned aesthetic, a favorite layout, or a preselected style family and then force the task into it.

Before any mockup work, create an internal design brief with answers to these questions:

- What surface is being designed: page, flow, dashboard, component, empty state, marketing site, or redesign of an existing screen?
- Why is the user asking for this: higher conversion, better clarity, stronger brand presence, cleaner information density, better mobile behavior, or sharper hierarchy?
- Who is using it and what do they need to accomplish quickly?
- What must remain recognizable and what is safe to change?
- What would make the redesign objectively better: clearer hierarchy, fewer decisions, stronger focal point, better scanability, better spacing rhythm, better content prioritization, or better emotional tone?

Also produce an internal **design driver** for each option in one sentence:

- What specific product problem is this option trying to solve better than the others?
- Why does this structure fit this task instead of some generic landing page or dashboard template?

If you cannot answer those questions from the prompt or the existing codebase, gather more context before designing. If you already can answer them, do not prolong discovery just to manufacture extra process.

---

## Existing UI Exploration

When the user wants to redesign something in an existing codebase, do a deep exploration of the current UI before producing concepts.

The goal is not to copy the current interface. The goal is to understand what it is doing now, what is weak, and what constraints the redesign must respect.

Inspect the current UI from both sides when available:

- **Implementation side:** find the relevant route, page, component tree, styling system, spacing primitives, layout wrappers, and reusable UI building blocks.
- **Visual side:** inspect the rendered UI or screenshots and map the actual composition: navigation position, hero/content order, grid structure, spacing rhythm, hierarchy, density, alignment, call-to-action placement, and repeated patterns.

Before designing, be able to state internally:

- What the current information hierarchy is
- Which parts are working and should be preserved
- Which parts are confusing, generic, misaligned, or visually weak
- Which layout constraints come from the product or design system rather than bad design choices

If you cannot describe the current UI in concrete terms, you have not explored enough yet.

---

## Question Policy

Use the ask-questions tool deliberately. Questions are for resolving blockers, not outsourcing design thinking to the user.

Ask a question only when the answer will materially change the mockup and cannot be inferred from the prompt, the current codebase, or a sensible design exploration.

Good reasons to ask:

- The product surface or audience is ambiguous
- There are conflicting success criteria
- A hard business or brand constraint is missing
- The user must choose between clearly different product directions, not just visual taste

Do not ask when you can answer through mockups instead:

- "Which layout do you want?" before showing options
- "What style do you prefer?" when you can show 2-3 strong directions
- "Should this be modern/minimal/playful?" without first giving the user something concrete to react to

When you do ask, prefer concise multiple-choice questions via the ask-questions tool. Ask the minimum number of questions needed to unblock high-quality work.

---

## Design Quality Standard

The mockup must not just be different from generic AI output. It must be better by established design principles.

Judge every option against these criteria:

- **Purpose fit:** the composition matches the product goal instead of following a generic template
- **Hierarchy:** the most important action or information is obvious within seconds
- **Composition:** layout has tension, rhythm, and intentional imbalance rather than robotic symmetry
- **Content clarity:** labels, numbers, and copy support decision-making instead of filling space
- **Interaction logic:** controls appear where users need them and support the flow of the screen
- **System awareness:** the design respects the existing design system, component primitives, and technical constraints when redesigning inside a live codebase
- **Distinctiveness:** the work has a clear point of view and does not collapse into safe SaaS sameness

If an option is visually stylish but weaker in hierarchy, clarity, or task flow, it is not the better design.

---

## Design Rules

### Internal Design Checks (don't show to the user)

Before building, verify internally that your options are genuinely diverse. Each option must differ in **at least 2 of these 3 dimensions**: page structure, interaction emphasis, and layout approach. No two options should share more than 2 of the same structural elements (nav type, hero treatment, content organization, footer type, CTA pattern). If they do, rework the options.

Also internally verify each option breaks common AI-generated patterns (symmetry, centered layouts, equal columns, generic Tailwind defaults). The "human-made" rules below are your design constraints, not talking points to explain to the user.

Also verify that each option has a clear design thesis in one sentence tied to the task. If you cannot explain why an option exists, what product tradeoff it makes, and why that tradeoff fits this brief, it is decoration, not design.

Run one internal evaluator pass before showing the user anything:

- Check whether the option could be mistaken for a generic AI-generated SaaS page with different colors.
- Check whether the composition follows from the brief, or whether it looks like a template with the nouns swapped out.
- Check whether another strong human designer could defend the hierarchy and structure in product terms.

If any answer is no, rework the option before presenting it.

---

### The Golden Rule: It Should Look Human-Made

The single biggest tell of an AI-generated mockup: **everything is centered, symmetrical, and evenly spaced.** Human designers break the grid. They push elements off-center. They let content determine the layout, not a template.

Before every design decision, ask: "Would a human designer do this?" If the answer is no, change it.

---

### Color: One Accent, and Starve It

Pick ONE hue. Use it on 3-5% of the interface max. The accent should feel like a restrained choice, not a theme.

```html
<script>
tailwind.config = {
  theme: {
    extend: {
      colors: {
        accent: '#<choose-ONE>',     // not purple, not tailwind-blue-500
        'accent-hover': '#<darker>',
        surface: '#<card-bg>',
        foreground: '#<text>',
        background: '#<page-bg>',
        muted: '#<subtle-bg>',
        'muted-fg': '#<subtle-text>',
        border: 'rgba(...)',
      },
      fontFamily: {
        display: ['<font>', 'system-ui', 'sans-serif'],
        sans: ['<font>', 'system-ui', 'sans-serif'],
        mono: ['<font>', 'monospace'],
      },
    }
  }
}
</script>
```

**Never use the accent as a background** (no accent nav bars, accent hero sections, accent card backgrounds). Accent is for: text links, small dividers, data highlights, one single primary button. That's it.

**Avoid complementary or split-complementary palettes** — they're the number-one sign a computer picked the colors. If your accent is warm (red/orange), your neutrals should be warm too — don't pair a warm accent with cool grays.

Choose color based on the task and the option's design driver. Variation across sessions is desirable, but never rotate palettes mechanically just for novelty.

---

### Typography: Restraint

The AI instinct is to use the display font everywhere. Don't. Display font for headings only. Body text is always the sans/body font.

```html
<!-- fonts: DM Sans, JetBrains Mono -->
```
Available: DM Sans, Space Grotesk, Plus Jakarta Sans, Instrument Sans, Sora, Cabinet Grotesk, Fraunces, Playfair Display, Satoshi, Geist, Inter (sparingly), JetBrains Mono, Source Serif.

**Never use more than 2 fonts in a single design.** Never use a display font at smaller than 1.25rem. Never set body text below 0.875rem.

---

### Tailwind: Turn Off the Defaults

Tailwind via CDN is the tool, but its defaults scream "AI-made." You must override them:

- **Never use Tailwind's default `rounded-lg`, `rounded-xl`, `rounded-2xl` on cards, sections, or containers** — use `rounded-sm`, `rounded`, or no rounding at all. Reserve `rounded-lg`+ for exactly one element max (usually the hero image).
- **Never use `shadow-md`, `shadow-lg`, or `shadow-xl`** — these are universally recognizable. Use `shadow-sm`, `shadow-[0_1px_3px_rgba(0,0,0,0.08)]`, or no shadow.
- **Never use `gap-6` or `gap-8` as your default grid gap** — it's the Tailwind default and produces the same spacing every time. Use `gap-3`, `gap-4`, `gap-5`, or asymmetric gaps.
- **Never use `text-4xl` through `text-6xl` for hero headings** — these are the standard Tailwind sizes everyone uses. Use `text-[2rem]`, `text-[2.5rem]`, `text-[3.25rem]` with custom line-height instead.
- **Never wrap everything in `max-w-7xl mx-auto`** — this is the single most identifiable "I used Tailwind" pattern. Use `max-w-5xl`, `max-w-[80rem]`, or no max-width with generous side padding.
- **Avoid `space-y-*` utility for vertical rhythm** — use custom `gap-*` on a flex-col container or individual margins instead. The `space-y` pattern produces identical spacing between every child, which looks robotic.
- **Override the default ring/focus styles** — the Tailwind default blue ring is a dead giveaway.

---

### Layout: Break the Symmetry

The human eye is good at spotting symmetry. AI-generated layouts are almost always symmetrical. Break it.

**Banned symmetrical patterns:**
- Hero with centered text and a single CTA button below it
- Three equal cards in a row (do 2-up or stagger widths instead)
- Alternating left-right image/text sections
- 3x2 or 4x2 feature grids
- Nav with logo centered, links on both sides
- Footer with 4 equal columns
- Full-width bars/sections that are all the same height
- Pricing tables with 3 or 4 equal columns

**Do instead:**
- Hero text on the left, image bleeding past the text bounds. CTA as a text link, not a button.
- Two-column layouts with one column much wider than the other (70/30, 60/40)
- Content that hangs off the grid (images that break their container bounds)
- Nav that's asymmetric — logo on the left, links on the right, no centered elements
- Lists instead of grids — a vertical column of items with varying line lengths
- Data or numbers as a visual element (big stat numbers, inline charts)
- Staggered card heights, widths, or positions

**If you find yourself using `grid-cols-3`, stop.** Use `grid-cols-2` or `grid-cols-[2fr_1fr]` or a plain flex layout with asymmetric sizing instead.

---

### Banned Patterns — These Make Designs Look AI-Generated

Every item below is a recognized AI design tell. If any of these are present, the design looks generic. Fix before showing the user.

**Colors:**
- Purple/blurple (`#8B5CF6`, `#7C3AED`, `#6C63FF`, `#6366F1`, `#667eea`, `#7C3AEd`)
- Tailwind blue-500 (`#3B82F6`) or any AI-standard blue
- Emerald-500 (`#10B981`) or teal-500
- Gradient text (accent-to-something) on headings
- Gradient backgrounds or gradient overlays on images
- Pure primaries (pure red `#FF0000`, pure blue `#0000FF`, etc.)

**Layouts (see also: the full symmetry section above):**
- Centered hero with 2 CTA buttons
- Alternating L/R image-text sections (the "feature section" template)
- Three equal cards in a row
- 3x2 or 4x2 feature icon grids
- Marquee logo rows / "trusted by" logo strips
- Every section the same height and width
- Full-bleed color sections that alternate (white section, gray section, white section)

**Components:**
- Glassmorphism (frosted glass effect)
- Metaball / blob backgrounds or decorative shapes
- Animated number counters (numbers that count up)
- Overlapping avatar stacks ("4 people joined" circles)
- Floating phone/laptop mockups
- Wavy SVG dividers between sections
- Pill-shaped buttons for secondary actions
- Cards with icons in circles at the top
- "Learn more" arrows → or "→" on cards
- Badge/chip saying "New" or "Popular"
- Avatar circles with initials

**Typography:**
- "AI voice" clichés: "Elevate", "Seamless", "Unleash", "Next-Gen", "Supercharge", "Revolutionize", "Empower", "Transform", "Reimagine", "Redefine", "Unlock", "Powerful"
- Emoji in UI (use ◆ ● ▶ → ▼ ▲ ■ or SVG icons instead)
- Lorem ipsum (use real-sounding placeholder content)
- Stock photography or generic avatar blobs

---

## Direction Diversity

### The Core Problem

The most common failure: 3 options that feel like the same layout with different paint. **This is banned.** If the user's choice comes down to "which color do I prefer" instead of "which design direction do I prefer", you've failed.

Within a single task, each option must differ in **at least 2 of these 3 dimensions**:

| Dimension | What it means |
|-----------|--------------|
| **Page structure** | The skeleton — nav type, hero treatment, how content is organized vertically |
| **Interaction emphasis** | What the design prioritizes first — narrative, decision-making, browsing, comparison, trust, speed, density |
| **Layout approach** | How elements sit on the page — asymmetric grid, single column, overlapping, split-screen, etc. |

Example: For a landing page with 3 options, this is **banned**:
- Option A: Narrative-led — centered hero, 3 feature cards in a row, footer
- Option B: Trust-led — centered hero, 3 feature cards in a row, footer *(same structure, different colors)*
- Option C: Conversion-led — centered hero, 3 feature cards in a row, footer *(same structure, different borders)*

This is **good**:
- Option A: Narrative-led — full-screen hero image with text overlay, vertical article-style content below, no feature cards, thin nav
- Option B: Evidence-led — dashboard-style layout, stats and numbers as hero, tabbed interface, sidebar nav, small multiples
- Option C: Action-led — no nav at all, giant typography as the hero, single-column decision flow, inline action modules instead of feature sections

**Structural overlap rule:** No two options within a task can share more than 2 of these structural elements:
- Same nav type (top bar / sidebar / no nav / sticky / off-canvas)
- Same hero treatment (full-screen / half-screen / text-only / image-only / no hero)
- Same content organization (cards / list / single column / grid / tabs / accordion)
- Same footer type (full / minimal / no footer)
- Same CTA pattern (button / text link / form / no CTA)

### No Style Roulette

Do not generate directions by picking from a house catalog like editorial, brutalist, dark SaaS, or playful and then applying it to the task. Those labels can appear later as shorthand when they genuinely describe what emerged, but they must not be the starting point.

Instead, derive each option from a different product thesis:

- one option can optimize for clarity and scanability
- one can optimize for emotional pull or brand presence
- one can optimize for speed of decision-making or action

The visual language should emerge from that thesis, the audience, the content, and the product surface. If you can swap the copy and keep the exact same layout, the option is too generic.

---

## Gallery Page

One gallery page per session at `/tmp/mockup-*/index.html`. Each task gets its own section with 2-3 option cards. Each card links to a standalone HTML file (option-a.html, option-b.html, etc.).

No decorative flourishes on the gallery page itself — all personality lives inside the design pages.

The gallery is the only deterministic surface in this skill. Keep its structure, card anatomy, and interaction model stable across sessions.

```html
<div class="min-h-svh bg-background flex flex-col">
  <div class="flex-1 max-w-5xl mx-auto w-full p-8">
    <!-- ===== Task 1 Section ===== -->
    <div class="mb-14">
      <span class="text-xs font-mono text-muted-fg tracking-wider">TASK 1</span>
      <h2 class="text-xl font-bold text-foreground mt-1 mb-6">Landing Page</h2>
      <div class="flex flex-wrap gap-6">
        <!-- ===== Card A ===== -->
        <a href="option-a.html" data-choice="a"
           class="flex-1 min-w-[260px] flex flex-col p-6 border-2 border-foreground/10 hover:border-accent bg-surface transition-colors group">
          <!-- Top row: label + palette dots -->
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-mono text-muted-fg tracking-widest">OPTION A</span>
            <span class="flex gap-1.5">
              <span class="inline-block w-3 h-3 rounded-full" style="background:#C73E3E"></span>
              <span class="inline-block w-3 h-3 rounded-full border border-foreground/10" style="background:#F0EDE8"></span>
            </span>
          </div>
          <!-- Direction name -->
          <h3 class="text-lg font-bold text-foreground leading-tight">Narrative-led product story</h3>
          <!-- Description -->
          <p class="text-sm text-muted-fg mt-1.5 leading-relaxed flex-1">Full-screen hero image with text overlay, article-style content, thin nav. Built to make the product feel legible and specific instead of generic.</p>
          <!-- Structural tags at bottom -->
          <div class="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-foreground/5">
            <span class="text-[11px] font-mono text-muted-fg/60 px-2 py-0.5 bg-foreground/[0.03] rounded">hero image</span>
            <span class="text-[11px] font-mono text-muted-fg/60 px-2 py-0.5 bg-foreground/[0.03] rounded">single column</span>
            <span class="text-[11px] font-mono text-muted-fg/60 px-2 py-0.5 bg-foreground/[0.03] rounded">thin nav</span>
          </div>
          <!-- Font info -->
          <div class="flex items-center gap-2 mt-2">
            <span class="text-[10px] text-muted-fg/40 font-mono tracking-tight">Source Serif</span>
            <span class="text-muted-fg/20">/</span>
            <span class="text-[10px] text-muted-fg/40 font-mono tracking-tight">Inter</span>
          </div>
        </a>
        <!-- Option B and C follow the same card pattern with different direction labels, palettes, tags, and fonts -->
      </div>
    </div>
    <!-- ===== Task 2 Section ===== -->
    <div class="mb-12">
      <span class="text-xs font-mono text-muted-fg tracking-wider">TASK 2</span>
      <h2 class="text-xl font-bold text-foreground mt-1 mb-6">Dashboard</h2>
      <div class="flex flex-wrap gap-6">
        <!-- 2-3 option cards per task -->
      </div>
    </div>
  </div>
  <footer class="border-t border-foreground/10 py-4 px-8 text-center">
    <p class="text-xs text-muted-fg">
      Mockup Skill by <a href="https://olisemeka.dev" target="_blank" rel="noopener noreferrer" class="text-foreground/60 hover:text-foreground transition-colors underline underline-offset-2">Olisemeka</a>
    </p>
  </footer>
</div>
```

**Card anatomy (top to bottom):**
1. Top row: "OPTION X" label on left, two palette color dots on right (accent + background)
2. Direction name in bold
3. Description — what the design actually looks like and what product problem it is trying to solve
4. Structural tags — 2-4 compact tags showing nav type, hero type, content layout, footer type (from the pre-flight Structure field)
5. Font pairing in tiny muted text at the bottom

- No `rounded-*` on gallery containers — keep them square
- No layout preview diagrams, no flourishes
- Cards use `flex-1 min-w-[260px]` so they stay in one row (wrapping only when screen is too narrow)
- Multiple tasks = multiple sections, never merge into one flat grid
- Palette dots must use actual colors from the option's palette

Footer with credit is required on every gallery page.

---

## Individual Design Pages

Each option (option-a.html, option-b.html, etc.) is a standalone HTML file showing what the user asked for — a full website, a dashboard, a component, whatever fits the task.

These pages must be **task-derived, not deterministic**. The skill should not reuse a preferred skeleton, a default hero recipe, a fixed section order, or a recurring style pack just because it worked previously.

Before writing each page, the agent should be able to state internally:

- what this option is trying to make easier for the user
- what it is intentionally not optimizing for
- why this structure is specific to this task
- what would make this option feel fake or AI-generated, so it can avoid that failure mode

**What to include:**
- Complete HTML document with Tailwind CDN + palette + fonts
- Real data relevant to the project (parish names, metrics, real numbers)
- Real images via `/placeholder/` endpoint — use contextually relevant keywords that match the subject matter (e.g., `/classroom`, `/school`, `/graduation` for education, `/louisiana` for geographic context). Image treatment should support the option's design driver instead of a canned style label.
- Interactive elements where meaningful (buttons, selects, toggles)
- Real maps (`/map`) or charts (`/chart`) when the design calls for geographic or statistical data

**What NOT to include (minimal polish):**
- No scroll-reveal animations
- No loading skeletons or empty states
- No custom `::selection` / scrollbar / focus-visible styling
- No elaborate hover effects — basic color shifts on interactive elements only
- No edge cases (long names, zero values, error states)

The design should look clean and presentable, not production-polished. Speed over perfection, but never at the cost of reverting to a generic website template.

---

## Server Endpoints

### Real Images — `/placeholder/<W>x<H>[/keyword]`

Real photographic images, no API key needed. Keyword makes the image deterministic:
```html
<img src="/placeholder/800x400/classroom" alt="classroom" class="w-full">
```
Any noun as keyword works (school, teacher, graduation, louisiana, map, chart).

### Interactive Map — `/map?lat=&lng=&zoom=&markers=`

Leaflet + OpenStreetMap (free, no API key):
```html
<iframe src="/map?lat=30.45&lng=-91.14&zoom=9&markers=30.45,-91.14,Baton+Rouge;29.95,-90.07,New+Orleans"
        class="w-full h-[400px] rounded-lg border-0"></iframe>
```

### Chart — `/chart?type=&labels=&data=&series=&title=`

Chart.js (free, no API key). Types: bar, line, radar, doughnut, polarArea, pie.
```html
<iframe src="/chart?type=line&labels=2020,2021,2022,2023,2024&data=82,85,88,91,94&title=Graduation+Rate"
        class="w-full h-[300px] rounded-lg border-0"></iframe>
```

### Components CSS — `/components.css`

Adds stat, sparkline, progress, status-dot, skeleton, empty-state, tag, toggle, timeline, data-row, donut, kbd CSS classes:
```html
<link rel="stylesheet" href="/components.css">
```

### Event Tracking

Server injects `mockup-tracker.js` automatically. Elements with `data-choice` capture clicks for the terminal to read user selections.

---

## Harness-Aware Execution

If the harness supports subagents, use them when they improve speed or separation of concerns.

Good uses for subagents:

- read-only exploration of an existing codebase or current UI
- parallel generation of independent option pages after the main agent has already fixed the design brief and product thesis for each option
- targeted review of whether an option looks generic, repetitive, or inconsistent with the chosen direction

Do not use subagents as an excuse to avoid design judgment. The main agent should still own:

- the design brief
- the option theses
- the final evaluator pass
- the gallery page
- the user-facing synthesis of tradeoffs

If the harness does not support subagents, continue with a single-agent workflow. Do not make the skill depend on them.

---

## Flow

1. **Check for skill updates when possible** — if the local install is a git checkout of `https://github.com/OliseNS/mockup.git`, compare it to upstream. If it is behind, ask the user whether they want to update before continuing. Never auto-update.
2. `node server.mjs` — start server (must be first)
3. **Understand the task** — create an internal design brief covering surface, purpose, audience, constraints, and success criteria.
4. **Explore before redesigning** — if the request targets an existing codebase or screen, inspect the current UI deeply enough to explain the layout, hierarchy, component patterns, and weaknesses before designing.
5. **Decide whether questions are necessary** — if a missing answer will materially change the mockup and cannot be inferred, ask a concise high-value question with the ask-questions tool. Otherwise, do not ask.
6. **Design internally** — decide on 2-3 strong options using the Design Rules and the Design Quality Standard. Default to 2 options unless the task clearly benefits from a third. Base each option on a different product thesis, not a different coat of paint. Do not ask the user to invent the design direction for you.
7. **Build gallery** — write `index.html` with all task sections and option cards. Keep this page deterministic.
8. **Build design pages** — write each option HTML page (option-a.html, option-b.html, etc.). These pages should vary with the task and must not inherit a default template. If subagents are available, they may build independent option pages in parallel after the main agent has fixed the brief and option theses.
9. **Run an internal evaluator pass** — check each option against the brief, the anti-generic rules, and the question "would this still make sense if a human designer had to defend it in a critique?" Rework weak options before showing them.
10. **Print URL** in chat — `http://localhost:XXXX`. Do NOT open the browser or DevTools.
11. **Let the user react** — wait for them to review the options and give feedback. Use the ask-questions tool only when it helps the user compare or choose between concrete mockups.

---

## After the User Picks

When the user selects an option (e.g., "I like A"), the implementation agent should open the chosen HTML file to see the design, then implement it using the project's own tech stack (React/shadcn components, etc.). The mockup skill's job ends at helping the user envision and choose — no translation to framework code needed here.

If the implementation stack uses shadcn, do not settle for the default card-plus-button look. Reach for strong component sources when they fit the chosen direction, including polished libraries like Magic UI and other high-quality shadcn-compatible components.

Use that guidance carefully:

- choose components that support the selected design, not components that fight it
- prefer a small number of distinctive, well-integrated components over dumping a library into the page
- adapt spacing, typography, motion, borders, and surfaces so the final UI feels designed, not assembled from defaults
- keep interaction quality high, but do not add flashy components that make the result look more AI-generated

If subagents are available during implementation, they can help with independent build slices, but the main implementation agent should still own final composition and consistency.
