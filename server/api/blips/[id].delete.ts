export default defineEventHandler(async (event) => {
  const { id } = await requireBlip(event);
  return ok(await archiveBlip(id));
});
