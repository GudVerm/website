document.addEventListener('DOMContentLoaded', () => {
  const cmsApi = (window.GUDELIUS_CMS_API || "").replace(/\/$/, "");

  function cmsMediaUrl(key) {
    return cmsApi + "/media/" + key.split("/").map(encodeURIComponent).join("/");
  }

  function applyCmsMedia(root = document) {
    if (!cmsApi) return;
    root.querySelectorAll("img[data-cms-media]").forEach((img) => {
      if (img.dataset.cmsApplied === "1") return;
      const fallback = img.currentSrc || img.src;
      img.dataset.cmsApplied = "1";
      img.addEventListener("error", function restoreFallback() {
        img.removeEventListener("error", restoreFallback);
        img.src = fallback;
      });
      img.src = cmsMediaUrl(img.dataset.cmsMedia);
    });

    root.querySelectorAll("[data-cms-bg]").forEach((element) => {
      if (element.dataset.cmsApplied === "1") return;
      element.dataset.cmsApplied = "1";
      const image = new Image();
      image.onload = () => {
        const url = cmsMediaUrl(element.dataset.cmsBg);
        if (element.classList.contains("hero")) {
          element.style.setProperty("--hero-image", `url("${url}")`);
        } else if (element.classList.contains("service-hero")) {
          element.style.setProperty("--service-image", `url("${url}")`);
        } else {
          element.style.backgroundImage = `url("${url}")`;
          element.removeAttribute("data-bg");
          element.classList.remove("lazy-bg");
        }
      };
      image.src = cmsMediaUrl(element.dataset.cmsBg);
    });
  }

  applyCmsMedia();

  async function applyCmsText(root = document) {
    if (!cmsApi) return;
    const elements = [...root.querySelectorAll("[data-cms-text]")];
    if (!elements.length) return;

    try {
      const response = await fetch(cmsApi + "/api/site");
      if (!response.ok) return;
      const data = await response.json();
      const content = data.content || {};

      elements.forEach((element) => {
        const value = content[element.dataset.cmsText];
        if (typeof value === "string" && value.trim()) {
          element.textContent = value;
        }
      });

      root.querySelectorAll("[data-cms-link]").forEach((element) => {
        const value = content[element.dataset.cmsLink];
        if (typeof value !== "string" || !value.trim()) return;

        const type = element.dataset.cmsLinkType;
        if (type === "mailto") {
          element.href = "mailto:" + value.trim();
        } else if (type === "tel") {
          const normalized = value.trim().replace(/[^+\d]/g, "");
          element.href = "tel:" + normalized;
        }
      });

      root.querySelectorAll("[data-cms-placeholder]").forEach((element) => {
        const value = content[element.dataset.cmsPlaceholder];
        if (typeof value === "string" && value.trim()) {
          element.setAttribute("placeholder", value);
        }
      });

      root.querySelectorAll("[data-cms-value]").forEach((element) => {
        const value = content[element.dataset.cmsValue];
        if (typeof value === "string" && value.trim()) {
          element.value = value;
        }
      });

      if (typeof content["kontakt/email"] === "string" && content["kontakt/email"].trim()) {
        window.GUDELIUS_CONTACT_EMAIL = content["kontakt/email"].trim();
      }
    } catch (error) {
      console.warn("CMS-Texte konnten nicht geladen werden.", error);
    }
  }

  applyCmsText();

  const lazyBackgrounds = document.querySelectorAll('.lazy-bg[data-bg]');

  const loadBackground = (element) => {
    if (!element?.dataset?.bg) return;
    element.style.backgroundImage = `url("${element.dataset.bg}")`;
    element.removeAttribute('data-bg');
    element.classList.remove('lazy-bg');
  };

  if ('IntersectionObserver' in window) {
    const backgroundObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadBackground(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '300px 0px' });

    lazyBackgrounds.forEach((element) => backgroundObserver.observe(element));
  } else {
    lazyBackgrounds.forEach(loadBackground);
  }

  const menuBtn = document.getElementById('menuBtn');
  const navlinks = document.getElementById('navlinks');
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  const mobileQuery = window.matchMedia('(max-width: 1000px)');

  if (menuBtn && navlinks) {
    menuBtn.addEventListener('click', () => {
      navlinks.classList.toggle('open');
    });

    navlinks.querySelectorAll('a:not(.nav-dropdown-toggle)').forEach((a) => {
      a.addEventListener('click', () => {
        navlinks.classList.remove('open');
        dropdowns.forEach((dropdown) => dropdown.classList.remove('open'));
      });
    });
  }

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector('.nav-dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (event) => {
      if (!mobileQuery.matches) return;
      event.preventDefault();
      const willOpen = !dropdown.classList.contains('open');
      dropdowns.forEach((item) => item.classList.remove('open'));
      dropdown.classList.toggle('open', willOpen);
      toggle.setAttribute('aria-expanded', String(willOpen));
    });
  });

  document.addEventListener('click', (event) => {
    if (!mobileQuery.matches || event.target.closest('.nav-dropdown')) return;
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove('open');
      const toggle = dropdown.querySelector('.nav-dropdown-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.querySelectorAll('.service-card[data-href]').forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) return;
      window.location.href = card.dataset.href;
    });
  });

  const equipmentModal = document.getElementById('equipmentModal');
  const equipmentClose = document.getElementById('equipmentModalClose');
  const equipmentTitle = document.getElementById('equipmentModalTitle');
  const equipmentKicker = document.getElementById('equipmentModalKicker');
  const equipmentLead = document.getElementById('equipmentModalLead');
  const equipmentSummary = document.getElementById('equipmentModalSummary');
  const equipmentGallery = document.getElementById('equipmentModalGallery');

  const equipmentData = {
    aussendienst: {
      kicker: 'Außendienst',
      title: 'Präzise Messtechnik vor Ort.',
      lead: 'Die Außendienst-Ausstattung folgt der Technikliste der aktuellen Gudelius-Seite. Hersteller- und Produktbilder dienen in der Beta nur als vorläufige Bildmotive.',
      summary: 'Die eigenen Gerätefotos von Jost ersetzen später diese Hersteller-/Produktbilder eins zu eins.',
      devices: [
        { name:'Trimble SX12', detail:'Scanning-Totalstation', image:'https://images.ctfassets.net/1nvkn1423yot/7bouK6GUtWnVuxunCfxZML/4bd3307e16c06e17b898f32965eec7db/geo-sx12-productpage-fullbackgroundproducthero-800x960.png', mediaKey:'equipment/trimble-sx12', source:'https://geospatial.trimble.com/de/products/hardware/trimble-sx12', sourceLabel:'Trimble' },
        { name:'Trimble S6', detail:'Robotik-Totalstation', image:'assets/equipment-trimble-s6.svg', mediaKey:'equipment/trimble-s6', source:'https://help.fieldsystems.trimble.com/trimble-access/latest/de/equipment-supported.htm', sourceLabel:'Trimble · S6 Support' },
        { name:'Trimble R2 GNSS-Empfänger', detail:'GNSS-Positionierung', image:'https://www.allnav.com/wp-content/uploads/2020/04/R2_4.jpg', mediaKey:'equipment/trimble-r2', source:'https://www.allnav.com/produkte/gnss-systeme/r2/', sourceLabel:'Trimble-Partner ALLNAV' },
        { name:'Trimble DiNi 07 Ingenieurnivellier', detail:'Digitalnivellement', image:'https://images.ctfassets.net/1nvkn1423yot/64MgxNSI4ha3AwrJajbI1D/bc2639be1307bec5571be1197bd07a1b/geo-dinilevel-productpage-fullbackgroundproducthero-800x960.png', mediaKey:'equipment/trimble-dini07', source:'https://geospatial.trimble.com/de/products/hardware/trimble-dini-level', sourceLabel:'Trimble' }
      ]
    },
    digital: {
      kicker: '3D & Drohne',
      title: 'Digitale Erfassung aus Boden und Luft.',
      lead: 'Laserscanning, RTK-Drohne, Wärmebild und photogrammetrische Auswertung bilden den digitalen Technikblock.',
      summary: 'TX8 und die Drohnenbilder werden später durch die tatsächlich verwendeten Geräteaufnahmen ersetzt.',
      devices: [
        { name:'Trimble TX8 3D-Laserscanner', detail:'Terrestrisches 3D-Laserscanning', image:'assets/equipment-trimble-tx8.svg', mediaKey:'equipment/trimble-tx8', source:'https://geospatial.trimble.com/de/support/discontinued-products-technical-support', sourceLabel:'Trimble · TX8 Support' },
        { name:'RTK-Drohne', detail:'Vermessung & Orthophoto', image:'https://www1.djicdn.com/cms/uploads/3185f8d17b7211aad1a326f604fc0022.png', mediaKey:'equipment/rtk-drohne', source:'https://enterprise.dji.com/news/detail/matrice-4-series-release', sourceLabel:'DJI Enterprise · Platzhalter' },
        { name:'RTK-Drohne mit Infrarotkamera', detail:'Thermische Bildaufnahme', image:'https://www1.djicdn.com/cms/uploads/6a4fe5870d86bb43d58dcc1f364895da.png', mediaKey:'equipment/infrarotkamera', source:'https://enterprise.dji.com/news/detail/matrice-4-series-release', sourceLabel:'DJI Enterprise · Platzhalter' },
        { name:'Punktwolken & Photogrammetrie', detail:'Workflow / Ergebnisdarstellung', image:'https://www.agisoft.com/images/cloud-try-now.png', mediaKey:'equipment/photogrammetrie', source:'https://www.agisoft.com/', sourceLabel:'Agisoft · Platzhalter' }
      ]
    },
    software: {
      kicker: 'Programme & Arbeitsplatz',
      title: 'Auswertung und Datenaufbereitung.',
      lead: 'CAD, Tiefbauplanung, Punktwolken und Photogrammetrie werden mit den auf der Originalseite genannten Programmen abgedeckt.',
      summary: 'Bei Software zeigen die Platzhalter Hersteller- bzw. Produktmotive. Der mobile Büroarbeitsplatz bleibt als eigener visueller Eintrag erhalten.',
      devices: [
        { name:'BricsCAD', detail:'CAD-Bearbeitung', image:'https://www.bbsoft.de/assets/logo/extern/octave_weiss.webp', mediaKey:'equipment/bricscad', source:'https://bricscad.octave.com/de', sourceLabel:'Octave / BricsCAD' },
        { name:'BBSOFT', detail:'Tiefbau, Vermessung & DGM', image:'https://www.bbsoft.de/assets/images/uberuns/bbsoft-planung-computer.webp', mediaKey:'equipment/bbsoft', source:'https://www.bbsoft.de/', sourceLabel:'BBSoft' },
        { name:'Trimble RealWorks', detail:'Punktwolken-Auswertung', image:'https://images.ctfassets.net/citn2sn5tdjr/2qHLMpxFWko4vex8bZItdi/f3295ad93a3fd7aaaa384a895ab3e13e/trimble-realworks-pipes-office-laptop-2880x1440.jpg?f=right&fit=fill&fm=webp&h=810&q=85&w=1920', mediaKey:'equipment/realworks', source:'https://www.trimble.com/de/products/building-construction-field-systems/trimble-realworks', sourceLabel:'Trimble' },
        { name:'Agisoft Metashape', detail:'Photogrammetrie', image:'https://www.agisoft.com/images/cloud-try-now.png', mediaKey:'equipment/metashape', source:'https://www.agisoft.com/', sourceLabel:'Agisoft' },
        { name:'Mobiler Büroarbeitsplatz', detail:'Auswertung direkt im Projektumfeld', image:'https://static.wixstatic.com/media/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg/v1/fill/w_980%2Ch_321%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bdad94_b3c3899c62854fc2af846e55db7be150~mv2.jpg', mediaKey:'equipment/mobile-arbeitsplatz', source:'https://www.gudeliusvermessung.de/', sourceLabel:'GudeliusVermessung' }
      ]
    }
  };
  function openEquipmentModal(key) {
    if (!equipmentModal || !equipmentData[key]) return;
    const data = equipmentData[key];

    equipmentKicker.textContent = data.kicker;
    equipmentTitle.textContent = data.title;
    equipmentLead.textContent = data.lead;
    equipmentSummary.textContent = data.summary;
    equipmentGallery.innerHTML = data.devices
      .map((device) => `
        <article class="equipment-device-card">
          <img src="${device.image}" data-cms-media="${device.mediaKey || ''}" alt="${device.name} Platzhalterbild" loading="lazy" decoding="async" fetchpriority="low">
          <div class="equipment-device-copy">
            <strong>${device.name}</strong>
            <span>${device.detail}</span>
            <a class="equipment-source" href="${device.source}" target="_blank" rel="noopener">Bildquelle: ${device.sourceLabel} ↗</a>
          </div>
        </article>
      `)
      .join('');
    applyCmsMedia(equipmentGallery);

    equipmentModal.classList.add('open');
    equipmentModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (equipmentClose) equipmentClose.focus();
  }

  function closeEquipmentModal() {
    if (!equipmentModal) return;
    equipmentModal.classList.remove('open');
    equipmentModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('.equip-open[data-equipment]').forEach((card) => {
    card.addEventListener('click', () => openEquipmentModal(card.dataset.equipment));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openEquipmentModal(card.dataset.equipment);
      }
    });
  });

  if (equipmentClose) equipmentClose.addEventListener('click', closeEquipmentModal);

  if (equipmentModal) {
    equipmentModal.addEventListener('click', (event) => {
      if (event.target === equipmentModal) closeEquipmentModal();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && equipmentModal?.classList.contains('open')) {
      closeEquipmentModal();
    }
  });
});

async function sendMail(e) {
  e.preventDefault();

  const form = e.currentTarget;
  const api = (window.GUDELIUS_CMS_API || "").replace(/\/$/, "");
  const status = form.querySelector(".form-note");
  const submit = form.querySelector('button[type="submit"]');

  if (!api) {
    if (status) status.textContent = "Das Kontaktformular ist momentan nicht verfügbar.";
    return;
  }

  const payload = {
    name: form.querySelector("#name")?.value || "",
    email: form.querySelector("#email")?.value || "",
    subject: form.querySelector("#subject")?.value || "",
    message: form.querySelector("#message")?.value || "",
    website: form.querySelector('[name="website"]')?.value || "",
    source: window.location.pathname
  };

  if (submit) {
    submit.disabled = true;
    submit.dataset.originalText = submit.textContent;
    submit.textContent = "Wird gesendet …";
  }
  if (status) {
    status.textContent = "Ihre Anfrage wird sicher übermittelt …";
    status.classList.remove("success", "error");
  }

  try {
    const response = await fetch(api + "/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || ("HTTP " + response.status));

    form.reset();
    if (status) {
      status.textContent = "Vielen Dank. Ihre Anfrage wurde erfolgreich übermittelt.";
      status.classList.add("success");
    }
  } catch (error) {
    if (status) {
      status.textContent = "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder nutzen Sie die angegebene E-Mail-Adresse.";
      status.classList.add("error");
    }
    console.error("Kontaktformular:", error);
  } finally {
    if (submit) {
      submit.disabled = false;
      submit.textContent = submit.dataset.originalText || "Anfrage senden →";
    }
  }
}
