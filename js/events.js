(() => {
  const buttons = document.querySelectorAll(".lang");
  const eventList = document.getElementById("eventList");
  const modal = document.getElementById("eventModal");
  let currentLanguage = sessionStorage.getItem("bcViennaLang") || "de";
  let events = [];

  function setLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-de][data-en]").forEach(el => {
      const value = el.dataset[lang];
      if (value !== undefined) el.innerHTML = value;
    });
    document.querySelectorAll("[data-ph-de][data-ph-en]").forEach(el => {
      el.placeholder = lang === "de" ? el.dataset.phDe : el.dataset.phEn;
    });
    document.querySelectorAll("option[data-de][data-en]").forEach(option => {
      option.textContent = lang === "de" ? option.dataset.de : option.dataset.en;
    });
    buttons.forEach(button => button.classList.toggle("active", button.dataset.lang === lang));
    sessionStorage.setItem("bcViennaLang", lang);
    if (events.length) renderEvents();
  }

  buttons.forEach(button => button.addEventListener("click", () => setLanguage(button.dataset.lang)));

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function formatDate(date) {
    const locale = currentLanguage === "de" ? "de-AT" : "en-GB";
    return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" })
      .format(new Date(`${date}T12:00:00`));
  }

  function formatDateRange(startDate, endDate) {
    const start = formatDate(startDate);
    return endDate && endDate !== startDate ? `${start} – ${formatDate(endDate)}` : start;
  }

  function renderEvents() {
    if (!events.length) {
      eventList.innerHTML = `<div class="events-empty">${currentLanguage === "de" ? "Aktuell sind keine Veranstaltungen angekündigt." : "No upcoming events have been announced yet."}</div>
        <article class="highlight"><div class="date">+</div><div><span>AVAILABLE</span><h3>DEIN EVENT</h3><p>Concert · Show · Corporate · Private</p></div><a href="contact.html">${currentLanguage === "de" ? "LOCATION BUCHEN" : "BOOK THE VENUE"} <b>↗</b></a></article>`;
      return;
    }
    eventList.innerHTML = events.map(event => {
      const date = formatDateRange(event.date, event.endDate);
      const parts = date.split(" ");
      const day = escapeHtml(parts[0] || "");
      const monthYear = escapeHtml(parts.slice(1).join(" ").toUpperCase());
      return `<article class="event-row">
        <div class="date">${day}<small>${monthYear}</small></div>
        <div class="event-summary"><span>${escapeHtml(event.category)}</span><h3>${escapeHtml(event.title)}</h3>
          <p>${escapeHtml(event.startTime)} – ${escapeHtml(event.endTime)} · ${escapeHtml(event.venue)}</p></div>
        <button class="event-details-button" type="button" data-event-id="${escapeHtml(event.id)}">${currentLanguage === "de" ? "DETAILS" : "DETAILS"} <b>↗</b></button>
      </article>`;
    }).join("") + `<article class="highlight"><div class="date">+</div><div><span>AVAILABLE</span><h3>DEIN EVENT</h3><p>Concert · Show · Corporate · Private</p></div><a href="contact.html">${currentLanguage === "de" ? "LOCATION BUCHEN" : "BOOK THE VENUE"} <b>↗</b></a></article>`;
    eventList.classList.add("visible");
  }

  function openDetails(event) {
    const locale = currentLanguage === "de" ? "de-AT" : "en-GB";
    const dateFormatter = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const date = dateFormatter.format(new Date(`${event.date}T12:00:00`));
    const endDate = event.endDate && event.endDate !== event.date
      ? dateFormatter.format(new Date(`${event.endDate}T12:00:00`)) : "";
    document.getElementById("modalCategory").textContent = event.category;
    document.getElementById("modalTitle").textContent = event.title;
    document.getElementById("modalMeta").innerHTML =
      `<span>▦ ${escapeHtml(endDate ? `${date} – ${endDate}` : date)}</span><span>◷ ${escapeHtml(event.startTime)} – ${escapeHtml(event.endTime)}</span><span>⌖ ${escapeHtml(event.venue)}</span>`;
    const artists = document.getElementById("modalArtists");
    artists.textContent = event.artists ? `${currentLanguage === "de" ? "ARTISTS / LINE-UP" : "ARTISTS / LINE-UP"}: ${event.artists}` : "";
    document.getElementById("modalDescription").textContent = event.description || "";
    const image = document.getElementById("modalImage");
    image.style.backgroundImage = event.imageUrl ? `linear-gradient(0deg,#090a0c55,#090a0c11),url("${event.imageUrl.replace(/["\\]/g, "")}")` : "";
    image.hidden = !event.imageUrl;
    const ticket = document.getElementById("modalTicket");
    if (event.ticketUrl) {
      ticket.href = event.ticketUrl;
      ticket.hidden = false;
      ticket.textContent = currentLanguage === "de" ? "TICKETS KAUFEN ↗" : "BUY TICKETS ↗";
    } else {
      ticket.hidden = true;
      ticket.removeAttribute("href");
    }
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modal.querySelector(".modal-close").focus();
  }

  eventList.addEventListener("click", event => {
    const button = event.target.closest("[data-event-id]");
    if (!button) return;
    const selected = events.find(item => item.id === button.dataset.eventId);
    if (selected) openDetails(selected);
  });

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }
  modal.addEventListener("click", event => {
    if (event.target.closest("[data-close-modal]")) closeModal();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  fetch("/api/events")
    .then(response => {
      if (!response.ok) throw new Error("Could not load events.");
      return response.json();
    })
    .then(data => { events = Array.isArray(data) ? data : []; renderEvents(); })
    .catch(error => {
      console.error(error);
      eventList.innerHTML = `<p class="events-error">${currentLanguage === "de" ? "Veranstaltungen konnten nicht geladen werden. Bitte starte den lokalen API-Server." : "Events could not be loaded. Please start the local API server."}</p>`;
    });

  const nav = document.querySelector(".nav");
  window.addEventListener("scroll", () => nav?.classList.toggle("scrolled", window.scrollY > 30), { passive: true });
  const revealElements = document.querySelectorAll(".reveal, .reveal-stagger");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    }), { threshold: 0.12 });
    revealElements.forEach(element => observer.observe(element));
  } else revealElements.forEach(element => element.classList.add("visible"));

  const hamburger = document.querySelector(".hamb");
  const links = document.querySelector(".links");
  hamburger?.addEventListener("click", () => { links?.classList.toggle("open"); hamburger.classList.toggle("open"); });
  document.querySelectorAll(".links a").forEach(link => link.addEventListener("click", () => {
    links?.classList.remove("open"); hamburger?.classList.remove("open");
  }));
  setLanguage(currentLanguage);
})();