// CV theme tokens — single source of truth for colours and accent decisions.
// Edit this file to reskin both cv/short.typ and cv/long.typ.
//
// Palette mirrors the site at src/styles/global.css (light mode). The site has
// a dark theme too; if you want a dark-mode CV, copy this file, flip the
// surface and ink tokens, and import the dark variant from short/long.typ.
//
// Naming convention:
//   - bg-*       : page background and elevated surfaces
//   - ink, muted : primary and secondary text
//   - rule       : dividers and faint lines
//   - primary    : warm rust, used for section titles, links, self-name
//   - secondary  : deep umber, used for dates and awards
//   - energy     : a hotter rust, used sparingly for emphasis
//   - badge-*    : semantic colours for course levels, project statuses, etc.
//
// These are the "quiet paper" values from the site redesign, kept as sRGB
// hex because Typst has no OKLCH literal — they are the exact colours the
// light theme in src/styles/global.css resolves to.

// --- Surfaces --------------------------------------------------------------
#let bg = rgb("#F7F5F0")             // paper
#let bg-elev = rgb("#F1EDE4")        // warmer raised surface

// --- Text ------------------------------------------------------------------
#let ink = rgb("#1C1A17")
#let muted = rgb("#67635D")          // ink at 62% over paper
#let rule = rgb("#E2DFD8")           // ink at 12% over paper

// --- Accents ---------------------------------------------------------------
#let primary = rgb("#B54C2B")        // warm rust — hsl(20 62% 44%)
#let primary-soft = rgb("#F6E9E1")   // pale rust wash
#let secondary = rgb("#54453A")      // deep umber
#let secondary-soft = rgb("#EDE7E0") // pale umber wash
#let energy = rgb("#A54527")         // hotter rust
#let energy-soft = rgb("#F7E7DE")    // pale rust wash

// --- Semantic tints -------------------------------------------------------
// Date column in entry(), and year ranges in awards.
#let date-fill = secondary

// Self-name highlight in the publications list (overrides bold ink fill).
#let self-name-fill = primary

// "→ PhD at X" marker on MSc alumni who went on to a doctorate.
#let phd-track-fill = energy

// Course level badges (BSc / MSc / PhD / mixed).
#let badge-bsc = secondary
#let badge-msc = primary
#let badge-phd = energy
#let badge-mixed = muted

// Project status badges.
#let status-active = primary
#let status-maintenance = secondary
#let status-archived = muted

// Talk type badges (invited / keynote / workshop / outreach).
#let type-invited = primary
#let type-keynote = energy
#let type-workshop = secondary
#let type-outreach = muted
