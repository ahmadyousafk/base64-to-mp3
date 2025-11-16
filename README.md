## Express base64 MP3 API (Node.js)

This is a **small Express app** that you run with **Node.js**, no Deno required.

It exposes a single endpoint that accepts a **base64-encoded MP3** string, decodes it into an MP3 binary, writes it to a file, and also streams it back to the client.

### Endpoint

- **Method**: `POST`
- **Path**: `/convert-mp3`
- **Body (JSON)**:

```json
{
  "base64Data": "<base64-encoded-mp3>",
  "filename": "optional-file-name.mp3"
}
```

- **Notes**:
  - `base64Data` can be either a raw base64 string or a full data URL like `data:audio/mpeg;base64,...`.
  - `filename` is optional; it defaults to `"output.mp3"`.

- **Response**:
  - Status `200` with the decoded MP3 bytes.
  - Headers:
    - `Content-Type: audio/mpeg`
    - `Content-Disposition: attachment; filename="<filename>"`

### Running locally with Node.js

1. Install Node.js if you don't have it already: `https://nodejs.org/`.
2. From the project directory, install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

This starts the Express server on `http://localhost:8080` (or the `PORT` from your environment).

### Example request (using curl)

Assuming you have a base64 string in a file called `body.json`:

```json
{
  "base64Data": "<your-base64-mp3-here>",
  "filename": "song.mp3"
}
```

Run:

```bash
curl -X POST http://localhost:8080/convert-mp3 \
  -H "Content-Type: application/json" \
  --data @body.json \
  --output song.mp3
```

This will save the returned MP3 as `song.mp3` on your machine.

You can deploy this Node.js app to any platform that supports Node (e.g. a VPS, Render, Railway, etc.).


