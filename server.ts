import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readdir } from "fs/promises";
//Important: needs zod v3, not yet compatible with zod v4
//see also https://github.com/modelcontextprotocol/typescript-sdk/issues/1148
import z from "zod";

async function main() {
  const server = new McpServer({
    name: "my-mcp-server",
    version: "0.1.0",
  });

  server.registerTool(
    "add",
    {
      title: "Addition Tool",
      description: "Add two numbers",
      inputSchema: { a: z.number(), b: z.number() },
      outputSchema: { result: z.number() },
    },
    async ({ a, b }) => {
      const output = { result: a + b };
      return {
        content: [{ type: "text", text: JSON.stringify(output) }],
        structuredContent: output,
      };
    },
  );

  server.registerTool(
    "list-dir",
    {
      title: "List Directory",
      description: "List Directory",
      inputSchema: { path: z.string() },
      outputSchema: { entries: z.string().array() },
    },
    async ({ path }) => {
      const entries = await readdir(path);

      const output = { entries };

      return {
        content: [{ type: "text", text: JSON.stringify(output) }],
        structuredContent: output,
      };
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Server failed:", err);
  process.exit(1);
});
