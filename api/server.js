const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000, 5500);
const RECIPIENT = process.env.CONTACT_RECIPIENT || "events@bcvienna.at";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

// Betölti a projekt gyökerében található .env fájlt.
try {
  const env = fs.readFileSync(path.join(ROOT, ".env"), "utf8");

  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/i);

    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(data));
}

async function receiveEnquiry(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  if (!req.headers["content-type"]?.includes("application/json")) {
    return sendJson(res, 415, { error: "JSON required." });
  }

  let raw = "";

  try {
    for await (const chunk of req) {
      raw += chunk;

      if (Buffer.byteLength(raw) > 12000) {
        return sendJson(res, 413, { error: "Message too large." });
      }
    }
  } catch {
    return sendJson(res, 400, { error: "Could not read request." });
  }

  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON." });
  }

  const language = data.language === "en" ? "en" : "de";
  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim();
  const eventType = String(data.eventType || "").trim();
  const message = String(data.message || "").trim();

  if (
    !name ||
    name.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    !eventType ||
    eventType.length > 120 ||
    !message ||
    message.length > 5000
  ) {
    return sendJson(res, 400, {
      error: language === "en"
        ? "Please check all fields and try again."
        : "Bitte überprüfe alle Felder und versuche es erneut."
    });
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    console.error("Email settings are missing from .env");

    return sendJson(res, 503, {
      error: language === "en"
        ? "Email service is not configured yet."
        : "Der E-Mail-Versand ist noch nicht eingerichtet."
    });
  }

  const labels = language === "en"
    ? {
      subject: "New event enquiry — BC Vienna Arena",
      name: "Name",
      email: "Email",
      type: "Event type",
      message: "Message"
    }
    : {
      subject: "Neue Eventanfrage — BC Vienna Arena",
      name: "Name",
      email: "E-Mail",
      type: "Eventtyp",
      message: "Nachricht"
    };

  const emailText = [
    "BC VIENNA ARENA — EVENT ENQUIRY",
    "",
    `${labels.name}: ${name}`,
    `${labels.email}: ${email}`,
    `${labels.type}: ${eventType}`,
    "",
    `${labels.message}:`,
    message,
    "",
    `Website language: ${language.toUpperCase()}`
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM,
        to: [RECIPIENT],
        reply_to: email,
        subject: labels.subject,
        text: emailText
      })
    });

    if (!response.ok) {
      console.error("Email provider error:", response.status, await response.text());

      return sendJson(res, 502, {
        error: language === "en"
          ? "The enquiry could not be sent. Please try again."
          : "Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut."
      });
    }

    return sendJson(res, 200, { success: true });
  } catch (error) {
    console.error("Email error:", error.message);

    return sendJson(res, 502, {
      error: language === "en"
        ? "The email service is temporarily unavailable."
        : "Der E-Mail-Dienst ist momentan nicht erreichbar."
    });
  }
}

const server = http.createServer(async (req, res) => {
  let pathname;

  try {
    pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname
    );
  } catch {
    return sendJson(res, 400, { error: "Invalid URL." });
  }

  if (pathname === "/api/contact") {
    return receiveEnquiry(req, res);
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    return res.end("Method not allowed.");
  }

  const requestedPath = pathname === "/" ? "/index.html" : pathname;

  if (requestedPath.split("/").some(part => part.startsWith("."))) {
    res.writeHead(404);
    return res.end("Not found.");
  }

  const filePath = path.resolve(ROOT, "." + requestedPath);

  if (!filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403);
    return res.end("Forbidden.");
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      res.writeHead(404);
      return res.end("Not found.");
    }

    res.writeHead(200, {
      "Content-Type":
        MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff"
    });

    if (req.method === "HEAD") return res.end();

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`BC Vienna Arena running at http://localhost:${PORT}`);
});