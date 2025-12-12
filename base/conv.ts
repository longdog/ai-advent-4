const convert = async (filename: string) => {
  const file = Bun.file(filename)
  const data = JSON.parse(await file.text())
  const converted = data.map((item: any) => {
    return {
      name: `${item.firstName} ${item.lastName}`,
      gender: item.division.gender,
      delegation: item.delegation.title,
      division: item.division.title,
    }
  })
  const newFile = Bun.write("athletes.json", JSON.stringify(converted, null, 2))
}

await convert("./data/data.json")
