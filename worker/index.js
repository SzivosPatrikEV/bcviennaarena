const json = (status, body, origin, allowedOrigin) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin"
  };

  if (origin && origin === allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
  }

  return new Response(JSON.stringify(body), { status, headers });
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const allowedOrigin = env.ALLOWED_ORIGIN;

    if (!allowedOrigin || origin !== allowedOrigin) {
      return json(403, { error: "Origin not allowed." }, origin, allowedOrigin);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin"
        }
      });
    }

    if (new URL(request.url).pathname !== "/api/contact") {
      return json(404, { error: "Not found." }, origin, allowedOrigin);
    }

    if (request.method !== "POST") {
      return json(405, { error: "Method not allowed." }, origin, allowedOrigin);
    }

    if (!request.headers.get("Content-Type")?.includes("application/json")) {
      return json(415, { error: "JSON required." }, origin, allowedOrigin);
    }

    let data;
    try {
      const raw = await request.text();
      if (new TextEncoder().encode(raw).length > 12000) {
        return json(413, { error: "Message too large." }, origin, allowedOrigin);
      }
      data = JSON.parse(raw);
    } catch {
      return json(400, { error: "Invalid request body." }, origin, allowedOrigin);
    }

    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    const eventType = String(data.eventType || "").trim();
    const message = String(data.message || "").trim();
    const language = data.language === "en" ? "en" : "de";

    if (!name || name.length > 120 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
        !eventType || eventType.length > 120 || !message || message.length > 5000) {
      return json(400, {
        error: language === "en"
          ? "Please check all fields and try again."
          : "Bitte überprüfe alle Felder und versuche es erneut."
      }, origin, allowedOrigin);
    }

    if (!env.RESEND_API_KEY || !env.RESEND_FROM || !env.CONTACT_RECIPIENT) {
      console.error("Email service configuration is incomplete.");
      return json(503, { error: "Email service is not configured." }, origin, allowedOrigin);
    }

    const labels = language === "en"
      ? { subject: "New event enquiry — BC Vienna Arena", name: "Name", email: "Email", type: "Event type", message: "Message" }
      : { subject: "Neue Eventanfrage — BC Vienna Arena", name: "Name", email: "E-Mail", type: "Eventtyp", message: "Nachricht" };
    const text = [
      "BC VIENNA ARENA — EVENT ENQUIRY", "",
      `${labels.name}: ${name}`, `${labels.email}: ${email}`,
      `${labels.type}: ${eventType}`, "", `${labels.message}:`, message,
      "", `Website language: ${language.toUpperCase()}`
    ].join("\n");

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: env.RESEND_FROM,
          to: [env.CONTACT_RECIPIENT],
          reply_to: email,
          subject: labels.subject,
          text
        })
      });

      if (!response.ok) {
        console.error("Resend rejected the email:", response.status, await response.text());
        return json(502, { error: "The enquiry could not be sent." }, origin, allowedOrigin);
      }

      return json(200, { success: true }, origin, allowedOrigin);
    } catch (error) {
      console.error("Resend request failed:", error.message);
      return json(502, { error: "Email service is temporarily unavailable." }, origin, allowedOrigin);
    }
  }
};
