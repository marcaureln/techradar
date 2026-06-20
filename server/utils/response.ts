export const ok = <T>(data: T) => ({ data })

export const fail = (error: string, status = 400) => {
  throw createError({ statusCode: status, message: error })
}