(() => {
  const translations = {
    shared: {
      '.links a:nth-child(1)': 'HOME', '.links a:nth-child(2)': 'EVENTS',
      '.links a:nth-child(3)': 'VENUE', '.links a:nth-child(4)': 'BUSINESS',
      '.links a:nth-child(5)': 'CONTACT', '.nav-cta': 'BOOK VENUE ↗',
      '.footlinks a:nth-child(1)': 'HOME', '.footlinks a:nth-child(2)': 'EVENTS',
      '.footlinks a:nth-child(3)': 'VENUE', '.footlinks a:nth-child(4)': 'BUSINESS',
      '.footlinks a:nth-child(5)': 'CONTACT', '.bottom span:last-child': 'Imprint · Privacy'
    },
    de: {
      index: {
        '.kicker':'EVENT LOCATION','.section-kicker':'DIE LOCATION',
        '.marquee span':'EVENTS · SHOWS · FIRMENFEIERN · PRIVATE FEIERN · ERLEBNISSE · ',
        '.micro':'WARUM DIE ARENA','.feature-copy h3':'MEHR ALS<br><em>EINE LOCATION.</em>',
        '.feature-copy > p:last-of-type':'Ein Ort, der Veranstaltungen nicht einfach beherbergt, sondern ihnen Charakter gibt. Von großen Shows bis zu exklusiven Business Events.',
        '.feature-copy .outline-btn':'LOCATION ENTDECKEN <span>↗</span>',
        '.number-grid article:nth-child(1) p':'Shows & Veranstaltungen','.number-grid article:nth-child(2) p':'Corporate & Brands',
        '.number-grid article:nth-child(3) p':'Feiern & besondere Momente','.number-grid article:nth-child(4) p':'Dein Termin. Deine Bühne.'
      },
      events: {
        '.kicker':'KALENDER','.section-kicker':'EVENT KALENDER',
        'main h1':'WAS PASSIERT.<br><em>HIER.</em>', '.section-title':'DEINE NÄCHSTEN<br><span>HIGHLIGHTS.</span>',
        '.event-list article:nth-child(1) .date small':'OKT<br>2026','.event-list article:nth-child(2) .date small':'OKT<br>2026',
        '.event-list article:nth-child(1) p':'19:00 · Wien','.event-list article:nth-child(2) p':'20:30 · Wien',
        '.event-list article:nth-child(3) span':'VERFÜGBAR','.event-list article:nth-child(3) h3':'DEIN EVENT',
        '.event-list article:nth-child(3) p':'Konzert · Show · Firmenfeier · Privat',
        '.event-list article:nth-child(3) a':'LOCATION BUCHEN <b>↗</b>',
        '.event-bottom > p':'Du planst ein Event und suchst einen Ort, der anders ist als gewöhnliche Veranstaltungsräume? Dann lass uns sprechen.'
      },
      business: {
        '.kicker':'FIRMENKUNDEN','.section-kicker':'FIRMENVERANSTALTUNGEN',
        'main h1':'DEINE MARKE.<br><em>UNSERE BÜHNE.</em>', '.section-title':'PROFESSIONELL.<br><span>ANDERS.</span>',
        '.business-list > div:nth-child(1) h3':'FIRMENFEIERN',
        '.business-list > div:nth-child(2) h3':'PRODUKT-<br>PRÄSENTATION',
        '.business-list > div:nth-child(3) h3':'MARKEN-<br>ERLEBNISSE',
        '.business-list > div:nth-child(4) h3':'EXKLUSIVE<br>LOCATIONMIETE',
        '.business-banner small':'DEINE IDEE', '.business-banner h3':'WIR MACHEN<br><em>ES MÖGLICH.</em>',
        '.business-list > div:nth-child(1) p':'Firmenfeiern, Jahresveranstaltungen, Networking und Mitarbeiterevents.',
        '.business-list > div:nth-child(2) p':'Produkte und Marken dort präsentieren, wo Aufmerksamkeit garantiert ist.',
        '.business-list > div:nth-child(3) p':'Markenaktivierungen und Erlebnisse, die im Kopf bleiben.',
        '.business-list > div:nth-child(4) p':'Exklusive Nutzung der Location für dein individuelles Konzept.',
        '.business-banner .solid-btn':'ANGEBOT ANFRAGEN →'
      },
      venue: {
        '.kicker':'LOCATION','.section-kicker':'DIE LOCATION','.venue-copy > p':'Die BC Vienna Arena verbindet eine starke Atmosphäre mit einer flexibel nutzbaren Veranstaltungsfläche. Eine Bühne für Marken, Unternehmen, Shows und private Events.',
        'main h1':'EIN ORT,<br><em>DER BLEIBT.</em>', '.section-title':'RAUM FÜR<br><span>GROSSE MOMENTE.</span>',
        '.venue-copy small':'DER RAUM','.venue-copy h3':'DESIGN.<br>ENERGIE.<br><em>WIRKUNG.</em>',
        '.venue-copy .outline-btn':'LOCATION ANFRAGEN <span>↗</span>', '.stats > div:nth-child(3) span':'WIEN',
        '.stats > div:nth-child(4) span':'AUF ANFRAGE'
      },
      contact: {
        '.kicker':'BUCHUNG','.section-kicker':'EVENTBUCHUNG',
        'main h1':'LASS UNS<br><em>STARTEN.</em>', '.section-title':'DEIN EVENT<br><span>BEGINNT HIER.</span>',
        '.contact-left h3':'ERZÄHL UNS<br><em>VON DEINEM EVENT.</em>',
        '.contact-left > p':'Wir besprechen Termin, Format, Ablauf und die Möglichkeiten der Location.',
        '.contact-details span:nth-child(1)':'LOCATION','.contact-details span:nth-child(2)':'BUCHUNG',
        '.form label:nth-child(1)':'NAME<input name="Name" placeholder="Dein Name" />',
        '.form label:nth-child(2)':'E-MAIL<input type="email" name="Email" placeholder="deine@email.at" />',
        '.form label:nth-child(3)':'EVENTTYP<select><option>Firmenveranstaltung</option><option>Konzert / Show</option><option>Private Veranstaltung</option><option>Sonstiges</option></select>',
        '.form label:nth-child(4)':'NACHRICHT<textarea placeholder="Erzähl uns von deinem Event..."></textarea>',
        '.form button':'ANFRAGE SENDEN →'
      }
    },
    en: {
      index: {
        '.kicker':'EVENT VENUE','.section-kicker':'THE VENUE','.micro':'WHY THE ARENA',
        '.marquee span':'EVENTS · SHOWS · CORPORATE · PRIVATE · EXPERIENCES · ',
        '.number-grid article:nth-child(1) strong':'EVENTS','.number-grid article:nth-child(2) strong':'BUSINESS',
        '.number-grid article:nth-child(3) strong':'PRIVATE','.number-grid article:nth-child(4) strong':'BOOKING',
        '.feature-copy h3':'MORE THAN<br><em>A VENUE.</em>',
        '.feature-copy > p:last-of-type':'A place that does more than host events: it gives them character. From major shows to exclusive business events.',
        '.feature-copy .outline-btn':'DISCOVER THE VENUE <span>↗</span>',
        '.number-grid article:nth-child(1) p':'Shows & events','.number-grid article:nth-child(2) p':'Corporate & brands',
        '.number-grid article:nth-child(3) p':'Celebrations & special moments','.number-grid article:nth-child(4) p':'Your date. Your stage.'
      },
      events: {
        '.kicker':'CALENDAR','.section-kicker':'EVENT CALENDAR',
        'main h1':'WHAT’S ON<br><em>HERE.</em>', '.section-title':'YOUR NEXT<br><span>HIGHLIGHTS.</span>',
        '.event-list article:nth-child(1) .date small':'OCT<br>2026','.event-list article:nth-child(2) .date small':'OCT<br>2026',
        '.event-list article:nth-child(1) p':'7:00 PM · Vienna','.event-list article:nth-child(2) p':'8:30 PM · Vienna',
        '.event-list article:nth-child(3) span':'AVAILABLE','.event-list article:nth-child(3) h3':'YOUR EVENT',
        '.event-list article:nth-child(3) p':'Concert · Show · Corporate · Private',
        '.event-list article:nth-child(3) a':'BOOK THE VENUE <b>↗</b>',
        '.event-bottom small':'EVERY FORMAT.', '.event-bottom h3':'ONE<br><em>VENUE.</em>',
        '.event-bottom > p':'Planning an event and looking for a place that stands apart from ordinary venues? Let’s talk.'
      },
      business: {
        '.kicker':'CORPORATE','.section-kicker':'BUSINESS EVENTS',
        'main h1':'YOUR BRAND.<br><em>OUR STAGE.</em>', '.section-title':'PROFESSIONAL.<br><span>DIFFERENT.</span>',
        '.business-list > div:nth-child(1) h3':'CORPORATE<br>EVENTS', '.business-list > div:nth-child(2) h3':'PRODUCT<br>LAUNCH',
        '.business-list > div:nth-child(3) h3':'BRAND<br>EXPERIENCE', '.business-list > div:nth-child(4) h3':'PRIVATE<br>HIRE',
        '.business-banner small':'YOUR IDEA', '.business-banner h3':'WE MAKE<br><em>IT HAPPEN.</em>',
        '.business-list > div:nth-child(1) p':'Company celebrations, annual events, networking and team events.',
        '.business-list > div:nth-child(2) p':'Showcase products and brands where attention is guaranteed.',
        '.business-list > div:nth-child(3) p':'Brand activations and experiences that stay with you.',
        '.business-list > div:nth-child(4) p':'Exclusive use of the venue for your own concept.',
        '.business-banner .solid-btn':'REQUEST A PROPOSAL →'
      },
      venue: {
        '.kicker':'VENUE','.section-kicker':'THE VENUE','.venue-copy > p':'BC Vienna Arena combines a distinctive atmosphere with a flexible event space. A stage for brands, companies, shows and private events.',
        'main h1':'A PLACE<br><em>TO REMEMBER.</em>', '.section-title':'SPACE FOR<br><span>BIG MOMENTS.</span>',
        '.venue-copy small':'THE SPACE','.venue-copy h3':'DESIGN.<br>ENERGY.<br><em>IMPACT.</em>',
        '.stats > div:nth-child(1) span':'EVENT VENUE','.stats > div:nth-child(2) span':'POSSIBILITIES',
        '.venue-copy .outline-btn':'ENQUIRE ABOUT THE VENUE <span>↗</span>', '.stats > div:nth-child(3) span':'VIENNA',
        '.stats > div:nth-child(4) span':'ON REQUEST'
      },
      contact: {
        '.kicker':'BOOKING','.section-kicker':'EVENT BOOKING',
        'main h1':'LET’S<br><em>GET STARTED.</em>', '.section-title':'YOUR EVENT<br><span>STARTS HERE.</span>',
        '.contact-left h3':'TELL US<br><em>ABOUT YOUR EVENT.</em>',
        '.contact-left > p':'We’ll discuss the date, format, schedule and possibilities of the venue.',
        '.contact-details span:nth-child(1)':'LOCATION','.contact-details span:nth-child(2)':'BOOKING',
        '.form label:nth-child(1)':'NAME<input name="Name" placeholder="Your name" />',
        '.form label:nth-child(2)':'E-MAIL<input type="email" name="Email" placeholder="your@email.com" />',
        '.form label:nth-child(3)':'EVENT TYPE<select><option>Corporate event</option><option>Concert / Show</option><option>Private event</option><option>Other</option></select>',
        '.form label:nth-child(4)':'MESSAGE<textarea placeholder="Tell us about your event..."></textarea>',
        '.form button':'SEND ENQUIRY →'
      }
    }
  };
  const page = location.pathname.split('/').pop().replace('.html','') || 'index';
  const buttons = document.querySelectorAll('.lang');
  const meta = document.querySelector('meta[name="description"]');
  const descriptions = {
    index: ['Eine außergewöhnliche Eventlocation in Wien für Shows, Corporate Events, Präsentationen und unvergessliche Momente.','An extraordinary event venue in Vienna for shows, corporate events, presentations and unforgettable moments.'],
    events: ['Entdecke kommende Veranstaltungen oder mache die Arena zur Bühne für dein eigenes Event.','Discover upcoming events or make the arena the stage for your own event.'],
    business: ['Eine starke Bühne für Unternehmen, Marken und Geschäftspartner.','A powerful stage for companies, brands and business partners.'],
    venue: ['Eine markante Location in Wien mit echtem Arena-Charakter – flexibel für unterschiedliche Veranstaltungsformate.','A distinctive Vienna venue with a true arena atmosphere — flexible for a wide range of event formats.'],
    contact: ['Du hast eine Idee für ein Event? Erzähle uns davon. Wir besprechen Termin, Format und Möglichkeiten der Location.','Have an event idea? Tell us about it. We will discuss the date, format and possibilities of the venue.']
  };
  function setLanguage(lang) {
    if (!['de','en'].includes(lang)) lang = 'de';
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-de][data-en]').forEach(el => { el.innerHTML = el.dataset[lang]; });
    const shared = lang === 'en' ? translations.shared : {
      '.links a:nth-child(1)':'STARTSEITE', '.links a:nth-child(2)':'VERANSTALTUNGEN',
      '.links a:nth-child(3)':'LOCATION', '.links a:nth-child(4)':'BUSINESS',
      '.links a:nth-child(5)':'KONTAKT', '.nav-cta':'LOCATION BUCHEN ↗',
      '.footlinks a:nth-child(1)':'STARTSEITE', '.footlinks a:nth-child(2)':'VERANSTALTUNGEN',
      '.footlinks a:nth-child(3)':'LOCATION', '.footlinks a:nth-child(4)':'BUSINESS',
      '.footlinks a:nth-child(5)':'KONTAKT', '.bottom span:last-child':'Impressum · Datenschutz'
    };
    const map = {...shared, ...translations[lang][page]};
    Object.entries(map).forEach(([selector, value]) => document.querySelectorAll(selector).forEach(el => { el.innerHTML = value; }));
    document.querySelectorAll('.form input, .form textarea').forEach(el => {
      const placeholder = lang === 'en' ? (el.type === 'email' ? 'your@email.com' : el.tagName === 'TEXTAREA' ? 'Tell us about your event...' : 'Your name') : (el.type === 'email' ? 'deine@email.at' : el.tagName === 'TEXTAREA' ? 'Erzähl uns von deinem Event...' : 'Dein Name');
      el.placeholder = placeholder;
    });
    if (meta && descriptions[page]) meta.content = descriptions[page][lang === 'de' ? 0 : 1];
    if (page) document.title = `${page.toUpperCase()} — BC Vienna Arena`;
    buttons.forEach(button => button.classList.toggle('active', button.dataset.lang === lang));
    sessionStorage.setItem('bcViennaLang', lang);
  }
  buttons.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
  setLanguage(sessionStorage.getItem('bcViennaLang') || 'de');
})();
