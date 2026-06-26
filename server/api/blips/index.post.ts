import { createBlipSchema } from '#shared/validations/blip';

export default defineEventHandler(async (event) => {
  const data = await validateBody(event, createBlipSchema);
  return ok(await createBlip(data));
});
