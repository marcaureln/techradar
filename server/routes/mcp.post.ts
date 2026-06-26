import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

// MCP endpoint over Streamable HTTP, stateless: a fresh server + transport per
// request. Read tools are open; write tools require a Bearer token (secure mode).
export default defineEventHandler(async (event) => {
  if (!(await mcpEnabled())) throw createError({ statusCode: 404 });

  const body = await readBody(event);
  const server = buildMcpServer({ canWrite: await mcpCanWrite(event) });
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  event.node.res.on('close', () => {
    transport.close();
    server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(event.node.req, event.node.res, body);
});
