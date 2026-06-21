export default defineNitroPlugin(async () => {
  try {
    await prisma.$queryRaw`PRAGMA journal_mode=WAL`;
  } catch {
    // Database may not be reachable yet
  }
});
