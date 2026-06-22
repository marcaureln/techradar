export const ok = <T>(data: T) => ({ data });

export function fail(error: string, status = 400): never {
  throw createError({ statusCode: status, message: error });
}
