BC VIENNA ARENA — EVENTS WEBSITE V2

German is default, English is second language.
Language switch works on all page content and persists for the current tab.
Separate HTML/CSS/JS for every menu page.
New visual direction: Space Grotesk + Manrope, editorial/grid layout, large visible typography, marquee, parallax, cursor interaction, scroll reveals, staggered cards, hover motion, animated navigation and mobile menu.

CONTACT FORM BACKEND

The contact form posts to /api/contact. The Node.js server sends enquiries to
szivospatrikev@gmail.com through Resend. To configure email delivery:

1. Create a Resend account and verify a domain you control.
2. Copy .env.example to .env.
3. Set RESEND_API_KEY to your Resend API key.
4. Set RESEND_FROM to an address on your verified domain, for example:
   BC Vienna Arena <contact@yourdomain.at>
5. Start the site with `npm start` and open http://localhost:3000.

Keep .env private and configure the same environment variables on your host
when deploying. The success dialog appears only after the email provider
accepts the message.

GITHUB PAGES EMAIL DELIVERY

GitHub Pages hosts static files only. It cannot run api/server.js, so deploy
the email API separately as a Cloudflare Worker:

1. Create a Cloudflare Worker and deploy worker/index.js (or use Wrangler:
   `npx wrangler deploy worker/index.js --name bc-vienna-contact`).
2. In the Worker settings, add these variables/secrets:
   RESEND_API_KEY (secret), RESEND_FROM, CONTACT_RECIPIENT, ALLOWED_ORIGIN.
   Use the same verified sender and Resend key as your local configuration.
   ALLOWED_ORIGIN must be the exact public site origin, such as
   https://your-user.github.io (no trailing slash). For a project site, the
   path is not included in the origin. Add any custom-domain origin there.
3. In js/contact-config.js, set CONTACT_API_URL to the Worker URL ending in
   /api/contact, for example https://bc-vienna-contact.<account>.workers.dev/api/contact.
4. Commit and push the site to GitHub, then enable GitHub Pages for the repo.

Never put RESEND_API_KEY in any website JavaScript or commit api/.env.
