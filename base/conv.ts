import genres from "./genres.json"

const parsed = genres.flatMap(g => g.options.map(o => o.label)).join("\n\n")
console.log(parsed)
