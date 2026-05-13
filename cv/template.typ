// Shared CV template — styling mirrors haffi112.github.io.
// Used by cv/short.typ and cv/long.typ.
//
// All colours are imported from theme.typ — edit that file to reskin.

#import "theme.typ": *

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

#let section-title(title) = {
  v(1.2em, weak: true)
  block(below: 0.7em, breakable: false)[
    #text(size: 9.5pt, weight: "semibold", fill: primary, tracking: 1.2pt)[
      #upper(title)
    ]
    #v(-0.2em)
    #line(length: 100%, stroke: 0.4pt + rule)
  ]
}

#let entry(date, body) = {
  block(below: 0.5em, breakable: false)[
    #grid(
      columns: (3.2cm, 1fr),
      column-gutter: 0.55cm,
      align: (left + top, left + top),
      text(size: 9pt, fill: date-fill, font: ("JetBrains Mono", "Menlo", "Courier New"))[#date],
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
    size: 8.5pt,
    weight: "medium",
    fill: fill,
    font: ("JetBrains Mono", "Menlo", "Courier New"),
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
    margin: (x: 2cm, top: 1.8cm, bottom: 1.5cm),
    footer: context [
      #set text(size: 8pt, fill: muted)
      #grid(
        columns: (1fr, auto),
        [#contact.name · #link(contact.website)[#contact.website.replace("https://", "")]],
        [#counter(page).display() / #context counter(page).final().first()],
      )
    ],
  )
  set text(
    font: ("Inter", "Helvetica Neue", "Helvetica", "Arial"),
    size: 10pt,
    fill: ink,
    lang: "en",
  )
  set par(leading: 0.55em, justify: false)

  // Use a `set` rule so the link element survives and its URI annotation
  // is preserved in the PDF — replacing `it` with plain text would strip
  // the annotation and leave only coloured non-clickable text.
  show link: set text(fill: primary)
  show strong: it => text(weight: "semibold", fill: ink)[#it.body]
  show emph: it => text(style: "italic", fill: ink)[#it.body]

  // Header
  block(below: 0.4em)[
    #text(size: 22pt, weight: "semibold", fill: ink, tracking: -0.4pt)[#contact.name]
  ]
  block(below: 0.4em)[
    #text(size: 11pt, fill: muted)[#title]
  ]
  block(below: 0.6em)[
    #text(size: 8.5pt, fill: muted)[
      #link("mailto:" + contact.email)[#contact.email]
      #h(0.5em) · #h(0.5em)
      ORCID #link("https://orcid.org/" + contact.orcid)[#contact.orcid]
      #h(0.5em) · #h(0.5em)
      #link(contact.scholar)[Scholar]
      #h(0.5em) · #h(0.5em)
      #link(contact.website)[#contact.website.replace("https://", "")]
    ]
  ]
  line(length: 100%, stroke: 0.5pt + rule)

  body
}

// --- Citation formatting helpers ---

#let _format-author(a) = {
  let initials = if a.first == "" {
    ""
  } else {
    a.first.split(regex(" +")).filter(s => s.len() > 0).map(p => p.first() + ".").join(" ")
  }
  if initials == "" {
    a.last
  } else {
    a.last + ", " + initials
  }
}

// Format an author. When the author is the CV owner (Einarsson, H. by default)
// we render the name semibold and in the self-name-fill colour so the reader
// can spot Hafsteinn at a glance in long author lists.
#let _bold-self(a, last-name: "Einarsson", first-initial: "H") = {
  let initials = if a.first == "" {
    ""
  } else {
    a.first.split(regex(" +")).filter(s => s.len() > 0).map(p => p.first() + ".").join(" ")
  }
  let formatted = if initials == "" { a.last } else { a.last + ", " + initials }
  if a.last == last-name and (a.first == "" or a.first.starts-with(first-initial)) {
    text(weight: "semibold", fill: self-name-fill)[#formatted]
  } else {
    formatted
  }
}

#let format-pub(pub) = {
  let authors = pub.authors.map(a => _bold-self(a)).join(", ")
  let year-text = if pub.year == 0 { "n.d." } else { str(pub.year) }
  [#authors (#year-text). #strong[#pub.title]. _#pub.venue._]
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
