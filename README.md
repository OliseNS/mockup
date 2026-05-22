# Mockup Skill

Mockup is a design exploration skill for building local, interactive UI mockups before implementation. It is meant for moments when a user needs to see and compare strong visual directions, not just talk about them.

The skill is optimized for two kinds of work:

- Creating new UI concepts quickly with enough polish to make design decisions.
- Redesigning an existing interface after first understanding how the current UI is structured, what is working, and what needs to improve.

## What The Skill Does

The skill guides an agent to:

- build mockups on localhost using simple standalone HTML files
- generate multiple distinct design directions instead of small visual variations
- explore the current UI deeply before redesigning an existing surface
- ask clarifying questions only when they are truly necessary
- help the user compare options and react to concrete designs

This is not a code-generation framework. Its job is to help users explore and choose a direction before implementation.

## Core Principles

### 1. Design Intelligence First

The skill should not blindly start drawing screens. It first forms an internal design brief:

- what is being designed
- why it matters
- who it is for
- what constraints exist
- what would make the result meaningfully better

### 2. Explore Before Redesigning

If the work is happening inside an existing codebase, the skill should inspect the current UI before producing concepts. That includes both:

- implementation structure: routes, layout wrappers, components, styling primitives, reusable patterns
- rendered structure: hierarchy, density, alignment, spacing rhythm, CTA placement, navigation, and weak points

The redesign should respond to the actual product and its constraints, not overwrite them blindly.

### 3. Show, Don’t Outsource

The skill should not ask the user to invent the design direction for it. It should use mockups to answer design questions whenever possible.

Questions are only appropriate when the answer will materially change the work and cannot be inferred from the prompt or exploration.

### 4. Better Than Generic AI Design

The quality bar is not just “different.” Every option should be judged on:

- purpose fit
- visual hierarchy
- composition and rhythm
- content clarity
- interaction logic
- distinctiveness
- awareness of the existing design system when redesigning

## How The Workflow Works

1. Start the local preview server.
2. Create an internal design brief.
3. If redesigning an existing UI, inspect the current implementation and layout deeply.
4. Ask a concise question only if a real blocker remains.
5. Build 2 to 4 strong design directions.
6. Present the mockups through a local gallery so the user can compare and react.

## Local Development

Start the server from the repository root:

```bash
node server.mjs
```

The server provides:

- local HTML preview pages
- live reload support
- event tracking for mockup selection
- utility endpoints for images, maps, charts, and base styles

By default, mockup session files are written under `/tmp/mockup-*/`.

## Repository Structure

- [SKILL.md](SKILL.md): the skill definition and behavioral instructions
- [server.mjs](server.mjs): the local preview server used to host mockups
- [design-system/base.css](design-system/base.css): shared design-system CSS used by previews

## Intended Outcome

The skill should help a user move from vague intent to concrete design direction with less guesswork, better visual quality, and more grounded redesign decisions.