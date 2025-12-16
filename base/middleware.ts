import { createMiddleware } from "langchain"

export const modelMonitoringMiddleware = createMiddleware({
  name: "ModelMonitoringMiddleware",
  wrapModelCall: (request, handler) => {
    console.log(`Executing model: ${request}`)
    try {
      const result = handler(request)
      console.log("Model completed successfully")
      return result
    } catch (e) {
      console.log(`Model failed: ${e}`)
      throw e
    }
  },
})

export const toolMonitoringMiddleware = createMiddleware({
  name: "ToolMonitoringMiddleware",
  wrapToolCall: (request, handler) => {
    console.log(`Executing tool: ${request.toolCall.name}`)
    console.log(`Arguments: ${JSON.stringify(request.toolCall.args)}`)
    try {
      const result = handler(request)
      console.log("Tool completed successfully")
      return result
    } catch (e) {
      console.log(`Tool failed: ${e}`)
      throw e
    }
  },
})

export const loggingMiddleware = createMiddleware({
  name: "LoggingMiddleware",
  beforeModel: state => {
    console.log(`BEFORE----------`)
    console.log(state)
    return
  },
  afterModel: state => {
    console.log(`AFTER----------`)
    console.log(state)
    return
  },

  beforeAgent: state => {
    console.log(`BEFORE AGENT----------`)
    console.log(state)
    return
  },
  afterAgent: state => {
    console.log(`AFTER AGENT----------`)
    console.log(state)
    return
  },
})
