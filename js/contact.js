(() => {
  const revealElements = document.querySelectorAll(
    ".reveal, .reveal-stagger"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach(element => observer.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add("visible"));
  }

  const form = document.getElementById("event-enquiry-form");
  const status = document.getElementById("form-status");
  const submit = document.getElementById("submit-enquiry");

  const language = () =>
    localStorage.getItem("bcViennaLang") ||
    document.documentElement.lang ||
    "de";

  function setLanguage(lang) {
    lang = lang === "en" ? "en" : "de";
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-de][data-en]").forEach(el => {
      el.innerHTML = el.dataset[lang];
    });

    document.querySelectorAll("[data-ph-de][data-ph-en]").forEach(el => {
      el.placeholder = lang === "en"
        ? el.dataset.phEn
        : el.dataset.phDe;
    });

    document.querySelectorAll("option[data-de][data-en]").forEach(el => {
      el.textContent = el.dataset[lang];
    });

    document.querySelectorAll(".lang").forEach(button => {
      button.classList.toggle("active", button.dataset.lang === lang);
    });

    localStorage.setItem("bcViennaLang", lang);
  }

  document.querySelectorAll(".lang").forEach(button => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });

  setLanguage(language());

  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const lang = language();
    const values = new FormData(form);

    const payload = {
      name: String(values.get("name") || "").trim(),
      email: String(values.get("email") || "").trim(),
      eventType: String(values.get("eventType") || "").trim(),
      message: String(values.get("message") || "").trim(),
      language: lang
    };

    submit.disabled = true;
    submit.textContent = lang === "en" ? "SENDING..." : "WIRD GESENDET...";
    status.textContent = "";

    try {
      const response = await fetch(
        window.CONTACT_API_URL || "/api/contact",
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Request failed");
      }

      window.location.href =
        `thank-you.html?lang=${encodeURIComponent(lang)}`;
    } catch (error) {
      status.textContent = lang === "en"
        ? "Sorry, your enquiry could not be sent. Please try again or email events@bcvienna.at."
        : "Leider konnte deine Anfrage nicht gesendet werden. Bitte versuche es erneut oder schreibe an events@bcvienna.at.";

      submit.disabled = false;
      submit.textContent = lang === "en"
        ? "SEND ENQUIRY →"
        : "ANFRAGE SENDEN →";

      console.error(error);
    }
  });
})();
