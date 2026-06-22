import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

// Read-only MCP endpoint over Streamable HTTP, stateless: a fresh server +
// transport per request. No auth — secured at the proxy layer like the rest.
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const server = buildMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  event.node.res.on('close', () => {
    transport.close();
    server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(event.node.req, event.node.res, body);
});
