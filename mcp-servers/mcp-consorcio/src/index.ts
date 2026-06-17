import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { consorcioTools } from "./tools/consorcios.js";
import { unidadTools } from "./tools/unidades.js";
import { personaTools } from "./tools/personas.js";
import { expensaTools } from "./tools/expensas.js";
import { ticketTools } from "./tools/tickets.js";
import { proveedorTools } from "./tools/proveedores.js";

const server = new McpServer({
  name: "mcp-consorcio",
  version: "0.1.0",
});

const allTools = {
  ...consorcioTools,
  ...unidadTools,
  ...personaTools,
  ...expensaTools,
  ...ticketTools,
  ...proveedorTools,
};

for (const [name, tool] of Object.entries(allTools)) {
  server.tool(
    name,
    tool.description,
    tool.inputSchema.shape ?? {},
    async (args: Record<string, unknown>) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (tool as any).handler(args);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    }
  );
}

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("mcp-consorcio server running on stdio");
