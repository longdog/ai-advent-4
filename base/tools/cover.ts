import { $ } from "bun"

const author = "Даниил Берестов"

export async function createCover() {
  console.log("Создание обложки...")
  await $`magick -size 500x625 xc:black \
  \( ./book/input.jpg -resize 400x400 \) -gravity center -composite \
  -font "/usr/share/fonts/ttf/dejavu/DejaVuSans.ttf" \
  -pointsize 28 -fill white -gravity north -annotate +0+24 "${author}" \
  -gravity south -annotate +0+60 "$(cat ./book/title.md)" \
  ./book/cover.jpg`
  console.log("Обложка создана в book/cover.jpg")
}

if (import.meta.main) {
  createCover()
}
