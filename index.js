const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// Allow JSON bodies up to ~10MB (adjust as needed)
app.use(express.json({ limit: "10mb" }));

/**
 * POST /convert-mp3
 *
 * Body (JSON):
 * {
 *   "base64Data": "<base64-encoded-mp3>",
 *   "filename": "optional-file-name.mp3" // optional, defaults to "output.mp3"
 * }
 *
 * Behavior:
 * - Decodes the base64 string into an MP3 buffer.
 * - Writes it to a file on disk.
 * - Also streams the MP3 back in the response so the client can download it directly.
 */
app.post("/convert-mp3", async (req, res) => {
  try {
    const { base64Data, filename } = req.body || {};

    if (!base64Data || typeof base64Data !== "string") {
      return res.status(400).json({
        error: "Missing or invalid 'base64Data' in request body.",
      });
    }

    const safeFilename =
      typeof filename === "string" && filename.trim().length > 0
        ? filename.trim()
        : "output.mp3";

    // If the data URL prefix is present (e.g. "data:audio/mpeg;base64,..."), strip it.
    const cleanedBase64 = base64Data.includes(",")
      ? base64Data.split(",").pop()
      : base64Data;

    // Decode base64 into a Buffer.
    const buffer = Buffer.from(cleanedBase64, "base64");

    // Write file to current directory.
    const filePath = path.join(".", safeFilename);
    await fs.promises.writeFile(filePath, buffer);

    // Stream the MP3 back to the client as a file download.
    res
      .status(200)
      .set({
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
      })
      .send(buffer);
  } catch (err) {
    console.error("Error in /convert-mp3:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Express server listening on http://localhost:${PORT}`);
});


