import { updateBlipSchema } from '#shared/validations/blip';

export default defineEventHandler(async (event) => {
  const { id, existing } = await requireBlip(event);
  const data = await validateBody(event, updateBlipSchema);
  return ok(await updateBlip(id, existing.ring, data, await getCallerUsername(event)));
});
