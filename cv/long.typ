// Long CV with full publication list and detailed sections.
// Run: typst compile cv/long.typ public/cv-long.pdf
// Or via the project script: npm run cv

#import "template.typ": *
#import "data.typ": data

#cv-doc(
  contact: data.contact,
  title: "Curriculum Vitae (full)",
)[

#section-title("Research Statement")
#block(below: 0.6em)[
  #data.research_statement
]

#section-title("Current Positions")
#for p in data.current_positions [
  #entry(_range(p.start, p.end))[
    *#p.title*, #p.institution#if p.at("department", default: none) != none [, #p.department]#if p.at("location", default: none) != none [, #p.location]
  ]
]

#section-title("Previous Positions")
#for p in data.previous_positions [
  #entry(_range(p.start, p.end))[
    *#p.title*, #p.institution#if p.at("location", default: none) != none [, #p.location]
  ]
]

#section-title("Education")
#for e in data.education [
  #entry([#e.year])[
    *#e.degree*, #e.institution#if e.at("location", default: none) != none [, #e.location].
    #if e.at("thesis", default: none) != none [ \ _#e.thesis._]#if e.at("advisor", default: none) != none [ #text(fill: muted)[#e.advisor]]
  ]
]

#section-title("Awards and Grants")
#for a in data.awards [
  #entry(_range(a.year, a.at("end_year", default: a.year)))[
    *#a.title*#if a.at("description", default: none) != none [ — #a.description]#if a.at("funder", default: none) != none [ (#a.funder)]#if a.at("amount", default: none) != none [, #a.amount]
  ]
]

#section-title("Supervision")
#plain-entry[
  *PhD students (main supervisor)* — #data.phd_main.len()
]
#for s in data.phd_main [
  #entry([])[
    *#s.name*#if s.at("title", default: none) != none [ — #s.title]
  ]
]
#v(0.4em)
#plain-entry[
  *PhD committee* — #data.phd_committee.len()
]
#for s in data.phd_committee [
  #entry([])[
    *#s.name*#if s.at("title", default: none) != none [ — #s.title]
  ]
]
#v(0.4em)
#plain-entry[
  *Past PhD committees* — #data.phd_committee_alumni_count
]
#for s in data.phd_committee_alumni [
  #entry([#if s.at("endYear", default: none) != none [#str(s.endYear)] else [—]])[
    *#s.name*#if s.at("title", default: none) != none [ — #s.title]
  ]
]
#v(0.4em)
#plain-entry[
  *Master's theses completed* — #data.alumni_msc_count
]
#for s in data.alumni_msc [
  #entry([#str(s.endYear)])[
    *#s.name*#if s.at("title", default: none) != none [ — #s.title]#now-at(s.at("nowAt", default: none))
  ]
]
#v(0.4em)
#plain-entry[
  *Current master's students* — #data.msc_current_count
]
#for s in data.msc_current [
  #entry([])[
    *#s.name*#if s.at("title", default: none) != none [ — #s.title]
  ]
]

#section-title("Teaching")
#text(size: 8.5pt, fill: muted)[
  Roughly 300+ students per academic year across these courses.
]
#v(0.4em)
#for t in data.teaching [
  #entry(course-level-label(t.level))[
    *#t.title* — #t.description
    #if t.at("semesters", default: ()).len() > 0 [
       #text(fill: muted, size: 9pt)[_Taught:_ #t.semesters.join(", ").]
    ]
  ]
]

#section-title("Open-source Projects")
#for p in data.projects [
  #entry(project-status-label(p.status))[
    *#p.name* — #p.summary
  ]
]

#section-title("Talks and Outreach")
#for t in data.talks [
  #entry([#str(t.year)])[
    *#t.title*, #t.venue#if t.at("location", default: none) != none [, #t.location]#if t.at("type", default: none) != none [#h(0.4em)#talk-type-label(t.type)]
  ]
]

#section-title("Service")
#plain-entry[
  *Reviewing* (selected):
]
#for r in data.service.reviewing [
  #entry([#r.years])[
    #r.venue
  ]
]
#v(0.4em)
#plain-entry[
  *Roles*:
]
#for r in data.service.roles [
  #entry(_range(r.start, r.end))[
    *#r.role*, #r.organization#if r.at("note", default: none) != none [ — #r.note]#if r.at("link", default: none) != none [. #link(r.link)[#r.link]]
  ]
]

#section-title("Media Appearances")
#text(size: 8.5pt, fill: muted)[
  Selected interviews, opinion pieces and broadcast appearances on AI, language technology, and research. Titles are in Icelandic with English translations underneath. Linked entries open the original story.
]
#v(0.4em)
#for m in data.media_appearances [
  #entry([#m.date])[
    *#link(m.url)[#m.title_is]* \
    #text(fill: muted)[#emph[#m.title_en] · #m.outlet#if m.type != "article" [ · #m.type]]
  ]
]

#section-title("Collaborations")
#plain-entry[*Academic*]
#for c in data.collaborations.academic [
  - #c
]
#v(0.4em)
#plain-entry[*Industry / practice*]
#for c in data.collaborations.industry [
  - #c
]

#section-title("All Publications by Theme")

#for theme-section in data.publications_by_theme [
  #plain-entry[#strong[#theme-section.label]]
  #for p in theme-section.entries [
    #entry([#if p.year == 0 [n.d.] else [#p.year]])[
      #format-pub(p)
    ]
  ]
  #v(0.3em)
]

]
