#!/usr/bin/env bun
import { $ } from "bun"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { generateVector } from "./embedings"
import { chatWithAgent, createChatClient } from "./llm"
import { createHelpPrompt } from "./prompts"

async function getGithubUrl() {
  const ret =
    await $`git config --get remote.origin.url | sed -E 's#^git@([^:]+):#https://\1/#; s/\.git$//`
  return ret.text()
}

async function info(path: string) {
  const github = await getGithubUrl()
  const helpPrompt = createHelpPrompt(github)
  const client = await createChatClient(path)
  const result = await chatWithAgent(client, "1", helpPrompt)
  console.log(result)
}

console.log("PROJECT AI CLI")

yargs(hideBin(process.argv))
  .scriptName("cli")

  .command("init", "initialize project", async () => {
    await generateVector("./")
  })
  .command("info", "show info about project", async () => {
    await info("./")
  })
  .parse()
