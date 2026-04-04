# Site Clone Agent — Complete Instructions

## Core Philosophy

The system operates as a **construction foreman model**: extraction and building overlap, but extraction must be exhaustive and produce auditable artifacts before any component work begins. The mandate is simple: "Extraction and construction overlap, but extraction is meticulous and produces auditable artifacts."

## Critical Sequencing

**Stage 1 (Survey)** precedes all building:
- Browser automation mandatory — no execution without MCP control
- Full-page screenshots at desktop (1440px) and mobile (390px)
- Mandatory interaction sweep: scroll, button clicks, tab states, carousels, dropdowns, accordions, modals, hover effects, scroll triggers
- Responsive testing at three widths
- Page topology mapping with interaction drivers identified

**Stage 2 (Foundation)** is strictly sequential:
- Font configuration and global CSS with design tokens
- TypeScript interfaces for content structures
- SVG icon extraction and deduplication
- Lazy-content triggering via scrolling
- Comprehensive asset discovery and local downloading (never reference external CDNs)
- Verification that `npm run build` passes

**Stage 3 (Blueprint & Build)** enables parallelization:
- Extract each section completely
- Write blueprint files with exact CSS values
- Dispatch builder agents to parallel worktrees
- Merge and verify after each builder completes

**Stage 4 (Assembly)** wires everything in `page.tsx`.

**Stage 5 (Fidelity Check)** compares original vs. clone across viewports and interaction states.

## The 21 Anti-Patterns (Lessons From Failures)

Key recurring mistakes that cause complete rebuilds:

1. **Interaction driver confusion** — determining click vs. scroll incorrectly requires full reconstruction
2. **Single-state extraction** — capturing only default states while tabs/carousels contain multiple content variations
3. **Missing layered assets** — background gradients, overlays, and floating elements are separate images
4. **CSS approximation** — "looks like 16px" when computed is 18px breaks pixel-perfect requirement
5. **Interactive element logic gaps** — buttons with no hrefs, modals unclosed before next extraction
6. **Incomplete carousel capture** — only visible slides instead of all slides (requires scrolling through each one)
7. **Lazy-image negligence** — asset discovery before full-page scroll misses deferred images
8. **Tab extraction timing errors** — insufficient wait after click (need 1200ms+ for Vue/React transitions)
9. **Dropdown menu skipping** — mega-menus contain valuable structure; every nav item must be clicked
10. **Responsive testing gaps** — desktop-only inspection breaks tablet/mobile layouts
11. **Smooth scroll library omission** — Lenis/Locomotive Scroll detection crucial; browser default feels wrong
12. **Builder scope overload** — prompts over ~150 lines indicate section too complex; must split
13. **External doc references** — builders receive all CSS inline, never "see DESIGN_TOKENS.md"
14. **Video/Lottie assumption errors** — elaborate HTML mockups for what is actually `<video>` or canvas
15. **CDN auth token stripping** — removing query params from URLs breaks downloads (preserve full URLs)
16. **Footer omission** — footer is mandatory in topology and extraction
17. **Locale/language version confusion** — confirm which regional version to clone before starting
18. **External CDN URLs in components** — all media must be downloaded locally; use `fetch` not `curl`
19. **Missing video container backgrounds** — invisible video elements break layout perception during load
20. **curl over fetch for CDN assets** — Node.js `fetch` handles CDN redirects/TLS better than `curl`
21. **Builder scope without complexity split** — if prompt length exceeds threshold, section needs decomposition

## Critical Extraction Techniques

**Deep CSS extraction script** — grabs all computed properties (fontSize, color, display, transform, transition, etc.) for every element and pseudo-element (::before, ::after). Captures exact values, not approximations.

**Interactive state capture** — click each tab/button via MCP, wait 1200ms for transitions, extract content and CSS for each state. Carousel extraction requires scrolling through ALL slides.

**Asset discovery protocol** — identifies images, videos, background-images, pseudo-element backgrounds, SVGs, fonts, favicons. Ensures no overlays are missed by inspecting DOM tree comprehensively.

**Lazy-load triggering** — scrolls entire page at `window.innerHeight / 2` intervals (400ms between steps) to force lazy-loaded content to load before asset discovery.

**Responsive mapping** — tests at 1440px, 768px, 390px; documents layout changes and approximate breakpoints.

## Blueprint Contract Model

Every component receives a blueprint file before building begins. Blueprints contain:
- DOM structure (element hierarchy)
- Computed styles (exact CSS values from `getComputedStyle()`)
- Interactive elements (buttons, tabs, carousels with full specs)
- State transitions (trigger, before/after CSS, animation timing)
- Per-state content (for tabs/modals: text, images, links per state)
- Assets (image paths, icon references)
- Responsive behavior (layout changes per breakpoint)
- Verbatim text content from live site

Builders receive blueprint contents inline in their prompts; no external file reads.

## Asset Management Non-Negotiables

1. **Download ALL media locally** — images to `public/images/`, videos to `public/videos/`, fonts to `public/fonts/`
2. **Use Node.js fetch, not curl** — CDNs often reject curl; fetch handles redirects and TLS reliably
3. **Preserve CDN query strings during download** — auth tokens embedded in URLs; strip only for local filename
4. **Reference local paths in components** — `/videos/demo.mp4`, not `https://cdn.example.com/...`
5. **Add placeholder backgrounds to video containers** — `bg-white/5` or similar so layout doesn't break during load

## Experience Accumulation Protocol

After each clone and user feedback:
- Identify reusable patterns from discrepancies
- Update anti-patterns section if new mistakes discovered
- Append findings to `docs/research/CLONE_EXPERIENCE.md`
- Read experience log before next clone to avoid repetition

---

**Status:** Ready to reverse-engineer and rebuild. Awaiting target URL(s) and browser MCP confirmation.
