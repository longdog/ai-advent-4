console.log("Start")
Bun.serve({
  port: 5555,
  fetch(req) {
    return new Response("ok")
  }
})
