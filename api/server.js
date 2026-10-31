const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT || 3000);
const RECIPIENT = process.env.CONTACT_RECIPIENT || "szivospatrikev@gmail.com";
const DATA_DIR = path.join(__dirname, "data");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".svg": "image/svg+xml", ".webp": "image/webp", ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8"
};

// Load api/.env without requiring an extra package.
try {
  const env = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
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
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(JSON.stringify(data));
}

function readEvents() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(EVENTS_FILE)) fs.writeFileSync(EVENTS_FILE, "[]\n", "utf8");
  try {
    const parsed = JSON.parse(fs.readFileSync(EVENTS_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new Error("api/data/events.json contains invalid JSON.");
  }
}

function writeEvents(events) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temp = EVENTS_FILE + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(events, null, 2) + "\n", "utf8");
  fs.renameSync(temp, EVENTS_FILE);
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function isAdmin(req) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) return false;
  const header = req.headers.authorization || "";
  if (!header.startsWith("Basic ")) return false;
  let decoded;
  try { decoded = Buffer.from(header.slice(6), "base64").toString("utf8"); }
  catch { return false; }
  const separator = decoded.indexOf(":");
  if (separator < 0) return false;
  return decoded.slice(0, separator) === "admin" &&
    safeEqual(decoded.slice(separator + 1), configuredPassword);
}

async function readJsonBody(req, maxBytes = 2_000_000) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > maxBytes) throw new Error("Request too large.");
  }
  return JSON.parse(raw || "{}");
}

function cleanEvent(input) {
  const fields = ["title", "date", "endDate", "startTime", "endTime", "venue", "category",
    "artists", "description", "ticketUrl", "imageUrl"];
  const event = {};
  for (const field of fields) event[field] = String(input[field] || "").trim();

  if (!event.title || event.title.length > 160) throw new Error("Enter an event name (max. 160 characters).");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date) || Number.isNaN(Date.parse(event.date + "T00:00:00"))) {
    throw new Error("Choose a valid event date.");
  }
  // Backward compatibility: older saved events have no separate endDate.
  if (!event.endDate) event.endDate = event.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.endDate) || Number.isNaN(Date.parse(event.endDate + "T00:00:00"))) {
    throw new Error("Choose a valid event end date.");
  }
  if (event.endDate < event.date) throw new Error("The end date cannot be before the start date.");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(event.startTime) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(event.endTime)) {
    throw new Error("Choose valid start and end times.");
  }
  if (`${event.endDate}T${event.endTime}` <= `${event.date}T${event.startTime}`) throw new Error("The event end date and time must be later than its start date and time.");
  if (!event.venue || event.venue.length > 240) throw new Error("Enter the event location (max. 240 characters).");
  if (!event.category || event.category.length > 100) throw new Error("Enter an event category.");
  if (event.artists.length > 1000 || event.description.length > 10000) throw new Error("Artist or description text is too long.");
  for (const field of ["ticketUrl", "imageUrl"]) {
    if (event[field]) {
      let url;
      try { url = new URL(event[field]); } catch { throw new Error(`Enter a valid ${field === "ticketUrl" ? "ticket" : "image"} URL.`); }
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only HTTP and HTTPS links are allowed.");
    }
  }
  return event;
}

async function receiveEnquiry(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }
  if (!req.headers["content-type"]?.includes("application/json")) {
    return sendJson(res, 415, { error: "JSON required." });
  }
  let data;
  try { data = await readJsonBody(req, 12000); }
  catch { return sendJson(res, 400, { error: "Invalid or oversized request." }); }

  const language = data.language === "en" ? "en" : "de";
  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim();
  const eventType = String(data.eventType || "").trim();
  const message = String(data.message || "").trim();

  if (!name || name.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
    !eventType || eventType.length > 120 || !message || message.length > 5000) {
    return sendJson(res, 400, { error: language === "en" ? "Please check all fields and try again." : "Bitte überprüfe alle Felder und versuche es erneut." });
  }
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    return sendJson(res, 503, { error: language === "en" ? "Email service is not configured yet." : "Der E-Mail-Versand ist noch nicht eingerichtet." });
  }

  const labels = language === "en"
    ? { subject: "New event enquiry — BC Vienna Arena", name: "Name", email: "Email", type: "Event type", message: "Message" }
    : { subject: "Neue Eventanfrage — BC Vienna Arena", name: "Name", email: "E-Mail", type: "Eventtyp", message: "Nachricht" };
  const emailText = [
    "BC VIENNA ARENA — EVENT ENQUIRY", "",
    `${labels.name}: ${name}`, `${labels.email}: ${email}`, `${labels.type}: ${eventType}`, "",
    `${labels.message}:`, message, "", `Website language: ${language.toUpperCase()}`
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.RESEND_FROM, to: [RECIPIENT], reply_to: email, subject: labels.subject, text: emailText })
    });
    if (!response.ok) {
      console.error("Email provider error:", response.status, await response.text());
      return sendJson(res, 502, { error: language === "en" ? "The enquiry could not be sent. Please try again." : "Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut." });
    }
    return sendJson(res, 200, { success: true });
  } catch (error) {
    console.error("Email error:", error.message);
    return sendJson(res, 502, { error: language === "en" ? "The email service is temporarily unavailable." : "Der E-Mail-Dienst ist momentan nicht erreichbar." });
  }
}

async function handleEventsApi(req, res, pathname) {
  if (pathname === "/api/events" && req.method === "GET") {
    try {
      const events = readEvents()
        .filter(event => event.published)
        .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
      return sendJson(res, 200, events);
    } catch (error) {
      console.error(error);
      return sendJson(res, 500, { error: "Could not load events." });
    }
  }

  if (pathname === "/api/admin/events" || pathname.startsWith("/api/admin/events/")) {
    if (!isAdmin(req)) {
      if (!process.env.ADMIN_PASSWORD) return sendJson(res, 503, { error: "Set ADMIN_PASSWORD in api/.env before using the admin panel." });
      res.setHeader("WWW-Authenticate", 'Basic realm="BC Vienna Arena Admin", charset="UTF-8"');
      return sendJson(res, 401, { error: "Admin login required." });
    }

    try {
      if (pathname === "/api/admin/events" && req.method === "GET") {
        const events = readEvents().sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
        return sendJson(res, 200, events);
      }

      if (pathname === "/api/admin/events" && req.method === "POST") {
        const body = await readJsonBody(req);
        const clean = cleanEvent(body);
        const events = readEvents();
        const event = { id: crypto.randomUUID(), ...clean, published: Boolean(body.published), createdAt: new Date().toISOString() };
        events.push(event);
        writeEvents(events);
        return sendJson(res, 201, event);
      }

      const match = pathname.match(/^\/api\/admin\/events\/([a-f0-9-]+)$/i);
      if (match) {
        const events = readEvents();
        const index = events.findIndex(event => event.id === match[1]);
        if (index < 0) return sendJson(res, 404, { error: "Event not found." });

        if (req.method === "PUT") {
          const body = await readJsonBody(req);
          events[index] = { ...events[index], ...cleanEvent(body), published: Boolean(body.published), updatedAt: new Date().toISOString() };
          writeEvents(events);
          return sendJson(res, 200, events[index]);
        }
        if (req.method === "DELETE") {
          events.splice(index, 1);
          writeEvents(events);
          return sendJson(res, 200, { success: true });
        }
      }
      res.setHeader("Allow", "GET, POST, PUT, DELETE");
      return sendJson(res, 405, { error: "Method not allowed." });
    } catch (error) {
      if (error instanceof SyntaxError) return sendJson(res, 400, { error: "Invalid JSON." });
      return sendJson(res, 400, { error: error.message || "Could not save event." });
    }
  }
  return false;
}

const server = http.createServer(async (req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
  catch { return sendJson(res, 400, { error: "Invalid URL." }); }

  if (pathname === "/api/contact") return receiveEnquiry(req, res);
  if (pathname.startsWith("/api/events") || pathname.startsWith("/api/admin/events")) {
    const handled = await handleEventsApi(req, res, pathname);
    if (handled !== false) return handled;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    return res.end("Method not allowed.");
  }
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  if (requestedPath.split("/").some(part => part.startsWith("."))) {
    res.writeHead(404); return res.end("Not found.");
  }
  const filePath = path.resolve(ROOT, "." + requestedPath);
  if (!filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403); return res.end("Forbidden.");
  }
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) { res.writeHead(404); return res.end("Not found."); }
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff"
    });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`BC Vienna Arena running at http://127.0.0.1:${PORT}`);
  if (!process.env.ADMIN_PASSWORD) console.warn("Set ADMIN_PASSWORD in api/.env to enable /admin.html");
});