// 2-page short CV
// Run: typst compile cv/short.typ public/cv.pdf
// Or via the project script: npm run cv

#import "template.typ": *
#import "data.typ": data

#cv-doc(
  contact: data.contact,
  title: "Curriculum Vitae",
)[

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
    *#e.degree*, #e.institution#if e.at("location", default: none) != none [, #e.location]
  ]
]

#section-title("Selected Publications")
#text(size: 8.5pt, fill: muted)[
  Full list at #link(data.contact.website + "publications/")[#data.contact.website.replace("https://", "")publications/].
  In NLP/ML venues, last author denotes the senior position.
]
#v(0.4em)
#for p in data.selected_pubs [
  #entry([#p.year])[
    #format-pub(p)
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
  *PhD students (main supervisor)*: #data.phd_main.map(s => s.name).join(", ")
]
#plain-entry[
  *PhD committee*: #data.phd_committee.map(s => s.name).join(", ")#if data.phd_committee_alumni_count > 0 [, plus #data.phd_committee_alumni_count completed]
]
#plain-entry[
  *Master's theses completed*: #data.alumni_msc_count since 2017, currently supervising #data.msc_current_count.
]

#section-title("Teaching")
#plain-entry[
  #data.teaching.map(t => {
    if t.at("years_short", default: "") != "" [#t.title (#t.years_short)] else [#t.title]
  }).join(", ").
  Roughly 300+ students per academic year across these courses.
]

#section-title("Service")
#plain-entry[
  *Recent reviewing*: #data.service.reviewing.slice(0, 5).map(r => r.venue).join(", ").
]
#for r in data.service.roles [
  #entry(_range(r.start, r.end))[
    *#r.role*, #r.organization#if r.at("note", default: none) != none [ — #r.note]
  ]
]

]
