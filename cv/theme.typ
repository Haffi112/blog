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
//   - primary    : aubergine, used for section titles, links, self-name
//   - secondary  : gold, used for dates and awards
//   - energy     : burnt orange, used sparingly for emphasis
//   - badge-*    : semantic colours for course levels, project statuses, etc.

// --- Surfaces --------------------------------------------------------------
#let bg = rgb("#FAFAF6")
#let bg-elev = rgb("#FFFFFF")

// --- Text ------------------------------------------------------------------
#let ink = rgb("#1A1418")
#let muted = rgb("#5A5560")
#let rule = rgb("#E8E4E2")

// --- Accents ---------------------------------------------------------------
#let primary = rgb("#5B3A78")        // aubergine
#let primary-soft = rgb("#F2EBF9")   // pale aubergine wash
#let secondary = rgb("#8E5E0F")      // gold
#let secondary-soft = rgb("#FBF2DF") // pale gold wash
#let energy = rgb("#A84A1F")         // burnt orange
#let energy-soft = rgb("#FBE8DC")    // pale orange wash

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
