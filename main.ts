// Deno Deploy-compatible HTTP server (no Express / Node-specific APIs needed)

// Helper to convert a base64 string to a Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

Deno.serve(async (req: Request): Promise<Response> => {
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname === "/convert-mp3") {
    try {
      const body = await req.json().catch(() => null);
      const base64Data = body?.base64Data;
      const filename = body?.filename;

      if (!base64Data || typeof base64Data !== "string") {
        return new Response(
          JSON.stringify({
            error: "Missing or invalid 'base64Data' in request body.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const safeFilename =
        typeof filename === "string" && filename.trim().length > 0
          ? filename.trim()
          : "output.mp3";

      const cleanedBase64 = base64Data.includes(",")
        ? base64Data.split(",").pop()!
        : base64Data;

      const bytes = base64ToUint8Array(cleanedBase64);

      const headers = new Headers({
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
      });

      // In Deno Deploy we typically don't write to disk; just stream back the bytes.
      return new Response(bytes, { status: 200, headers });
    } catch (err) {
      console.error("Error in /convert-mp3:", err);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // Simple 404 for other routes
  return new Response("Not Found", { status: 404 });
});


