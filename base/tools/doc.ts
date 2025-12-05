import { $ } from "bun"

export async function saveText(name: string, text: string) {
  const file = Bun.file(`./book/${name}`)
  await file.write(text)
}
export async function saveDocx(name: string) {
  await $`pandoc ./book/${name} -o ./book/${name.replace(
    ".md",
    "",
  )}.docx --metadata=lang=ru-RU`
}

if (import.meta.main) {
  saveDocx("book.md")
}
