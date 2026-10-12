(() => {
  const buttons = document.querySelectorAll(".lang");

  function setLanguage(lang) {
    document.documentElement.lang = lang;

    // Minden data-de/data-en elemet átváltunk.
    document.querySelectorAll("[data-de][data-en]").forEach(el => {
      const value = el.dataset[lang];
      if (value !== undefined) {
        el.innerHTML = value;
      }
    });

    // Űrlap placeholder-ek.
    document.querySelectorAll("[data-ph-de][data-ph-en]").forEach(el => {
      el.placeholder = lang === "de"
        ? el.dataset.phDe
        : el.dataset.phEn;
    });

    // Select optionök.
    document.querySelectorAll("option[data-de][data-en]").forEach(option => {
      option.textContent = lang === "de"
        ? option.dataset.de
        : option.dataset.en;
    });

    // Aktív nyelv.
    buttons.forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.lang === lang
      );
    });

    // Megjegyzi a választott nyelvet.
    sessionStorage.setItem("bcViennaLang", lang);
  }

  // DE / EN gombok.
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.lang);
    });
  });

  // Alapértelmezett nyelv: német.
  // Ha már választottál nyelvet, azt használja.
  const savedLanguage = sessionStorage.getItem("bcViennaLang") || "de";
  setLanguage(savedLanguage);

  // Sticky / scroll nav.
  const nav = document.querySelector(".nav");

  window.addEventListener("scroll", () => {
    nav?.classList.toggle(
      "scrolled",
      window.scrollY > 30
    );
  }, { passive: true });

  // Scroll reveal animációk.
  const revealElements = document.querySelectorAll(
    ".reveal, .reveal-stagger"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, {
      threshold: 0.12
    });

    revealElements.forEach(element => {
      observer.observe(element);
    });
  } else {
    revealElements.forEach(element => {
      element.classList.add("visible");
    });
  }

  // Hero egér-parallax.
  const hero = document.querySelector(".hero");

  if (hero) {
    window.addEventListener("mousemove", event => {
      const x =
        (event.clientX / window.innerWidth - 0.5) * 10;

      const y =
        (event.clientY / window.innerHeight - 0.5) * 6;

      hero.style.setProperty("--mx", `${x}px`);
      hero.style.setProperty("--my", `${y}px`);
    }, { passive: true });
  }

  // Mobil menü.
  const hamburger = document.querySelector(".hamb");
  const links = document.querySelector(".links");

  hamburger?.addEventListener("click", () => {
    links?.classList.toggle("open");
    hamburger.classList.toggle("open");
  });

  document.querySelectorAll(".links a").forEach(link => {
    link.addEventListener("click", () => {
      links?.classList.remove("open");
      hamburger?.classList.remove("open");
    });
  });
})();