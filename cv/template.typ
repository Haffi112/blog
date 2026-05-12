// Shared CV template — styling mirrors haffi112.github.io.
// Used by cv/short.typ and cv/long.typ.

// Brand palette (matches src/styles/global.css)
#let primary = rgb("#5B3A78")        // aubergine
#let primary-soft = rgb("#F2EBF9")
#let secondary = rgb("#8E5E0F")      // gold
#let energy = rgb("#A84A1F")         // burnt orange
#let ink = rgb("#1A1418")
#let muted = rgb("#5A5560")
#let rule = rgb("#E8E4E2")

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
      text(size: 9pt, fill: muted, font: ("JetBrains Mono", "Menlo", "Courier New"))[#date],
      body,
    )
  ]
}

#let plain-entry(body) = {
  block(below: 0.5em, breakable: false)[#body]
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

  show link: it => {
    text(fill: primary)[#it.body]
  }
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

#let _bold-self(a, last-name: "Einarsson", first-initial: "H") = {
  let initials = if a.first == "" {
    ""
  } else {
    a.first.split(regex(" +")).filter(s => s.len() > 0).map(p => p.first() + ".").join(" ")
  }
  let formatted = if initials == "" { a.last } else { a.last + ", " + initials }
  if a.last == last-name and (a.first == "" or a.first.starts-with(first-initial)) {
    strong[#formatted]
  } else {
    formatted
  }
}

#let format-pub(pub) = {
  let authors = pub.authors.map(a => _bold-self(a)).join(", ")
  let year-text = if pub.year == 0 { "n.d." } else { str(pub.year) }
  [#authors (#year-text). #strong[#pub.title]. _#pub.venue._]
}
