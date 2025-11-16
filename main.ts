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

  // Simple landing page for the root URL so it doesn't show "Not Found"
  if (req.method === "GET" && url.pathname === "/") {
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>base64-to-mp3 API</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:#0f172a; color:#e5e7eb; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; }
      .card { background:#020617; padding:2.5rem 2rem; border-radius:1rem; box-shadow:0 20px 40px rgba(15,23,42,0.7); max-width:480px; width:100%; border:1px solid #1f2937; }
      h1 { margin-top:0; margin-bottom:0.75rem; font-size:1.75rem; color:#f9fafb; }
      p { margin:0.35rem 0; color:#9ca3af; font-size:0.95rem; }
      code { background:#020617; padding:0.2rem 0.4rem; border-radius:0.25rem; font-size:0.85rem; border:1px solid #1f2937; }
      .endpoint { margin-top:1.25rem; padding-top:1rem; border-top:1px solid #1f2937; }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>base64-to-mp3 API</h1>
      <p>This service exposes a single endpoint:</p>
      <div class="endpoint">
        <p><code>POST /convert-mp3</code></p>
        <p>Body (JSON):</p>
        <p><code>{"base64Data": "&lt;base64-encoded-mp3&gt;", "filename": "optional.mp3"}</code></p>
      </div>
      <p style="margin-top:1.25rem;">You are seeing this page because you opened the base URL in a browser.</p>
    </main>
  </body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

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


