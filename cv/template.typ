// Shared CV template — typefaces and palette mirror the site (hafst1.is).
// Used by cv/short.typ and cv/long.typ.
//
// All colours are imported from theme.typ — edit that file to reskin.

#import "theme.typ": *

// --- Font stacks (static files shipped in cv/fonts/) ----------------------
// The site's three faces: Newsreader for the name, section titles and the
// lede; IBM Plex Sans for running text; IBM Plex Mono for dates and labels.
// "Newsreader Display" is the light, large-optical-size cut used only for
// the name. The files are static instances cut from the OFL variable fonts
// (Typst does not handle variable fonts reliably).
#let font-serif = ("Newsreader", "Georgia")
#let font-display = ("Newsreader Display", "Newsreader", "Georgia")
#let font-sans = ("IBM Plex Sans", "Helvetica Neue", "Helvetica", "Arial")
#let font-mono = ("IBM Plex Mono", "Menlo", "Courier New")

// --- Helpers ---

#let _range(start, end) = {
  let s = str(start)
  if end == "present" or end == none {
    s + "–present"
  } else if str(end) == s {
    s
  } else {
    s + "–" + str(end)
  }
}

// Numbered editorial section heading, mirroring the site's SectionHeading:
// mono index, serif title, hairline rule underneath.
#let _section = counter("cv-section")
#let section-title(title) = {
  _section.step()
  v(1.15em, weak: true)
  block(below: 0.6em, breakable: false, sticky: true)[
    #grid(
      columns: (auto, 1fr),
      column-gutter: 0.4cm,
      align: (left + bottom, left + bottom),
      text(size: 7.5pt, fill: primary, font: font-mono)[
        #context _section.display("01")
      ],
      text(size: 13pt, weight: "medium", fill: ink, font: font-serif)[
        #title
      ],
    )
    #v(0.2em)
    #line(length: 100%, stroke: 0.4pt + rule)
  ]
}

// Serif-italic lede paragraph (research statement on the long CV).
#let lede(body) = {
  block(below: 0.8em)[
    #set par(leading: 0.6em)
    #text(font: font-serif, style: "italic", size: 11pt, fill: ink)[#body]
  ]
}

#let entry(date, body) = {
  block(below: 0.42em, breakable: false)[
    #grid(
      columns: (2.45cm, 1fr),
      column-gutter: 0.45cm,
      align: (left + top, left + top),
      // Nudged down so the smaller mono sits on the body text's baseline.
      pad(top: 0.09em, text(size: 7.75pt, fill: date-fill, font: font-mono)[#date]),
      body,
    )
  ]
}

#let plain-entry(body) = {
  block(below: 0.5em, breakable: false)[#body]
}

// Small coloured pill used in date columns when we want a label instead of a
// date (course levels, project statuses, talk types).
#let pill(label, fill: muted) = {
  text(
    size: 7.75pt,
    weight: "medium",
    fill: fill,
    font: font-mono,
  )[#label]
}

// Render an MSc alumnus' nowAt line. When the destination contains "PhD" we
// flag it visually with a coloured arrow + accent fill so it pops in the
// "Master's theses completed" list.
#let now-at(nowAt) = {
  if nowAt == none { return }
  let is-phd = nowAt.contains("PhD") or nowAt.contains("doctoral") or nowAt.contains("Doctoral")
  if is-phd {
    text(fill: phd-track-fill, weight: "medium")[ → #nowAt]
  } else {
    text(fill: muted)[ · #nowAt]
  }
}

// --- Page setup wrapper ---

#let cv-doc(
  contact: none,
  title: "Curriculum Vitae",
  body
) = {
  set document(title: contact.name + " — " + title, author: contact.name)
  set page(
    paper: "a4",
    margin: (x: 2cm, top: 1.5cm, bottom: 1.35cm),
    footer: context [
      #line(length: 100%, stroke: 0.4pt + rule)
      #v(0.35em)
      #set text(size: 7pt, fill: muted, font: font-mono)
      #grid(
        columns: (1fr, auto),
        [#contact.name · #link(contact.website)[#contact.website.replace("https://", "")]],
        [#counter(page).display() / #context counter(page).final().first()],
      )
    ],
  )
  set text(
    font: font-sans,
    size: 9.25pt,
    fill: ink,
    lang: "en",
  )
  set par(leading: 0.56em, justify: false)

  // Use a `set` rule so the link element survives and its URI annotation
  // is preserved in the PDF — replacing `it` with plain text would strip
  // the annotation and leave only coloured non-clickable text.
  show link: set text(fill: primary)
  show strong: it => text(weight: "semibold", fill: ink)[#it.body]
  show emph: it => text(style: "italic", fill: ink)[#it.body]

  // --- Masthead: mono eyebrow, serif display name left, contact stack
  //     right, closed by an editorial double rule. ---
  block(below: 0.7em)[
    #text(size: 7pt, fill: muted, tracking: 1.6pt, font: font-mono)[
      #upper(title)
    ]
  ]
  grid(
    columns: (1fr, auto),
    column-gutter: 1cm,
    align: (left + bottom, right + bottom),
    text(
      size: 31pt,
      fill: ink,
      font: font-display,
      tracking: -0.5pt,
    )[#contact.name],
    text(size: 7.5pt, fill: muted, font: font-mono)[
      #set par(leading: 0.7em)
      #link("mailto:" + contact.email)[#contact.email] \
      ORCID #link("https://orcid.org/" + contact.orcid)[#contact.orcid] \
      #link(contact.scholar)[Google Scholar] · #link(contact.github)[GitHub] \
      #link(contact.website)[#contact.website.replace("https://", "").trim("/")]
    ],
  )
  v(0.75em)
  line(length: 100%, stroke: 0.8pt + ink)

  body
}

// --- Citation formatting helpers ---

// A publication. `display_authors` is prepared by scripts/generate-cv.ts
// with the same function the site uses (src/lib/format-authors.ts): long
// author lists are shortened and the CV owner is flagged with `me`, which
// we set semibold in the self-name-fill colour so the reader can spot
// Hafsteinn at a glance.
#let format-pub(pub) = {
  let authors = pub.display_authors.map(a => {
    // No-break spaces, so a name never splits from its initials at a line end.
    let name = a.text.replace(" ", "\u{a0}")
    if a.me { text(weight: "semibold", fill: self-name-fill)[#name] } else { name }
  }).join(", ")
  let year-text = if pub.year == 0 { "n.d." } else { str(pub.year) }
  [#authors (#year-text). #strong[#pub.title]. #if pub.venue != "" [_#pub.venue._]]
}

// --- Badge helpers exposed to long.typ / short.typ ---

#let course-level-label(level) = {
  if level == "bsc" {
    pill("BSc", fill: badge-bsc)
  } else if level == "msc" {
    pill("MSc", fill: badge-msc)
  } else if level == "phd" {
    pill("PhD", fill: badge-phd)
  } else if level == "mixed" {
    pill("BSc / MSc", fill: badge-mixed)
  } else {
    pill(upper(level), fill: muted)
  }
}

#let project-status-label(status) = {
  let fill = if status == "active" { status-active }
             else if status == "maintenance" { status-maintenance }
             else if status == "archived" { status-archived }
             else { muted }
  pill(status, fill: fill)
}

#let talk-type-label(t) = {
  let fill = if t == "invited" { type-invited }
             else if t == "keynote" { type-keynote }
             else if t == "workshop" { type-workshop }
             else if t == "outreach" { type-outreach }
             else { muted }
  pill(t, fill: fill)
}
