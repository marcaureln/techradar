export default defineEventHandler(async (event) => {
  const method = event.method;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return;

  const path = event.path;
  if (!path.startsWith('/api/blips') && !path.startsWith('/api/settings')) return;

  if (!(await canEdit(event))) fail('Editing requires authentication', 403);
});
