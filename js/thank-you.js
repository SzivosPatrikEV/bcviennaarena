(() => {
    const buttons = document.querySelectorAll("[data-lang]");
    const params = new URLSearchParams(window.location.search);

    const initialLanguage =
        params.get("lang") === "en"
            ? "en"
            : params.get("lang") === "de"
                ? "de"
                : localStorage.getItem("bcViennaLang") || "de";

    function setLanguage(lang) {
        lang = lang === "en" ? "en" : "de";

        document.documentElement.lang = lang;

        document.querySelectorAll("[data-de][data-en]").forEach(el => {
            el.innerHTML = el.dataset[lang];
        });

        buttons.forEach(button => {
            button.classList.toggle("active", button.dataset.lang === lang);
        });

        localStorage.setItem("bcViennaLang", lang);
    }

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            setLanguage(button.dataset.lang);
        });
    });

    setLanguage(initialLanguage);
})();