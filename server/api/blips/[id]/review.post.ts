export default defineEventHandler(async (event) => {
  const { id, existing } = await requireBlip(event);
  return ok(await markReviewed(id, existing.ring, await getCallerUsername(event)));
});
