export default defineEventHandler(async (event) => {
  const { id } = await requireBlip(event);
  const blip = await prisma.blip.update({ where: { id }, data: { isArchived: true } });
  return ok(blip);
});
