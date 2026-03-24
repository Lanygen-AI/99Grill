// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("burger-canvas");
const ctx = canvas.getContext("2d");
const topbar = document.getElementById("topbar");
const uiContainer = document.getElementById("ui-reveal");
const headline = document.querySelector(".arabic-headline");
const buttons = gsap.utils.toArray(".actions .btn");
const menuCardsRoot = document.getElementById("menu-cards");
const signatureTrack = document.getElementById("signature-track");
const locationsGrid = document.getElementById("locations-grid");
const socialGrid = document.getElementById("social-grid");

const menuModal = document.getElementById("menu-modal");
const locationModal = document.getElementById("location-modal");
const lightboxModal = document.getElementById("lightbox-modal");
const orderModal = document.getElementById("order-modal");

const menuModalTitle = document.getElementById("menu-modal-title");
const menuFrame = document.getElementById("menu-pdf-frame");
const locationModalTitle = document.getElementById("location-modal-title");
const locationGallery = document.getElementById("location-gallery");
const locationDetails = document.getElementById("location-details");
const lightboxContent = document.getElementById("lightbox-content");

const languageToggle = document.getElementById("language-toggle");
const languageMenu = document.getElementById("language-menu");
const languageLabel = document.getElementById("language-label");
const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
const mobileNavDrawer = document.getElementById("mobile-nav-drawer");
const mobileNavBackdrop = document.getElementById("mobile-nav-backdrop");

const languageConfig = {
    en: { code: "en", file: "Languages/English.json", label: "EN", htmlLang: "en", dir: "ltr" },
    ar: { code: "ar", file: "Languages/Arabic.json", label: "AR", htmlLang: "ar", dir: "rtl" },
    ku: { code: "ku", file: "Languages/Kurdish.json", label: "KU", htmlLang: "ku", dir: "rtl" }
};

function detectLowPerformanceDevice() {
    const cores = navigator.hardwareConcurrency || 8;
    const memory = navigator.deviceMemory || 8;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const effectiveType = connection && connection.effectiveType ? String(connection.effectiveType).toLowerCase() : "";
    const saveData = Boolean(connection && connection.saveData);
    const isLikelyMobile = window.matchMedia("(max-width: 900px)").matches || (navigator.maxTouchPoints || 0) > 0;

    if (saveData) return true;

    // Keep desktop/laptop users in full mode unless they explicitly ask for reduced motion.
    if (!isLikelyMobile) return false;

    const veryLowHardware = memory <= 2 || cores <= 2;
    const slowNetwork = effectiveType === "slow-2g" || effectiveType === "2g";

    return veryLowHardware || slowNetwork;
}

const urlParams = new URLSearchParams(window.location.search);
const performanceOverride = urlParams.get("performance");
const shouldUseLiteMode = performanceOverride === "lite"
    ? true
    : performanceOverride === "full"
        ? false
    : false;
const performanceMode = shouldUseLiteMode ? "lite" : "full";

document.body.classList.toggle("perf-lite", performanceMode === "lite");

let smartVideoObserver = null;

function ensureSmartVideoObserver() {
    if (performanceMode !== "lite" || smartVideoObserver || typeof IntersectionObserver === "undefined") return;

    smartVideoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target;
            if (!(video instanceof HTMLVideoElement)) return;

            if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
                const playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(() => {
                        // Ignore autoplay restriction errors in fallback mode.
                    });
                }
            } else {
                video.pause();
            }
        });
    }, {
        threshold: [0, 0.35, 0.75],
        rootMargin: "120px 0px"
    });
}

function registerSmartVideo(videoEl) {
    if (!videoEl) return;
    videoEl.dataset.smartVideo = "1";

    if (performanceMode !== "lite") return;

    ensureSmartVideoObserver();
    videoEl.removeAttribute("autoplay");
    videoEl.autoplay = false;
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.pause();

    if (smartVideoObserver) {
        smartVideoObserver.observe(videoEl);
    }
}

document.addEventListener("visibilitychange", () => {
    if (performanceMode !== "lite") return;
    if (!document.hidden) return;

    document.querySelectorAll("video[data-smart-video='1']").forEach((videoEl) => {
        if (videoEl instanceof HTMLVideoElement) {
            videoEl.pause();
        }
    });
});

const translations = {};
let currentLanguage = "en";
let currentCopy = null;

function getNestedValue(source, path) {
    return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), source);
}

function t(path, fallback = "") {
    if (!currentCopy) return fallback;
    const value = getNestedValue(currentCopy, path);
    return value === undefined || value === null ? fallback : value;
}

function formatTemplate(template, data) {
    return template.replace(/\{(.*?)\}/g, (_, key) => (data[key] !== undefined ? data[key] : ""));
}

function setSocialTileLabel(label) {
    const safe = String(label || "View").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    document.documentElement.style.setProperty("--social-view-label", `"${safe}"`);
}

const menuData = [
    {
        title: "Iraq Menu",
        region: "Central & South Iraq",
        note: "Main city branches and nationwide classics.",
        folder: "MENU FOLDER/Iraq",
        menuName: "Iraq Menu",
        pages: 5
    },
    {
        title: "Sulaymaniyah / Erbil Menu",
        region: "Kurdistan Region",
        note: "Designed for Sulaymaniyah and Erbil locations.",
        folder: "MENU FOLDER/Sulaymaniyah",
        menuName: "Sulaymaniyah-Erbil Menu",
        pages: 5
    },
    {
        title: "Duhok Menu",
        region: "Northern Region",
        note: "Exclusive branch selection for Duhok city.",
        folder: "MENU FOLDER/Duhok",
        menuName: "Duhok Menu",
        pages: 5
    }
];

const signatureItems = [
    {
        name: "Creamy Chicken Loaded",
        desc: "Tender chicken layered with rich, house-made creamy sauce.",
        video: "SIGNATURE MEALS  FEATURED FOOD/left.mp4"
    },
    {
        name: "Grill Combo Tray",
        desc: "Juicy burger, golden fries, and sides served as a full meal.",
        video: "SIGNATURE MEALS  FEATURED FOOD/middle.mp4"
    },
    {
        name: "Buffalo Wings",
        desc: "Crispy wings coated in bold buffalo sauce with deep flavor.",
        video: "SIGNATURE MEALS  FEATURED FOOD/right.mp4"
    }
];

const locationBase = "LOCATIONS FOLDER";
const locationData = [
    { name: "Adhamiya", city: "Baghdad", folder: "Adhamiya branch-فرع الأعظمية" },
    { name: "Al-Amiriya", city: "Baghdad", folder: "Al-Amiriya branch-فرع العامرية" },
    { name: "Aljamiea", city: "Baghdad", folder: "Aljamiea branch-فرع حي الجامعة" },
    { name: "Basra", city: "Basra", folder: "Basra branch-فرع البصرة" },
    { name: "Binouk", city: "Baghdad", folder: "Binouk branch-فرع البنوك" },
    { name: "Diyala", city: "Diyala", folder: "Diyala branch-فرع ديالي" },
    { name: "Dohuk", city: "Dohuk", folder: "Dohuk branch-فرع دهوك" },
    { name: "Erbil", city: "Erbil", folder: "Erbil branch-فرع أربيل" },
    { name: "Fallujah", city: "Fallujah", folder: "Fallujah branch-فرع الفلوجة" },
    { name: "Hilla", city: "Hilla", folder: "Hilla branch-فرع الحلّة" },
    { name: "Karbala", city: "Karbala", folder: "Karbala branch-فرع كربلاء" },
    { name: "Karrada", city: "Baghdad", folder: "Karrada branch-فرع الكرادة" },
    { name: "Kirkuk", city: "Kirkuk", folder: "Kirkuk branch-فر ع كركوك" },
    { name: "Mosul", city: "Mosul", folder: "Mosul branch-فرع الموصل" },
    { name: "Najaf", city: "Najaf", folder: "Najaf branch-فرع النجف" },
    { name: "Nasiriyah", city: "Nasiriyah", folder: "Nasiriyah branch - فرع الناصرية" },
    { name: "Ramadi", city: "Ramadi", folder: "Ramadi branch-فرع الرمادى" },
    { name: "Saydia", city: "Baghdad", folder: "Saydia branch-فرع السيدية" },
    { name: "Sulaymaniyah Salim", city: "Sulaymaniyah", folder: "Sulaymaniyah Branch-Salim street -فرع السليمانية" },
    { name: "Sulaymaniyah Twy Malik", city: "Sulaymaniyah", folder: "sulaymaniyah-Twy Malik branch- فرع توي مالك" },
    { name: "Tikrit", city: "Tikrit", folder: "Tikrit branch-فرع تكريت" },
    { name: "Zayouna", city: "Baghdad", folder: "Zayouna branch-فرع الزيونة" }
];

const locationFallbackMeta = {
    "Adhamiya branch-فرع الأعظمية": { coords: "33.375189530710195,44.371062549076555", mapLink: "https://maps.app.goo.gl/gog9HyUrDEyfBdDWA", phone: "07711999972" },
    "Al-Amiriya branch-فرع العامرية": { coords: "33.30006571919847,44.290183913492534", mapLink: "https://maps.app.goo.gl/ZvfS75VYGDYqAmnW6" },
    "Aljamiea branch-فرع حي الجامعة": { coords: "33.32006454737462,44.32447389140601", mapLink: "https://maps.app.goo.gl/QqH6rSwXLLXbebxF9", phone: "07711999972" },
    "Basra branch-فرع البصرة": { coords: "30.502121113985762,47.832002276064905", mapLink: "https://maps.app.goo.gl/Nuju56uufisMd27H6", phone: "07711999972" },
    "Binouk branch-فرع البنوك": { coords: "33.395455093079775,44.39791670000001", mapLink: "https://maps.app.goo.gl/JiDvgPH5Hrwj9LUq7" },
    "Diyala branch-فرع ديالي": { coords: "33.74510343054887,44.62544168650746", mapLink: "https://maps.app.goo.gl/ohULQc2aHyZPLj8f9" },
    "Dohuk branch-فرع دهوك": { coords: "36.872696272504605,42.95502906441763", mapLink: "https://maps.app.goo.gl/3TPCS4eAe8C3hDkc8", phone: "07509938999" },
    "Erbil branch-فرع أربيل": { coords: "36.20973691699344,43.97488586441763", mapLink: "https://maps.app.goo.gl/SHZCpRaata1h5LBS6", phone: "07711999972" },
    "Fallujah branch-فرع الفلوجة": { mapLink: "https://maps.app.goo.gl/AteTn8vgpxBZWXvUA" },
    "Hilla branch-فرع الحلّة": { coords: "32.5550716712421,44.419853865127635", mapLink: "https://maps.app.goo.gl/J4K3Agc4Cvo48qrL7" },
    "Karbala branch-فرع كربلاء": { coords: "32.599551764752476,44.018323764417644", mapLink: "https://maps.app.goo.gl/dkU1zHqBofHBwsBcA", phone: "07802373999" },
    "Karrada branch-فرع الكرادة": { coords: "33.30555388359586,44.42359159814544", mapLink: "https://maps.app.goo.gl/qrWUjUDELc2Lmz766" },
    "Kirkuk branch-فر ع كركوك": { coords: "35.460931820248746,44.38245222208819", mapLink: "https://maps.app.goo.gl/3k6oqxU8DQBzFwK29", phone: "07703202099" },
    "Mosul branch-فرع الموصل": { coords: "36.36582504371536,43.14182329875069", mapLink: "https://maps.app.goo.gl/DKmXpvzFBbV6vF1M8" },
    "Najaf branch-فرع النجف": { coords: "32.01859552161495,44.35715123558236", mapLink: "https://maps.app.goo.gl/PPaGAMKKxK5U8RTq7", phone: "07711999972" },
    "Nasiriyah branch - فرع الناصرية": { coords: "31.08291102759529,46.24095019886274", mapLink: "https://maps.app.goo.gl/TRx9gTFpX5azrDp96" },
    "Ramadi branch-فرع الرمادى": { coords: "33.486620589970705,43.27426913203134", mapLink: "https://maps.app.goo.gl/AvKyvBoZgfANZFeN9" },
    "Saydia branch-فرع السيدية": { coords: "33.25167264428739,44.35370153373544", mapLink: "https://maps.app.goo.gl/ekg6WUwZjumjVst26", phone: "07711999972" },
    "Sulaymaniyah Branch-Salim street -فرع السليمانية": { coords: "35.56228404386433,45.40824067975873", mapLink: "https://maps.app.goo.gl/hkxQ51B9w5zButKG9", phone: "07711999972" },
    "sulaymaniyah-Twy Malik branch- فرع توي مالك": { coords: "35.569524893026376,45.453905542328364", mapLink: "https://maps.app.goo.gl/z8iXRvczMGpc9wEj6", phone: "07711999972" },
    "Tikrit branch-فرع تكريت": { coords: "34.605063407649055,43.671826008594", mapLink: "https://maps.app.goo.gl/pqNyXmK7sUMMudXw6", phone: "07711999972" },
    "Zayouna branch-فرع الزيونة": { coords: "33.328833935646855,44.45644969140599", mapLink: "https://maps.app.goo.gl/Y12C7MkCWPtdJ65C9", phone: "07711999972" }
};

const galleryBase = "INSTAGRAM  SOCIAL GALLERY";
const socialMedia = [
    "99grill.iraq_1769954650_3822978719523071027_13096392106.jpg",
    "99grill.iraq_kurdistan_1729519200_3483782494494112102_45467967751.jpg",
    "99grill.iraq_kurdistan_1750258800_3657758842130088341_45467967751.jpg",
    "99grill.iraq_kurdistan_1766327055_3792548676716211868_45467967751.jpg",
    "99grill.jo_1759851000_3737986438131282583_5365450901.jpg",
    "99grill.jo_1762697094_3762098357578405799_5365450901.jpg",
    "99grill.jo_1764678600_3778667085497556801_5365450901.jpg",
    "99grill.iraq_kurdistan_1737539382_3551059220264260778_45467967751.mp4",
    "99grill.iraq_kurdistan_1740495600_3575858846972132535_45467967751.mp4",
    "99grill.iraq_kurdistan_1757604600_3719379608459334417_45467967751.mp4",
    "99grill.jo_1761827400_3754802908010214276_5365450901.mp4",
    "99grill.jo_1768122306_3807607902417106078_5365450901.mp4"
];

const locationImageCandidates = [
    "main.jpg",
    "main.png",
    "main.jpeg",
    "main.webp",
    "main (1).jpg",
    "main (2).jpg",
    "inside.jpg",
    "inside.png",
    "inside2.jpg",
    "inside-image.jpg",
    "image-location.jpg",
    "image-location (1).jpg"
];

const locationImagePriorityOverrides = {
    "Zayouna branch-فرع الزيونة": "main.jpg?v=20260324"
};
const locationTextCandidates = ["location.txt", "locationn.txt", "map-location.txt", "map-loction.txt", "contact.txt"];

async function loadLanguage(code) {
    const config = languageConfig[code];
    if (!config) return null;
    if (translations[code]) return translations[code];

    const bundled = window.__LANG_PACKS && window.__LANG_PACKS[code] ? window.__LANG_PACKS[code] : null;
    const isFileProtocol = window.location.protocol === "file:";

    if (isFileProtocol && bundled) {
        translations[code] = bundled;
        return translations[code];
    }

    try {
        const response = await fetch(config.file, { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to load ${config.file}`);
        const json = await response.json();
        translations[code] = json;
        return json;
    } catch (error) {
        if (bundled) {
            translations[code] = bundled;
            return translations[code];
        }
        console.error(error);
        return null;
    }
}

function syncDynamicDataFromCopy() {
    const menuCards = t("menus_section.cards", []);
    menuData.forEach((item, idx) => {
        const localized = menuCards[idx];
        if (!localized) return;
        item.title = localized.title || item.title;
        item.region = localized.region || item.region;
        item.note = localized.note || item.note;
    });

    const favoriteCards = t("favorites_section.cards", []);
    signatureItems.forEach((item, idx) => {
        const localized = favoriteCards[idx];
        if (!localized) return;
        item.name = localized.name || item.name;
        item.desc = localized.description || item.desc;
    });

    const branches = t("locations_section.branches", []);
    locationData.forEach((item, idx) => {
        const localized = branches[idx];
        if (!localized) return;
        item.name = localized.name || item.name;
        item.city = localized.city || item.city;
    });
}

function applyStaticCopy() {
    document.title = t("meta.title", document.title);

    const logo = document.querySelector(".logo img");
    if (logo) logo.alt = t("image_alt_text.logo", logo.alt);

    const navGroups = [
        document.querySelectorAll("#topbar .desktop-nav > a"),
        document.querySelectorAll(".mobile-nav-links > a")
    ];

    navGroups.forEach((navLinks) => {
        if (navLinks.length < 6) return;
        navLinks[0].textContent = t("navigation.home", navLinks[0].textContent);
        navLinks[1].textContent = t("navigation.menus", navLinks[1].textContent);
        navLinks[2].textContent = t("navigation.favorites", navLinks[2].textContent);
        navLinks[3].textContent = t("navigation.locations", navLinks[3].textContent);
        navLinks[4].textContent = t("navigation.gallery", navLinks[4].textContent);
        navLinks[5].textContent = t("navigation.order_now", navLinks[5].textContent);
    });

    if (mobileMenuToggle) {
        mobileMenuToggle.setAttribute("aria-label", t("navigation.mobile_menu_aria_label", "Open navigation menu"));
    }

    const headline = document.querySelector(".arabic-headline");
    if (headline) headline.textContent = t("hero.headline_en", headline.textContent);

    const heroButtons = document.querySelectorAll("#ui-reveal .actions .btn");
    if (heroButtons.length >= 2) {
        heroButtons[0].textContent = t("hero.explore_menu_button", heroButtons[0].textContent);
        heroButtons[1].textContent = t("hero.order_now_button", heroButtons[1].textContent);
    }

    const menusSection = document.querySelector("#menus");
    if (menusSection) {
        menusSection.querySelector(".section-eyebrow").textContent = t("menus_section.eyebrow", "Menus");
        menusSection.querySelector(".section-title").textContent = t("menus_section.title", "Choose Your Menu");
        menusSection.querySelector(".section-subtitle").textContent = t("menus_section.subtitle", "");
    }

    const favoritesSection = document.querySelector("#favorites");
    if (favoritesSection) {
        favoritesSection.querySelector(".section-eyebrow").textContent = t("favorites_section.eyebrow", "Favorites");
        favoritesSection.querySelector(".section-title").textContent = t("favorites_section.title", "Signature Meals");
        favoritesSection.querySelector(".section-subtitle").textContent = t("favorites_section.subtitle", "");
    }

    const locationsSection = document.querySelector("#locations");
    if (locationsSection) {
        locationsSection.querySelector(".section-eyebrow").textContent = t("locations_section.eyebrow", "Branches");
        locationsSection.querySelector(".section-title").textContent = t("locations_section.title", "Find Your 99GRILL");
        locationsSection.querySelector(".section-subtitle").textContent = t("locations_section.subtitle", "");
    }

    const gallerySection = document.querySelector("#gallery");
    if (gallerySection) {
        gallerySection.querySelector(".section-eyebrow").textContent = t("gallery_section.eyebrow", "Social");
        gallerySection.querySelector(".section-title").textContent = t("gallery_section.title", "Inside 99GRILL");
        gallerySection.querySelector(".section-subtitle").textContent = t("gallery_section.subtitle", "");

        const socialPills = gallerySection.querySelectorAll(".social-link-pill span:last-child");
        if (socialPills.length >= 2) {
            socialPills[0].textContent = t("gallery_section.instagram_label", socialPills[0].textContent);
            socialPills[1].textContent = t("gallery_section.facebook_label", socialPills[1].textContent);
        }

        const socialCta = gallerySection.querySelector(".social-cta");
        if (socialCta) socialCta.textContent = t("gallery_section.follow_cta", socialCta.textContent);
    }

    setSocialTileLabel(t("gallery_section.media_tile_overlay_label", "View"));

    const finalCta = document.querySelector("#order.final-cta");
    if (finalCta) {
        finalCta.querySelector("h2").textContent = t("final_cta_section.title", "Ready to Taste the Heat?");
        finalCta.querySelector("p").textContent = t("final_cta_section.description", "");
        const ctaButtons = finalCta.querySelectorAll(".final-cta-actions .btn");
        if (ctaButtons.length >= 3) {
            ctaButtons[0].textContent = t("final_cta_section.explore_menu_button", ctaButtons[0].textContent);
            ctaButtons[1].textContent = t("final_cta_section.find_location_button", ctaButtons[1].textContent);
            ctaButtons[2].textContent = t("final_cta_section.order_now_button", ctaButtons[2].textContent);
        }
    }

    const menuModalClose = document.querySelector("[data-close='menu-modal']");
    if (menuModalClose) menuModalClose.setAttribute("aria-label", t("menu_modal.close_aria_label", "Close menu"));

    const locationModalClose = document.querySelector("[data-close='location-modal']");
    if (locationModalClose) locationModalClose.setAttribute("aria-label", t("location_modal.close_aria_label", "Close location details"));

    const lightboxModalClose = document.querySelector("[data-close='lightbox-modal']");
    if (lightboxModalClose) lightboxModalClose.setAttribute("aria-label", t("lightbox_modal.close_aria_label", "Close media"));

    const orderModalClose = document.querySelector("[data-close='order-modal']");
    if (orderModalClose) orderModalClose.setAttribute("aria-label", t("order_modal.close_aria_label", "Close order modal"));

    const menuPrevButtons = document.querySelectorAll(".menu-nav-prev");
    menuPrevButtons.forEach((btn) => btn.setAttribute("aria-label", t("menu_modal.previous_page_aria_label", "Previous page")));

    const menuNextButtons = document.querySelectorAll(".menu-nav-next");
    menuNextButtons.forEach((btn) => btn.setAttribute("aria-label", t("menu_modal.next_page_aria_label", "Next page")));

    const menuImage = document.getElementById("menu-image");
    if (menuImage) menuImage.alt = t("menu_modal.menu_image_alt", "Menu page");

    const lightboxTitle = document.getElementById("lightbox-title");
    if (lightboxTitle) lightboxTitle.textContent = t("lightbox_modal.title", lightboxTitle.textContent);

    const orderTitle = document.getElementById("order-modal-title");
    if (orderTitle) orderTitle.textContent = t("order_modal.title", orderTitle.textContent);

    const orderSubtitle = document.querySelector(".order-subtitle");
    if (orderSubtitle) orderSubtitle.textContent = t("order_modal.subtitle", orderSubtitle.textContent);

    const talabatLabel = document.querySelector(".order-talabat-link span:last-child");
    if (talabatLabel) talabatLabel.textContent = t("order_modal.talabat_cta", talabatLabel.textContent);

    const footerRights = document.getElementById("site-footer-rights");
    if (footerRights) {
        const year = new Date().getFullYear();
        footerRights.textContent = formatTemplate(t("footer.rights", "© {year} 99GRILL. All rights reserved."), { year });
    }

    const footerSeparator = document.getElementById("site-footer-separator");
    if (footerSeparator) {
        footerSeparator.textContent = t("footer.separator", " | ");
    }

    const footerCreditLink = document.getElementById("site-footer-credit-link");
    if (footerCreditLink) {
        footerCreditLink.textContent = t("footer.credit_label", "Site by LanyGen");
        footerCreditLink.href = t("footer.credit_url", "https://lanygen.com/");
    }
}

async function applyLanguage(languageCode, options = { rerender: true }) {
    const config = languageConfig[languageCode] || languageConfig.en;
    const loaded = await loadLanguage(config.code);
    const fallback = await loadLanguage("en");
    currentLanguage = config.code;
    currentCopy = loaded || fallback;

    document.documentElement.lang = config.htmlLang;
    document.documentElement.dir = config.dir;

    document.body.classList.remove("lang-en", "lang-ar", "lang-ku");
    document.body.classList.add(`lang-${config.code}`);

    if (languageLabel) languageLabel.textContent = config.label;

    document.querySelectorAll(".language-option").forEach((option) => {
        option.classList.toggle("is-active", option.dataset.lang === config.code);
    });

    syncDynamicDataFromCopy();
    applyStaticCopy();

    if (options.rerender) {
        createMenuCards();
        createSignatureCards();
        createLocationCards();
        createSocialGallery();
    }

    localStorage.setItem("site-language", config.code);
}

function showTopbar() {
    topbar.classList.add("revealed");
    topbar.classList.remove("hidden-scroll");
}

function hideTopbarDuringSequence() {
    topbar.classList.remove("revealed");
    topbar.classList.add("hidden-scroll");
}

let hasRevealed = false;

// Show topbar when user first lands on the page.
showTopbar();

// Keep desktop on the original sequence; use mobile sequence only on phone-width screens.
const isMobileHero = window.matchMedia("(max-width: 768px)").matches;
const frameCount = isMobileHero ? 147 : 146;
const heroFramesFolder = isMobileHero ? "video-for-mobile" : "video";
const images = [];
const imageSeq = {
    frame: 0
};

// Keep canvas dimensions consistent; only swap frame source by viewport.
canvas.width = 1920;
canvas.height = 1080;

function syncMobileCanvasSize() {
    if (!isMobileHero) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
}

syncMobileCanvasSize();

// Helper to pad frame numbers (e.g., 1 -> "001")
const currentFrame = index => (
    `${heroFramesFolder}/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
);

let imagesLoaded = 0;
const framesToPreload = performanceMode === "lite" ? 1 : frameCount;

// Preload Images
for (let i = 0; i < framesToPreload; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    // Draw the first frame immediately once it loads
    if (i === 0) {
        img.onload = () => {
            render();
            imagesLoaded++;
            if (performanceMode === "lite") {
                playRevealAnimation();
            }
        };
    } else {
        img.onload = () => {
             imagesLoaded++;
        };
    }
    images.push(img);
}

// Function to redraw canvas
function render() {
    if (!images[imageSeq.frame]) return;

    const img = images[imageSeq.frame];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isMobileHero) {
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const dx = (canvas.width - drawWidth) / 2;
        const dy = (canvas.height - drawHeight) / 2;

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
        return;
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

// Handle window resize
window.addEventListener("resize", () => {
    const nowMobile = window.matchMedia("(max-width: 768px)").matches;
    if (nowMobile !== isMobileHero) {
        window.location.reload();
        return;
    }

    syncMobileCanvasSize();
    render();
});

if (performanceMode === "full") {
    // Setup GSAP Canvas Scrubbing
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#hero-sequence",
            start: "top top",
            end: "+=300%",
            scrub: 0.5, // 0.5 gives a slight smooth delay to the scroll
            pin: true,
            onUpdate: (self) => {
                if (!hasRevealed && self.progress <= 0.01) {
                    showTopbar();
                } else if (!hasRevealed && self.progress > 0.02) {
                    hideTopbarDuringSequence();
                }
            },
            onLeave: () => {
                if (!hasRevealed) {
                    playRevealAnimation();
                }
            },
            onEnterBack: () => {
                if (hasRevealed) {
                    hideRevealAnimation();
                }
                hideTopbarDuringSequence();
            },
            onLeaveBack: () => {
                showTopbar();
            }
        }
    });

    // Animate frames
    tl.to(imageSeq, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        onUpdate: render
    });
}

function playRevealAnimation() {
    hasRevealed = true;
    uiContainer.classList.add("is-active");
    uiContainer.style.pointerEvents = "auto";
    showTopbar();

    gsap.killTweensOf([headline, ...buttons]);

    // Step 1: Arabic brand message appears.
    gsap.fromTo(
        headline,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.2 }
    );

    // Step 2: Buttons appear after headline.
    gsap.fromTo(
        buttons,
        { opacity: 0, y: 16, scale: 0.98 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.65,
            stagger: 0.12,
            ease: "power2.out",
            delay: 0.9
        }
    );
}

function hideRevealAnimation() {
    hasRevealed = false;
    uiContainer.style.pointerEvents = "none";

    gsap.killTweensOf([headline, ...buttons]);
    gsap.set([headline, ...buttons], {
        opacity: 0,
        y: 14,
        scale: 1
    });

    uiContainer.classList.remove("is-active");
    hideTopbarDuringSequence();
}

function encodedPath(path) {
    return encodeURI(path);
}

function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add("is-open");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove("is-open");
    modalEl.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal-overlay.is-open")) {
        document.body.style.overflow = "";
    }
}

let currentMenuData = null;
let currentMenuPage = 1;

function openMenuWithImages(menu) {
    currentMenuData = menu;
    currentMenuPage = 1;
    displayMenuPage(1);
    
    // Setup pagination buttons (both top and bottom)
    const prevBtn = document.getElementById("menu-prev");
    const nextBtn = document.getElementById("menu-next");
    const prevBtnTop = document.getElementById("menu-prev-top");
    const nextBtnTop = document.getElementById("menu-next-top");
    
    const handlePrevClick = () => {
        if (currentMenuPage > 1) {
            displayMenuPage(currentMenuPage - 1);
        }
    };
    
    const handleNextClick = () => {
        if (currentMenuPage < menu.pages) {
            displayMenuPage(currentMenuPage + 1);
        }
    };
    
    // Bind click handlers to both button sets
    prevBtn.onclick = handlePrevClick;
    nextBtn.onclick = handleNextClick;
    prevBtnTop.onclick = handlePrevClick;
    nextBtnTop.onclick = handleNextClick;
}

function displayMenuPage(pageNum) {
    currentMenuPage = pageNum;
    const menuImage = document.getElementById("menu-image");
    const pageCounter = document.getElementById("menu-page-counter");
    const pageCounterTop = document.getElementById("menu-page-counter-top");
    
    const pageStr = String(pageNum).padStart(4, '0');
    const imagePath = `${currentMenuData.folder}/${currentMenuData.menuName}_page-${pageStr}.jpg`;
    
    menuImage.src = imagePath;
    pageCounter.textContent = `${pageNum} / ${currentMenuData.pages}`;
    pageCounterTop.textContent = `${pageNum} / ${currentMenuData.pages}`;
}

function createMenuCards() {
    menuCardsRoot.innerHTML = "";
    menuData.forEach((menu) => {
        const card = document.createElement("article");
        card.className = "menu-card";
        card.innerHTML = `
            <p class="menu-card-region">${menu.region}</p>
            <h3 class="menu-card-title">${menu.title}</h3>
            <p class="menu-card-note">${menu.note}</p>
        `;

        card.addEventListener("click", () => {
            menuModalTitle.textContent = menu.title;
            openMenuWithImages(menu);
            openModal(menuModal);
        });

        menuCardsRoot.appendChild(card);
    });
}

function createSignatureCards() {
    signatureTrack.innerHTML = "";
    signatureItems.forEach((item) => {
        const autoplayAttr = performanceMode === "full" ? "autoplay" : "";
        const card = document.createElement("article");
        card.className = "signature-card";
        card.innerHTML = `
            <div class="signature-media">
                <video ${autoplayAttr} muted loop playsinline preload="metadata" aria-label="${item.name}">
                    <source src="${encodedPath(item.video)}" type="video/mp4">
                </video>
            </div>
            <div class="signature-body">
                <h3 class="signature-name">${item.name}</h3>
                <p class="signature-desc">${item.desc}</p>
            </div>
        `;
        const videoEl = card.querySelector("video");
        registerSmartVideo(videoEl);
        signatureTrack.appendChild(card);
    });
}

function getLocationCandidates(folder) {
    const candidates = locationImageCandidates.map((name) => `${locationBase}/${folder}/${name}`);
    const overrideImage = locationImagePriorityOverrides[folder];
    if (overrideImage) {
        candidates.unshift(`${locationBase}/${folder}/${overrideImage}`);
    }
    return candidates;
}

function setSmartImage(imgEl, candidates) {
    let index = 0;
    const tryNext = () => {
        if (index >= candidates.length) {
            imgEl.removeAttribute("src");
            imgEl.style.background = "linear-gradient(160deg, #151519, #0e0e10)";
            return;
        }
        imgEl.src = encodedPath(candidates[index]);
        index += 1;
    };

    imgEl.onerror = tryNext;
    tryNext();
}

function parseTextToHTML(text) {
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    return lines.map((line) => {
        const cleaned = line
            .replace(/<[^>]*>/g, " ")
            .replace(/\b(target|rel|href)\s*=\s*["'][^"']*["']/gi, " ")
            .replace(/[<>"']/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        if (!cleaned) return "";

        const urlMatch = line.match(/https?:\/\/[^\s"'<>]+/i) || cleaned.match(/https?:\/\/[^\s"'<>]+/i);
        if (urlMatch) {
            const url = urlMatch[0];
            const label = cleaned;
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
        }
        return `<p>${cleaned}</p>`;
    }).filter(Boolean).join("");
}

function extractBranchMeta(rawText) {
    const urlMatch = rawText.match(/https?:\/\/[^\s]+/i);
    const phoneMatch = rawText.match(/\b0\d{10}\b/);
    const coordMatch = rawText.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);

    const url = urlMatch ? urlMatch[0] : null;
    const phone = phoneMatch ? phoneMatch[0] : null;
    const coords = coordMatch ? `${coordMatch[1]},${coordMatch[2]}` : null;
    const mapLink = url || (coords ? `https://www.google.com/maps?q=${encodeURIComponent(coords)}` : null);

    return { url, phone, coords, mapLink };
}

function createGoogleIcon() {
    return `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17.1 3.2 14.8 2.2 12 2.2A9.8 9.8 0 0 0 2.2 12c0 5.4 4.4 9.8 9.8 9.8 5.7 0 9.5-4 9.5-9.7 0-.7-.1-1.3-.2-1.9H12z"/>
            <path fill="#34A853" d="M2.2 7.7l3.2 2.3A6 6 0 0 1 12 6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17.1 3.2 14.8 2.2 12 2.2a9.8 9.8 0 0 0-9.8 5.5z"/>
            <path fill="#FBBC05" d="M12 21.8c2.7 0 5-1 6.6-2.7l-3-2.5c-.8.5-1.8.9-3.6.9-2.8 0-5.1-1.9-5.9-4.4l-3.2 2.5a9.8 9.8 0 0 0 9.1 6.2z"/>
            <path fill="#4285F4" d="M21.5 12.1c0-.7-.1-1.3-.2-1.9H12v3.9h5.5c-.3 1.6-1.3 2.7-2.4 3.4l3 2.5c1.7-1.6 3.4-4 3.4-7.9z"/>
        </svg>
    `;
}

function buildQuickActions(meta) {
    if (!meta.mapLink && !meta.phone) return "";

    const actions = [];
    if (meta.mapLink) {
        actions.push(`
            <a class="quick-action quick-action-map" href="${meta.mapLink}" target="_blank" rel="noopener noreferrer">
                <span class="quick-action-icon">${createGoogleIcon()}</span>
                <span>${t("location_modal.open_in_google_maps", "Open in Google Maps")}</span>
            </a>
        `);
    }

    if (meta.phone) {
        actions.push(`
            <a class="quick-action quick-action-call" href="tel:${meta.phone}">
                <span class="quick-action-icon">☎</span>
                <span>${t("location_modal.call_prefix", "Call")} ${meta.phone}</span>
            </a>
        `);
    }

    return `<div class="location-quick-actions">${actions.join("")}</div>`;
}

async function fetchTextIfExists(path) {
    try {
        const response = await fetch(encodedPath(path));
        if (!response.ok) return null;
        const text = await response.text();
        return text.trim() ? text : null;
    } catch (error) {
        return null;
    }
}

async function openLocationDetails(location) {
    locationModalTitle.textContent = `${location.name} ${t("location_modal.branch_title_suffix", "Branch")}`;
    locationGallery.innerHTML = "";
    locationDetails.innerHTML = `<p>${t("location_modal.loading_branch_details", "Loading branch details...")}</p>`;

    const candidates = getLocationCandidates(location.folder);
    candidates.forEach((candidatePath) => {
        const img = document.createElement("img");
        img.src = encodedPath(candidatePath);
        img.alt = formatTemplate(t("image_alt_text.location_branch_image_template", "{branch_name} branch"), { branch_name: location.name });
        img.loading = "lazy";
        img.onerror = () => {
            img.remove();
        };
        locationGallery.appendChild(img);
    });

    const textBlocks = [];
    const metaCollection = [];
    for (const fileName of locationTextCandidates) {
        const fullPath = `${locationBase}/${location.folder}/${fileName}`;
        const text = await fetchTextIfExists(fullPath);
        if (text) {
            metaCollection.push(extractBranchMeta(text));
            textBlocks.push(parseTextToHTML(text));
        }
    }

    if (!locationGallery.children.length) {
        locationGallery.innerHTML = `<p>${t("location_modal.no_location_images", "No location images found for this branch.")}</p>`;
    }

    const mergedMeta = metaCollection.reduce((acc, meta) => ({
        mapLink: acc.mapLink || meta.mapLink,
        phone: acc.phone || meta.phone,
        coords: acc.coords || meta.coords
    }), { mapLink: null, phone: null, coords: null });

    const fallbackMeta = locationFallbackMeta[location.folder] || {};
    const finalMeta = {
        mapLink: mergedMeta.mapLink || fallbackMeta.mapLink || null,
        phone: mergedMeta.phone || fallbackMeta.phone || null,
        coords: mergedMeta.coords || fallbackMeta.coords || null
    };

    if (!textBlocks.length && (finalMeta.coords || finalMeta.mapLink || finalMeta.phone)) {
        const fallbackLines = [];
        if (finalMeta.coords) fallbackLines.push(`<p>${finalMeta.coords}</p>`);
        if (finalMeta.mapLink) {
            fallbackLines.push(`<a href="${finalMeta.mapLink}" target="_blank" rel="noopener noreferrer">${finalMeta.mapLink}</a>`);
        }
        if (finalMeta.phone) fallbackLines.push(`<p>${finalMeta.phone}</p>`);
        textBlocks.push(fallbackLines.join(""));
    }

    if (textBlocks.length) {
        locationDetails.innerHTML = buildQuickActions(finalMeta) + textBlocks.join("<hr>");
    } else {
        locationDetails.innerHTML = `<p>${t("location_modal.details_updating", "Location details are being updated. Please call to get exact directions.")}</p>`;
    }

    openModal(locationModal);
}

function createLocationCards() {
    locationsGrid.innerHTML = "";
    locationData.forEach((location) => {
        const card = document.createElement("article");
        card.className = "location-card";

        const img = document.createElement("img");
        img.alt = formatTemplate(t("image_alt_text.location_branch_image_template", "{branch_name} branch"), { branch_name: location.name });
        img.loading = "lazy";
        setSmartImage(img, getLocationCandidates(location.folder));

        const label = document.createElement("div");
        label.className = "location-card-label";
        label.innerHTML = `
            <p class="location-name">${location.name}</p>
            <p class="location-city">${location.city}</p>
        `;

        card.appendChild(img);
        card.appendChild(label);
        card.addEventListener("click", () => {
            openLocationDetails(location);
        });
        locationsGrid.appendChild(card);
    });
}

function openLightbox(mediaPath) {
    lightboxContent.innerHTML = "";
    const isVideo = mediaPath.toLowerCase().endsWith(".mp4");

    if (isVideo) {
        const video = document.createElement("video");
        video.src = encodedPath(`${galleryBase}/${mediaPath}`);
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        lightboxContent.appendChild(video);
    } else {
        const image = document.createElement("img");
        image.src = encodedPath(`${galleryBase}/${mediaPath}`);
        image.alt = t("image_alt_text.social_media_image_alt", "99GRILL social media");
        lightboxContent.appendChild(image);
    }

    openModal(lightboxModal);
}

function createSocialGallery() {
    socialGrid.innerHTML = "";
    socialMedia.forEach((fileName) => {
        const isVideo = fileName.toLowerCase().endsWith(".mp4");
        const tile = document.createElement("article");
        tile.className = "social-item";

        if (isVideo) {
            const video = document.createElement("video");
            video.src = encodedPath(`${galleryBase}/${fileName}`);
            video.muted = true;
            video.loop = true;
            video.autoplay = performanceMode === "full";
            video.playsInline = true;
            registerSmartVideo(video);
            tile.appendChild(video);
        } else {
            const image = document.createElement("img");
            image.src = encodedPath(`${galleryBase}/${fileName}`);
            image.alt = t("image_alt_text.gallery_item_alt", "99GRILL gallery item");
            image.loading = "lazy";
            tile.appendChild(image);
        }

        tile.addEventListener("click", () => openLightbox(fileName));
        socialGrid.appendChild(tile);
    });
}

function setupScrollReveal() {
    gsap.utils.toArray(".reveal-section").forEach((section) => {
        gsap.to(section, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
                trigger: section,
                start: "top 86%"
            }
        });
    });
}

function setupNavigation() {
    const scrollBehavior = performanceMode === "lite" ? "auto" : "smooth";

    document.querySelectorAll("a[href^='#']").forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            if (anchor.classList.contains("js-order-now")) {
                event.preventDefault();
                closeMobileMenu();
                openModal(orderModal);
                return;
            }

            const target = anchor.getAttribute("href");
            const targetEl = document.querySelector(target);
            if (!targetEl) return;
            event.preventDefault();
            closeMobileMenu();
            targetEl.scrollIntoView({ behavior: scrollBehavior, block: "start" });
        });
    });

    document.querySelectorAll(".js-scroll-to").forEach((button) => {
        button.addEventListener("click", () => {
            const target = button.dataset.target;
            const targetEl = document.querySelector(target);
            if (!targetEl) return;
            targetEl.scrollIntoView({ behavior: scrollBehavior, block: "start" });
        });
    });

    document.querySelectorAll(".js-order-now").forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
            event.preventDefault();
            closeMobileMenu();
            openModal(orderModal);
        });
    });
}

function closeMobileMenu() {
    if (!mobileNavDrawer || !mobileMenuToggle || !mobileNavBackdrop) return;
    document.body.classList.remove("mobile-nav-open");
    mobileMenuToggle.setAttribute("aria-expanded", "false");
    mobileNavDrawer.setAttribute("aria-hidden", "true");
    mobileNavBackdrop.setAttribute("aria-hidden", "true");
}

function openMobileMenu() {
    if (!mobileNavDrawer || !mobileMenuToggle || !mobileNavBackdrop) return;
    document.body.classList.add("mobile-nav-open");
    mobileMenuToggle.setAttribute("aria-expanded", "true");
    mobileNavDrawer.setAttribute("aria-hidden", "false");
    mobileNavBackdrop.setAttribute("aria-hidden", "false");
}

function setupMobileMenu() {
    if (!mobileMenuToggle || !mobileNavDrawer || !mobileNavBackdrop) return;

    mobileMenuToggle.addEventListener("click", () => {
        if (document.body.classList.contains("mobile-nav-open")) {
            closeMobileMenu();
        } else {
            closeLanguageMenu();
            openMobileMenu();
        }
    });

    mobileNavBackdrop.addEventListener("click", closeMobileMenu);

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) closeMobileMenu();
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMobileMenu();
    });
}

function setupModalEvents() {
    document.querySelectorAll(".modal-close").forEach((button) => {
        button.addEventListener("click", () => {
            const modalId = button.getAttribute("data-close");
            closeModal(document.getElementById(modalId));
        });
    });

    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                closeModal(overlay);
            }
        });
    });

    window.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        document.querySelectorAll(".modal-overlay.is-open").forEach((modal) => closeModal(modal));
    });
}

function closeLanguageMenu() {
    if (!languageMenu || !languageToggle) return;
    languageMenu.classList.remove("is-open");
    languageToggle.classList.remove("is-open");
    languageToggle.setAttribute("aria-expanded", "false");
}

function openLanguageMenu() {
    if (!languageMenu || !languageToggle) return;
    languageMenu.classList.add("is-open");
    languageToggle.classList.add("is-open");
    languageToggle.setAttribute("aria-expanded", "true");
}

function setupLanguageSwitcher() {
    if (!languageToggle || !languageMenu) return;

    languageToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = languageMenu.classList.contains("is-open");
        if (isOpen) {
            closeLanguageMenu();
        } else {
            openLanguageMenu();
        }
    });

    languageMenu.addEventListener("click", async (event) => {
        const option = event.target.closest(".language-option");
        if (!option) return;
        const lang = option.dataset.lang;
        await applyLanguage(lang);
        closeLanguageMenu();
    });

    document.addEventListener("click", (event) => {
        const inside = event.target.closest("#language-switcher");
        if (!inside) closeLanguageMenu();
    });
}

window.addEventListener("scroll", () => {
    if (window.scrollY > 30) {
        topbar.classList.add("is-scrolled");
    } else {
        topbar.classList.remove("is-scrolled");
    }
});

function initPage() {
    createMenuCards();
    createSignatureCards();
    createLocationCards();
    createSocialGallery();
    setupNavigation();
    setupModalEvents();
    setupLanguageSwitcher();
    setupMobileMenu();
    setupScrollReveal();
}

async function bootstrapPage() {
    const savedLanguage = localStorage.getItem("site-language");
    const browserLanguage = (navigator.language || "en").toLowerCase();
    const defaultLanguage = savedLanguage || (browserLanguage.startsWith("ar") ? "ar" : browserLanguage.startsWith("ku") ? "ku" : "en");

    await loadLanguage("en");
    await applyLanguage(defaultLanguage, { rerender: false });
    initPage();
}

bootstrapPage();

