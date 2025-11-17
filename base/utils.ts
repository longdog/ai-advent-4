// fix model for langchain 1 support
export const modelFix = (model: any) => {
  if (!model.bind) {
    model.bind = function (params: any) {
      return Object.assign(
        Object.create(Object.getPrototypeOf(this)),
        this,
        params,
      )
    }
  }
  return model
}
