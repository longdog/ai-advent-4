#!/usr/bin/env bun
import { $ } from "bun"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { generateVector } from "./embedings"
import { chatWithAgent, createChatClient } from "./llm"
import { createHelpPrompt } from "./prompts"

async function getGithubUrl() {
  const ret =
    await $`git config --get remote.origin.url | sed -E 's#^git@[^:]+:##; s#^https?://[^/]+/##; s#\.git$##'`
  return ret.text()
}

async function info(path: string, pr: string) {
  const github = await getGithubUrl()
  console.log("Github URL: ", github)
  console.log("Pull request: ", pr)
  const helpPrompt = createHelpPrompt(github, pr)
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
  .command(
    "review",
    "Review pull request",
    yargs => {
      return yargs.option("pr", {
        alias: "pull request",
        type: "string",
        describe: "pull request number",
      })
    },
    async args => {
      await info("./", args.pr!)
    },
  )
  .parse()
