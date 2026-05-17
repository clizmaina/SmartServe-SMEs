/**
 * SmartServe SMEs — Language Switcher
 * Supports: English (en) | Kiswahili (sw)
 * Usage: add data-i18n="key" to any element. Call applyLang() on page load.
 */

const translations = {
  en: {
    /* ── NAV ── */
    "nav.home": "Home",
    "nav.about": "About",
    "nav.services": "Services",
    "nav.contact": "Contact",
    "nav.getstarted": "Get Started →",
    "nav.back": "← Back to Home",

    /* ── INDEX HERO ── */
    "hero.badge": "🇰🇪 Built for Kenyan Entrepreneurs",
    "hero.h1a": "Connecting",
    "hero.h1b": "Small Businesses",
    "hero.h1c": "with More Customers",
    "hero.p": "SmartServe SMEs is Kenya's digital platform for tailors, salons, restaurants, hardware shops, agrovets, cyber cafés and boutiques — helping you manage orders, reach customers, and grow your business online.",
    "hero.btn1": "Start Free Today 🚀",
    "hero.btn2": "Learn More",

    /* ── STATS ── */
    "stats.biz": "Business Types",
    "stats.built": "Kenyan Built",
    "stats.pay": "Payments Ready",
    "stats.online": "Always Online",

    /* ── HOW IT WORKS ── */
    "how.tag": "How It Works",
    "how.title1": "Simple. Fast.",
    "how.title2": "Kenyan.",
    "how.sub": "Whether you're a provider or a customer, getting started takes less than 2 minutes.",
    "how.s1h": "Choose Your Business Type",
    "how.s1p": "Select from tailoring, salon, restaurant, hardware, agrovet, cyber café or boutique.",
    "how.s2h": "Create Your Account",
    "how.s2p": "Sign up in minutes with email verification. Providers pay a small KSh 300/month subscription.",
    "how.s3h": "Connect with Customers",
    "how.s3p": "Customers find and select you. Manage orders, chat, and track deliveries — all in one place.",
    "how.s4h": "Get Paid via M-Pesa",
    "how.s4p": "Receive payments directly through M-Pesa. No cash handling, no delays.",

    /* ── BUSINESSES ── */
    "biz.tag": "Our Business Categories",
    "biz.title1": "Every Kenyan",
    "biz.title2": "Hustle",
    "biz.title3": "Covered",
    "biz.sub": "From Gikomba tailors to Westlands salons — we've built a dashboard for every type of small business.",
    "biz.tailor.h": "Tailors & Designers",
    "biz.tailor.p": "Upload measurements, share design previews, chat with clients and manage garment orders digitally.",
    "biz.salon.h": "Salons & Barbershops",
    "biz.salon.p": "Book appointments, manage your client queue and showcase your styles to attract new customers.",
    "biz.resto.h": "Restaurants & Eateries",
    "biz.resto.p": "Take orders online, manage your menu and keep customers coming back with a professional presence.",
    "biz.boutique.h": "Boutiques & Fashion Shops",
    "biz.boutique.p": "List your products, manage stock, take orders and offer home delivery — all from your dashboard.",
    "biz.agro.h": "Agrovets & Farm Supplies",
    "biz.agro.p": "Connect farmers with your products. Manage inventory and orders for seeds, feeds and chemicals.",
    "biz.hw.h": "Hardware & Building Supplies",
    "biz.hw.p": "Manage your product catalogue, take customer orders and track deliveries for your hardware business.",

    /* ── TESTIMONIALS ── */
    "testi.tag": "What People Say",
    "testi.title1": "Trusted by Kenyan",
    "testi.title2": "Entrepreneurs",

    /* ── CTA ── */
    "cta.h": "Ready to Grow Your Business?",
    "cta.p": "Join hundreds of Kenyan entrepreneurs already using SmartServe SMEs to connect with more customers.",
    "cta.btn": "Get Started — It's Free",

    /* ── FOOTER ── */
    "footer.tagline": "Empowering Kenyan small businesses to connect, grow and thrive in the digital economy.",
    "footer.nav": "Navigate",
    "footer.biztypes": "Business Types",
    "footer.contact": "Contact",
    "footer.copy": "© 2025 SmartServe SMEs. Made with ❤️ in Kenya 🇰🇪",

    /* ── ABOUT ── */
    "about.badge": "🇰🇪 Our Story",
    "about.h1a": "Built for",
    "about.h1b": "Kenyan Hustlers",
    "about.h1c": "by Kenyans",
    "about.hero.p": "SmartServe SMEs was born from a simple observation — Kenya's small business owners are hardworking, talented and resilient. They just needed better digital tools to reach more customers.",
    "about.mission.tag": "Our Mission",
    "about.mission.h1": "Empowering",
    "about.mission.h2": "Small Businesses",
    "about.mission.h3": "to Thrive",
    "about.mission.p1": "SmartServe SMEs is a digital platform dedicated to empowering Kenya's small and medium enterprises. We connect business owners — tailors, salon operators, restaurant owners, hardware dealers, agrovets, cyber cafés and boutiques — with customers who need their services.",
    "about.mission.p2": "We believe that every mama mboga, every fundi, every salon owner deserves the same digital tools that big companies use. Our platform is affordable, simple to use, and built specifically for the Kenyan market — with M-Pesa payments, Swahili-friendly design, and local business workflows.",
    "about.mission.p3": "Our mission is to walk with entrepreneurs through every stage of their business journey — transforming small steps into great success.",
    "about.values.tag": "What We Stand For",
    "about.values.h": "Our",
    "about.values.h2": "Core Values",
    "about.val1.h": "Community First",
    "about.val1.p": "We build for the Kenyan community — understanding local needs, local languages and local business culture.",
    "about.val2.h": "Simple Innovation",
    "about.val2.p": "Technology should make life easier, not harder. Every feature we build is designed to be used by anyone with a smartphone.",
    "about.val3.h": "Trust & Security",
    "about.val3.p": "Your business data and customer information is protected. We use secure authentication and encrypted communications.",
    "about.val4.h": "Growth Focused",
    "about.val4.p": "Every tool on our platform is designed with one goal — helping your business get more customers and earn more money.",
    "about.story.tag": "The Story",
    "about.story.h1": "From",
    "about.story.h2": "Kenyan Streets",
    "about.story.h3": "to Digital Dashboards",
    "about.story.p1": "Kenya has over 7 million small businesses. They operate in markets, along roadsides, in estates and in towns across the country. Most of them rely on word of mouth and physical walk-ins to get customers.",
    "about.story.quote": "\"We asked ourselves — what if a tailor in Gikomba could take orders from a customer in Westlands without them ever meeting? What if a salon in Kisumu could manage bookings from a phone? That's why we built SmartServe SMEs.\"",
    "about.story.p2": "Today, SmartServe SMEs gives every small business owner a professional digital presence — a dashboard to manage customers, orders, payments and deliveries — all in one place, for just KSh 300 a month.",
    "about.cta.h": "Join the SmartServe Community",
    "about.cta.p": "Register your business today and start connecting with more customers across Kenya.",
    "about.cta.btn": "Register Your Business →",

    /* ── CONTACT ── */
    "contact.badge": "📞 Get in Touch",
    "contact.h1a": "We're Here to",
    "contact.h1b": "Help You Grow",
    "contact.hero.p": "Have a question about SmartServe SMEs? Want to register your business? We'd love to hear from you — reach out any time.",
    "contact.info.tag": "Contact Details",
    "contact.info.h1": "Talk to",
    "contact.info.h2": "Our Team",
    "contact.info.p": "We're a Kenyan team and we understand the hustle. Whether you need help setting up your business, have a technical issue, or just want to learn more — we're ready to help.",
    "contact.phone.lbl": "Phone / WhatsApp",
    "contact.email.lbl": "Email",
    "contact.loc.lbl": "Location",
    "contact.loc.val": "Nyeri, Kenya",
    "contact.hours.lbl": "Working Hours",
    "contact.hours.val": "Mon – Sat: 8:00 AM – 7:00 PM",
    "contact.form.h": "Send Us a Message",
    "contact.form.p": "Fill in the form below and we'll get back to you within 24 hours.",
    "contact.fname": "First Name",
    "contact.lname": "Last Name",
    "contact.email": "Email Address",
    "contact.phone": "Phone Number",
    "contact.biz": "Business Type (if applicable)",
    "contact.msg": "Your Message",
    "contact.send": "📨 Send Message",
    "contact.faq.tag": "Common Questions",
    "contact.faq.h1": "Frequently Asked",
    "contact.faq.h2": "Questions",
    "contact.faq1.q": "How much does it cost to register?",
    "contact.faq1.a": "Customers sign up completely free. Business providers pay KSh 300 per month — that's less than KSh 10 per day.",
    "contact.faq2.q": "How do I receive payments?",
    "contact.faq2.a": "Payments are collected via M-Pesa directly to your till number. No bank account required.",
    "contact.faq3.q": "Do I need a computer to use SmartServe?",
    "contact.faq3.a": "No — the platform works on any smartphone browser. No app download needed.",
    "contact.faq4.q": "Can I manage multiple business types?",
    "contact.faq4.a": "Yes — you can create separate accounts for different business types using the same email address.",
    "contact.faq5.q": "Is my customer data safe?",
    "contact.faq5.a": "Yes. We use secure authentication, encrypted sessions and never share your data with third parties.",
    "contact.faq6.q": "How do I get started?",
    "contact.faq6.a": "Click \"Get Started\", choose your business type, sign up with your email and pay via M-Pesa. Takes under 5 minutes.",
    "contact.cta.h": "Ready to Join SmartServe SMEs?",
    "contact.cta.p": "Register your business today and start connecting with more customers across Kenya.",
    "contact.cta.btn": "Get Started — It's Free →",

    /* ── BUSINESS SELECT ── */
    "select.badge": "🇰🇪 Get Started",
    "select.h1a": "What Kind of",
    "select.h1b": "Business",
    "select.h1c": "Are You?",
    "select.p": "Choose your business category below. We'll set up the right dashboard for you — whether you're a provider or a customer.",
    "select.card.title": "Select Your Business Type",
    "select.card.sub": "Tap the category that best describes your business or what you're looking for",
    "select.trust1": "Secure signup",
    "select.trust2": "M-Pesa payments",
    "select.trust3": "Made in Kenya",
    "select.trust4": "Ready in 2 minutes",
    "select.footer": "Already have an account?",
    "select.signin": "Sign in here",
    "select.backhome": "Back to Home",
    "select.continue": "Continue"
  },

  sw: {
    /* ── NAV ── */
    "nav.home": "Nyumbani",
    "nav.about": "Kuhusu",
    "nav.services": "Huduma",
    "nav.contact": "Wasiliana",
    "nav.getstarted": "Anza Sasa →",
    "nav.back": "← Rudi Nyumbani",

    /* ── INDEX HERO ── */
    "hero.badge": "🇰🇪 Imejengwa kwa Wajasiriamali wa Kenya",
    "hero.h1a": "Kuunganisha",
    "hero.h1b": "Biashara Ndogo",
    "hero.h1c": "na Wateja Zaidi",
    "hero.p": "SmartServe SMEs ni jukwaa la kidijitali la Kenya kwa mafundi, saluni, migahawa, maduka ya vifaa, agrovets, cyber cafés na boutiques — kukusaidia kusimamia maagizo, kufikia wateja, na kukuza biashara yako mtandaoni.",
    "hero.btn1": "Anza Bure Leo 🚀",
    "hero.btn2": "Jifunze Zaidi",

    /* ── STATS ── */
    "stats.biz": "Aina za Biashara",
    "stats.built": "Imejengwa Kenya",
    "stats.pay": "Malipo Tayari",
    "stats.online": "Mtandaoni 24/7",

    /* ── HOW IT WORKS ── */
    "how.tag": "Jinsi Inavyofanya Kazi",
    "how.title1": "Rahisi. Haraka.",
    "how.title2": "Kikenyan.",
    "how.sub": "Iwe wewe ni mtoa huduma au mteja, kuanza kunachukua chini ya dakika 2.",
    "how.s1h": "Chagua Aina ya Biashara",
    "how.s1p": "Chagua kati ya ushonaji, saluni, mgahawa, vifaa, agrovet, cyber café au boutique.",
    "how.s2h": "Fungua Akaunti Yako",
    "how.s2p": "Jisajili kwa dakika chache kwa uthibitisho wa barua pepe. Watoa huduma wanalipa KSh 300/mwezi.",
    "how.s3h": "Unganika na Wateja",
    "how.s3p": "Wateja wanakupata na kukuchagua. Simamia maagizo, piga gumzo, na fuatilia utoaji — mahali pamoja.",
    "how.s4h": "Pokea Malipo kwa M-Pesa",
    "how.s4p": "Pokea malipo moja kwa moja kupitia M-Pesa. Hakuna fedha taslimu, hakuna ucheleweshaji.",

    /* ── BUSINESSES ── */
    "biz.tag": "Aina za Biashara Zetu",
    "biz.title1": "Kila",
    "biz.title2": "Hustle",
    "biz.title3": "ya Kenya Imefunikwa",
    "biz.sub": "Kutoka kwa mafundi wa Gikomba hadi saluni za Westlands — tumejenga dashibodi kwa kila aina ya biashara ndogo.",
    "biz.tailor.h": "Mafundi na Wabunifu",
    "biz.tailor.p": "Pakia vipimo, shiriki mifano ya muundo, piga gumzo na wateja na simamia maagizo ya nguo kidijitali.",
    "biz.salon.h": "Saluni na Kinyozi",
    "biz.salon.p": "Weka miadi, simamia foleni ya wateja na onyesha mitindo yako ili kuvutia wateja wapya.",
    "biz.resto.h": "Migahawa na Vyakula",
    "biz.resto.p": "Pokea maagizo mtandaoni, simamia menyu yako na weka wateja wakiendelea kurudi.",
    "biz.boutique.h": "Boutiques na Maduka ya Mitindo",
    "biz.boutique.p": "Orodhesha bidhaa zako, simamia hisa, pokea maagizo na toa utoaji wa nyumbani — kutoka dashibodi yako.",
    "biz.agro.h": "Agrovets na Vifaa vya Kilimo",
    "biz.agro.p": "Unganisha wakulima na bidhaa zako. Simamia hisa na maagizo ya mbegu, chakula cha mifugo na kemikali.",
    "biz.hw.h": "Vifaa vya Ujenzi",
    "biz.hw.p": "Simamia katalogi ya bidhaa, pokea maagizo ya wateja na fuatilia utoaji kwa biashara yako ya vifaa.",

    /* ── TESTIMONIALS ── */
    "testi.tag": "Wanachosema Watu",
    "testi.title1": "Wanaoamini",
    "testi.title2": "Wajasiriamali wa Kenya",

    /* ── CTA ── */
    "cta.h": "Uko Tayari Kukuza Biashara Yako?",
    "cta.p": "Jiunge na mamia ya wajasiriamali wa Kenya wanaotumia SmartServe SMEs kuunganika na wateja zaidi.",
    "cta.btn": "Anza Sasa — Ni Bure",

    /* ── FOOTER ── */
    "footer.tagline": "Kuwezesha biashara ndogo za Kenya kuunganika, kukua na kustawi katika uchumi wa kidijitali.",
    "footer.nav": "Viungo",
    "footer.biztypes": "Aina za Biashara",
    "footer.contact": "Wasiliana",
    "footer.copy": "© 2025 SmartServe SMEs. Imetengenezwa kwa ❤️ Kenya 🇰🇪",

    /* ── ABOUT ── */
    "about.badge": "🇰🇪 Hadithi Yetu",
    "about.h1a": "Imejengwa kwa",
    "about.h1b": "Wahusika wa Kenya",
    "about.h1c": "na Wakenya",
    "about.hero.p": "SmartServe SMEs ilizaliwa kutoka kwa uchunguzi rahisi — wamiliki wa biashara ndogo za Kenya ni wachapakazi, wenye vipaji na imara. Walihitaji tu zana bora za kidijitali kufikia wateja zaidi.",
    "about.mission.tag": "Dhamira Yetu",
    "about.mission.h1": "Kuwezesha",
    "about.mission.h2": "Biashara Ndogo",
    "about.mission.h3": "Kustawi",
    "about.mission.p1": "SmartServe SMEs ni jukwaa la kidijitali lililoundwa kuwezesha biashara ndogo na za kati za Kenya. Tunaunganisha wamiliki wa biashara — mafundi, waendeshaji wa saluni, wamiliki wa migahawa, wauza vifaa, agrovets, cyber cafés na boutiques — na wateja wanaohitaji huduma zao.",
    "about.mission.p2": "Tunaamini kwamba kila mama mboga, kila fundi, kila mwenye saluni anastahili zana sawa za kidijitali ambazo makampuni makubwa yanatumia. Jukwaa letu ni la bei nafuu, rahisi kutumia, na limejengwa mahsusi kwa soko la Kenya — na malipo ya M-Pesa, muundo wa Kiswahili, na mtiririko wa biashara wa ndani.",
    "about.mission.p3": "Dhamira yetu ni kutembea na wajasiriamali katika kila hatua ya safari yao ya biashara — kubadilisha hatua ndogo kuwa mafanikio makubwa.",
    "about.values.tag": "Tunachosimama Nacho",
    "about.values.h": "Maadili",
    "about.values.h2": "Yetu Makuu",
    "about.val1.h": "Jamii Kwanza",
    "about.val1.p": "Tunajenga kwa jamii ya Kenya — kuelewa mahitaji ya ndani, lugha za ndani na utamaduni wa biashara wa ndani.",
    "about.val2.h": "Uvumbuzi Rahisi",
    "about.val2.p": "Teknolojia inapaswa kurahisisha maisha, si kuifanya ngumu zaidi. Kila kipengele tunachojenga kimeundwa kutumika na mtu yeyote mwenye simu.",
    "about.val3.h": "Uaminifu na Usalama",
    "about.val3.p": "Data ya biashara yako na taarifa za wateja zinalindwa. Tunatumia uthibitisho salama na mawasiliano yaliyosimbwa.",
    "about.val4.h": "Kuzingatia Ukuaji",
    "about.val4.p": "Kila zana kwenye jukwaa letu imeundwa kwa lengo moja — kusaidia biashara yako kupata wateja zaidi na kupata pesa zaidi.",
    "about.story.tag": "Hadithi",
    "about.story.h1": "Kutoka",
    "about.story.h2": "Mitaa ya Kenya",
    "about.story.h3": "hadi Dashibodi za Kidijitali",
    "about.story.p1": "Kenya ina zaidi ya biashara ndogo milioni 7. Zinafanya kazi katika masoko, kando ya barabara, katika makazi na katika miji kote nchini. Nyingi yao zinategemea mdomo kwa mdomo na wateja wanaoingia kimwili.",
    "about.story.quote": "\"Tulijiuliza — je, fundi wa Gikomba angeweza kupokea maagizo kutoka kwa mteja wa Westlands bila kukutana? Je, saluni ya Kisumu ingeweza kusimamia miadi kutoka simu? Ndiyo maana tulijenga SmartServe SMEs.\"",
    "about.story.p2": "Leo, SmartServe SMEs inawapa kila mwenye biashara ndogo uwepo wa kitaalamu wa kidijitali — dashibodi ya kusimamia wateja, maagizo, malipo na utoaji — mahali pamoja, kwa KSh 300 tu kwa mwezi.",
    "about.cta.h": "Jiunge na Jamii ya SmartServe",
    "about.cta.p": "Sajili biashara yako leo na uanze kuunganika na wateja zaidi kote Kenya.",
    "about.cta.btn": "Sajili Biashara Yako →",

    /* ── CONTACT ── */
    "contact.badge": "📞 Wasiliana Nasi",
    "contact.h1a": "Tuko Hapa",
    "contact.h1b": "Kukusaidia Kukua",
    "contact.hero.p": "Una swali kuhusu SmartServe SMEs? Unataka kusajili biashara yako? Tungependa kusikia kutoka kwako — wasiliana wakati wowote.",
    "contact.info.tag": "Maelezo ya Mawasiliano",
    "contact.info.h1": "Zungumza na",
    "contact.info.h2": "Timu Yetu",
    "contact.info.p": "Sisi ni timu ya Kenya na tunaelewa hustle. Iwe unahitaji msaada wa kuanzisha biashara yako, una tatizo la kiufundi, au unataka kujifunza zaidi — tuko tayari kusaidia.",
    "contact.phone.lbl": "Simu / WhatsApp",
    "contact.email.lbl": "Barua Pepe",
    "contact.loc.lbl": "Mahali",
    "contact.loc.val": "Nyeri, Kenya",
    "contact.hours.lbl": "Masaa ya Kazi",
    "contact.hours.val": "Jumatatu – Jumamosi: 8:00 AM – 7:00 PM",
    "contact.form.h": "Tutumie Ujumbe",
    "contact.form.p": "Jaza fomu hapa chini na tutawasiliana nawe ndani ya masaa 24.",
    "contact.fname": "Jina la Kwanza",
    "contact.lname": "Jina la Ukoo",
    "contact.email": "Anwani ya Barua Pepe",
    "contact.phone": "Nambari ya Simu",
    "contact.biz": "Aina ya Biashara (kama inafaa)",
    "contact.msg": "Ujumbe Wako",
    "contact.send": "📨 Tuma Ujumbe",
    "contact.faq.tag": "Maswali ya Kawaida",
    "contact.faq.h1": "Maswali",
    "contact.faq.h2": "Yanayoulizwa Mara Kwa Mara",
    "contact.faq1.q": "Ni bei gani ya kusajili?",
    "contact.faq1.a": "Wateja wanajisajili bure kabisa. Watoa huduma wanalipa KSh 300 kwa mwezi — hiyo ni chini ya KSh 10 kwa siku.",
    "contact.faq2.q": "Ninapokeaje malipo?",
    "contact.faq2.a": "Malipo yanakusanywa kupitia M-Pesa moja kwa moja kwenye nambari yako ya till. Hakuna akaunti ya benki inayohitajika.",
    "contact.faq3.q": "Je, ninahitaji kompyuta kutumia SmartServe?",
    "contact.faq3.a": "Hapana — jukwaa linafanya kazi kwenye kivinjari chochote cha simu. Hakuna upakuaji wa programu unaohitajika.",
    "contact.faq4.q": "Je, ninaweza kusimamia aina nyingi za biashara?",
    "contact.faq4.a": "Ndiyo — unaweza kuunda akaunti tofauti kwa aina tofauti za biashara ukitumia anwani moja ya barua pepe.",
    "contact.faq5.q": "Je, data ya wateja wangu iko salama?",
    "contact.faq5.a": "Ndiyo. Tunatumia uthibitisho salama, vikao vilivyosimbwa na hatuchangudui data yako na watu wengine.",
    "contact.faq6.q": "Ninaanzaje?",
    "contact.faq6.a": "Bonyeza \"Anza Sasa\", chagua aina ya biashara yako, jisajili kwa barua pepe yako na lipa kupitia M-Pesa. Inachukua chini ya dakika 5.",
    "contact.cta.h": "Uko Tayari Kujiunga na SmartServe SMEs?",
    "contact.cta.p": "Sajili biashara yako leo na uanze kuunganika na wateja zaidi kote Kenya.",
    "contact.cta.btn": "Anza Sasa — Ni Bure →",

    /* ── BUSINESS SELECT ── */
    "select.badge": "🇰🇪 Anza Sasa",
    "select.h1a": "Ni Aina Gani ya",
    "select.h1b": "Biashara",
    "select.h1c": "Unayo?",
    "select.p": "Chagua kategoria ya biashara yako hapa chini. Tutaanzisha dashibodi sahihi kwako — iwe wewe ni mtoa huduma au mteja.",
    "select.card.title": "Chagua Aina ya Biashara Yako",
    "select.card.sub": "Gusa kategoria inayoelezea biashara yako au unachotafuta",
    "select.trust1": "Usajili salama",
    "select.trust2": "Malipo ya M-Pesa",
    "select.trust3": "Imetengenezwa Kenya",
    "select.trust4": "Tayari kwa dakika 2",
    "select.footer": "Una akaunti tayari?",
    "select.signin": "Ingia hapa",
    "select.backhome": "Rudi Nyumbani",
    "select.continue": "Endelea"
  }
};

/* ─────────────────────────────────────────────
   ENGINE — applies translations to the page
───────────────────────────────────────────── */

function applyLang(lang) {
  const t = translations[lang] || translations.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (!t[key]) return;
    // Inputs/textareas: update placeholder
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t[key];
    } else {
      el.textContent = t[key];
    }
  });
  // Update html lang attribute
  document.documentElement.lang = lang === 'sw' ? 'sw' : 'en';
  // Sync all switchers on the page
  document.querySelectorAll('.lang-select').forEach(sel => { sel.value = lang; });
  // Persist
  localStorage.setItem('ss_lang', lang);
}

function changeLanguage(lang) {
  applyLang(lang);
}

// Auto-apply on page load
(function () {
  const saved = localStorage.getItem('ss_lang') || 'en';
  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyLang(saved));
  } else {
    applyLang(saved);
  }
})();

/* ─────────────────────────────────────────────
   EXTRA KEYS — Services & Contact pages
   Appended after initial translations object.
   We merge these into the existing translations.
───────────────────────────────────────────── */
(function() {
  const extra = {
    en: {
      /* Services hero (reuse hero.badge key but override for services page) */
      "svc.hero.badge": "🇰🇪 What We Offer",
      "svc.hero.h1": "Digital Tools for Every Kenyan Hustle",
      "svc.hero.p": "From a tailor in Gikomba to a salon in Kisumu — SmartServe SMEs gives every small business owner a professional digital presence to connect with more customers and grow.",

      /* Services grid */
      "svc.tag": "Our Services",
      "svc.title1": "Everything Your Business",
      "svc.title2": "Needs",
      "svc.sub": "One platform, seven business types, hundreds of features — all designed for the Kenyan market.",

      "svc.tailor.p": "A complete digital studio for bespoke tailors. Manage every order from measurement to delivery.",
      "svc.tailor.li1": "Digital measurement submission",
      "svc.tailor.li2": "Design photo uploads from customers",
      "svc.tailor.li3": "Garment preview sharing",
      "svc.tailor.li4": "Customer chat & order tracking",
      "svc.tailor.li5": "AI fashion assistant for customers",
      "svc.tailor.li6": "Delivery preference management",

      "svc.salon.p": "Let customers book appointments online and manage your schedule from your phone.",
      "svc.salon.li1": "Online appointment booking",
      "svc.salon.li2": "Service menu management",
      "svc.salon.li3": "Customer queue tracking",
      "svc.salon.li4": "M-Pesa payment collection",
      "svc.salon.li5": "Client history & preferences",

      "svc.resto.p": "Take orders online, manage your menu and build a loyal customer base digitally.",
      "svc.resto.li1": "Online menu & ordering",
      "svc.resto.li2": "Table & delivery management",
      "svc.resto.li3": "Daily sales tracking",
      "svc.resto.li4": "Customer reviews & ratings",
      "svc.resto.li5": "M-Pesa payment integration",

      "svc.boutique.p": "List your products, manage stock and offer home delivery — all from one dashboard.",
      "svc.boutique.li1": "Product catalogue with photos",
      "svc.boutique.li2": "Stock & inventory management",
      "svc.boutique.li3": "Order & delivery tracking",
      "svc.boutique.li4": "Customer wishlist feature",
      "svc.boutique.li5": "Fitting appointment booking",

      "svc.agro.p": "Connect farmers with your products and manage agricultural supply orders digitally.",
      "svc.agro.li1": "Product & stock management",
      "svc.agro.li2": "Farmer order management",
      "svc.agro.li3": "Seasonal inventory tracking",
      "svc.agro.li4": "Customer delivery coordination",
      "svc.agro.li5": "M-Pesa payment collection",

      "svc.hw.p": "Manage your product catalogue and take customer orders for building materials and tools.",
      "svc.hw.li1": "Product catalogue management",
      "svc.hw.li2": "Customer order processing",
      "svc.hw.li3": "Delivery tracking",
      "svc.hw.li4": "Stock level monitoring",
      "svc.hw.li5": "M-Pesa payment integration",

      /* Platform features */
      "feat.tag": "Platform Features",
      "feat.title1": "Built for",
      "feat.title2": "Kenya",
      "feat.f1h": "Mobile First",
      "feat.f1p": "Works perfectly on any smartphone — no app download needed.",
      "feat.f2h": "M-Pesa Ready",
      "feat.f2p": "Accept payments via M-Pesa STK push directly from your dashboard.",
      "feat.f3h": "AI Assistant",
      "feat.f3p": "Customers get instant fashion and product advice powered by ChatGPT.",
      "feat.f4h": "Live Chat",
      "feat.f4p": "Communicate directly with customers inside the platform — no WhatsApp needed.",
      "feat.f5h": "Delivery Tracking",
      "feat.f5p": "Manage home delivery and pick-up preferences for every order.",
      "feat.f6h": "Business Dashboard",
      "feat.f6p": "See your orders, earnings, customers and inventory in one clean view.",

      /* Pricing */
      "price.tag": "Simple Pricing",
      "price.title1": "Affordable for",
      "price.title2": "Every Business",
      "price.sub": "No hidden fees. No complicated plans. Just one simple monthly subscription for providers.",
      "price.c1h": "Customer",
      "price.c1period": "Always free",
      "price.c1li1": "Browse all businesses",
      "price.c1li2": "Place orders & book services",
      "price.c1li3": "Chat with providers",
      "price.c1li4": "Track your orders",
      "price.c1li5": "AI fashion assistant",
      "price.c1btn": "Sign Up Free",
      "price.c2h": "Business Provider",
      "price.c2period": "per month",
      "price.c2li1": "Full provider dashboard",
      "price.c2li2": "Unlimited customers",
      "price.c2li3": "Order & delivery management",
      "price.c2li4": "M-Pesa payment collection",
      "price.c2li5": "Inventory management",
      "price.c2li6": "Customer chat & notifications",
      "price.c2btn": "Start Your Business",

      /* Services CTA */
      "svc.cta.h": "Ready to Take Your Business Online?",
      "svc.cta.p": "Join Kenyan entrepreneurs already using SmartServe SMEs to reach more customers every day.",
      "svc.cta.btn": "Get Started — It's Free →",

      /* Contact form extras */
      "contact.msg.placeholder": "Tell us how we can help you…"
    },

    sw: {
      "svc.hero.badge": "🇰🇪 Tunachotoa",
      "svc.hero.h1": "Zana za Kidijitali kwa Kila Hustle ya Kenya",
      "svc.hero.p": "Kutoka kwa fundi wa Gikomba hadi saluni ya Kisumu — SmartServe SMEs inawapa kila mwenye biashara ndogo uwepo wa kitaalamu wa kidijitali kuunganika na wateja zaidi na kukua.",

      "svc.tag": "Huduma Zetu",
      "svc.title1": "Kila Kitu Biashara Yako",
      "svc.title2": "Inachohitaji",
      "svc.sub": "Jukwaa moja, aina saba za biashara, mamia ya vipengele — vyote vimeundwa kwa soko la Kenya.",

      "svc.tailor.p": "Studio kamili ya kidijitali kwa mafundi wa nguo. Simamia kila agizo kutoka kipimo hadi utoaji.",
      "svc.tailor.li1": "Uwasilishaji wa vipimo vya kidijitali",
      "svc.tailor.li2": "Upakiaji wa picha za muundo kutoka kwa wateja",
      "svc.tailor.li3": "Kushiriki mifano ya nguo",
      "svc.tailor.li4": "Gumzo la wateja na ufuatiliaji wa maagizo",
      "svc.tailor.li5": "Msaidizi wa AI wa mitindo kwa wateja",
      "svc.tailor.li6": "Usimamizi wa mapendeleo ya utoaji",

      "svc.salon.p": "Waruhusu wateja kuweka miadi mtandaoni na usimamie ratiba yako kutoka simu yako.",
      "svc.salon.li1": "Kuweka miadi mtandaoni",
      "svc.salon.li2": "Usimamizi wa menyu ya huduma",
      "svc.salon.li3": "Ufuatiliaji wa foleni ya wateja",
      "svc.salon.li4": "Ukusanyaji wa malipo ya M-Pesa",
      "svc.salon.li5": "Historia na mapendeleo ya mteja",

      "svc.resto.p": "Pokea maagizo mtandaoni, simamia menyu yako na jenga msingi wa wateja waaminifu kidijitali.",
      "svc.resto.li1": "Menyu na maagizo mtandaoni",
      "svc.resto.li2": "Usimamizi wa meza na utoaji",
      "svc.resto.li3": "Ufuatiliaji wa mauzo ya kila siku",
      "svc.resto.li4": "Maoni na ukadiriaji wa wateja",
      "svc.resto.li5": "Muunganiko wa malipo ya M-Pesa",

      "svc.boutique.p": "Orodhesha bidhaa zako, simamia hisa na toa utoaji wa nyumbani — kutoka dashibodi moja.",
      "svc.boutique.li1": "Katalogi ya bidhaa na picha",
      "svc.boutique.li2": "Usimamizi wa hisa na hesabu",
      "svc.boutique.li3": "Ufuatiliaji wa maagizo na utoaji",
      "svc.boutique.li4": "Kipengele cha orodha ya matakwa ya mteja",
      "svc.boutique.li5": "Kuweka miadi ya kujaribu nguo",

      "svc.agro.p": "Unganisha wakulima na bidhaa zako na simamia maagizo ya vifaa vya kilimo kidijitali.",
      "svc.agro.li1": "Usimamizi wa bidhaa na hisa",
      "svc.agro.li2": "Usimamizi wa maagizo ya wakulima",
      "svc.agro.li3": "Ufuatiliaji wa hesabu ya msimu",
      "svc.agro.li4": "Uratibu wa utoaji kwa wateja",
      "svc.agro.li5": "Ukusanyaji wa malipo ya M-Pesa",

      "svc.hw.p": "Simamia katalogi ya bidhaa na pokea maagizo ya wateja kwa vifaa vya ujenzi na zana.",
      "svc.hw.li1": "Usimamizi wa katalogi ya bidhaa",
      "svc.hw.li2": "Usindikaji wa maagizo ya wateja",
      "svc.hw.li3": "Ufuatiliaji wa utoaji",
      "svc.hw.li4": "Ufuatiliaji wa kiwango cha hisa",
      "svc.hw.li5": "Muunganiko wa malipo ya M-Pesa",

      "feat.tag": "Vipengele vya Jukwaa",
      "feat.title1": "Imejengwa kwa",
      "feat.title2": "Kenya",
      "feat.f1h": "Simu Kwanza",
      "feat.f1p": "Inafanya kazi vizuri kwenye simu yoyote — hakuna upakuaji wa programu unaohitajika.",
      "feat.f2h": "M-Pesa Tayari",
      "feat.f2p": "Pokea malipo kupitia M-Pesa STK push moja kwa moja kutoka dashibodi yako.",
      "feat.f3h": "Msaidizi wa AI",
      "feat.f3p": "Wateja wanapata ushauri wa haraka wa mitindo na bidhaa unaotolewa na ChatGPT.",
      "feat.f4h": "Gumzo la Moja kwa Moja",
      "feat.f4p": "Wasiliana moja kwa moja na wateja ndani ya jukwaa — hakuna WhatsApp inayohitajika.",
      "feat.f5h": "Ufuatiliaji wa Utoaji",
      "feat.f5p": "Simamia mapendeleo ya utoaji wa nyumbani na kuchukua kwa kila agizo.",
      "feat.f6h": "Dashibodi ya Biashara",
      "feat.f6p": "Ona maagizo yako, mapato, wateja na hesabu katika mtazamo mmoja safi.",

      "price.tag": "Bei Rahisi",
      "price.title1": "Bei Nafuu kwa",
      "price.title2": "Kila Biashara",
      "price.sub": "Hakuna ada zilizofichwa. Hakuna mipango ngumu. Usajili mmoja rahisi wa kila mwezi kwa watoa huduma.",
      "price.c1h": "Mteja",
      "price.c1period": "Bure daima",
      "price.c1li1": "Vinjari biashara zote",
      "price.c1li2": "Weka maagizo na uhifadhi huduma",
      "price.c1li3": "Piga gumzo na watoa huduma",
      "price.c1li4": "Fuatilia maagizo yako",
      "price.c1li5": "Msaidizi wa AI wa mitindo",
      "price.c1btn": "Jisajili Bure",
      "price.c2h": "Mtoa Huduma wa Biashara",
      "price.c2period": "kwa mwezi",
      "price.c2li1": "Dashibodi kamili ya mtoa huduma",
      "price.c2li2": "Wateja wasio na kikomo",
      "price.c2li3": "Usimamizi wa maagizo na utoaji",
      "price.c2li4": "Ukusanyaji wa malipo ya M-Pesa",
      "price.c2li5": "Usimamizi wa hesabu",
      "price.c2li6": "Gumzo la wateja na arifa",
      "price.c2btn": "Anza Biashara Yako",

      "svc.cta.h": "Uko Tayari Kupeleka Biashara Yako Mtandaoni?",
      "svc.cta.p": "Jiunge na wajasiriamali wa Kenya wanaotumia SmartServe SMEs kufikia wateja zaidi kila siku.",
      "svc.cta.btn": "Anza Sasa — Ni Bure →",

      "contact.msg.placeholder": "Tuambie jinsi tunavyoweza kukusaidia…"
    }
  };

  // Merge extra keys into the main translations object
  if (typeof translations !== 'undefined') {
    Object.keys(extra).forEach(lang => {
      Object.assign(translations[lang], extra[lang]);
    });
  }
})();

/* ─────────────────────────────────────────────
   AUTH + DASHBOARD KEYS
───────────────────────────────────────────── */
(function() {
  const authKeys = {
    en: {
      /* Sign In */
      "signin.h": "Welcome Back",
      "signin.sub": "Sign in to your SmartServe account",
      "signin.email": "Email Address",
      "signin.email.ph": "Enter your email",
      "signin.password": "Password",
      "signin.pass.ph": "Enter your password",
      "signin.btn": "Login",
      "signin.noaccount": "Don't have an account?",
      "signin.signup": " Sign Up",
      "signin.back": "← Back to business selection",

      /* Sign Up */
      "signup.h": "Create Account",
      "signup.sub": "Join thousands of Kenyan businesses on SmartServe",
      "signup.name": "Full Name",
      "signup.name.ph": "Full Name",
      "signup.email": "Email Address",
      "signup.email.ph": "Email Address",
      "signup.password": "Password",
      "signup.pass.ph": "Password",
      "signup.role": "Sign up as:",
      "signup.role.customer": "Customer",
      "signup.role.provider": "Provider / Designer",
      "signup.sendotp": "Send Verification Code",
      "signup.otp.label": "Enter the 6-digit code sent to your email:",
      "signup.verify": "Verify & Create Account",
      "signup.resend": "Resend code",
      "signup.hasaccount": "Already have an account?",
      "signup.login": " Login"
    },
    sw: {
      /* Sign In */
      "signin.h": "Karibu Tena",
      "signin.sub": "Ingia kwenye akaunti yako ya SmartServe",
      "signin.email": "Anwani ya Barua Pepe",
      "signin.email.ph": "Ingiza barua pepe yako",
      "signin.password": "Nenosiri",
      "signin.pass.ph": "Ingiza nenosiri lako",
      "signin.btn": "Ingia",
      "signin.noaccount": "Huna akaunti?",
      "signin.signup": " Jisajili",
      "signin.back": "← Rudi kuchagua biashara",

      /* Sign Up */
      "signup.h": "Fungua Akaunti",
      "signup.sub": "Jiunge na maelfu ya biashara za Kenya kwenye SmartServe",
      "signup.name": "Jina Kamili",
      "signup.name.ph": "Jina Kamili",
      "signup.email": "Anwani ya Barua Pepe",
      "signup.email.ph": "Anwani ya Barua Pepe",
      "signup.password": "Nenosiri",
      "signup.pass.ph": "Nenosiri",
      "signup.role": "Jisajili kama:",
      "signup.role.customer": "Mteja",
      "signup.role.provider": "Mtoa Huduma / Mbuni",
      "signup.sendotp": "Tuma Nambari ya Uthibitisho",
      "signup.otp.label": "Ingiza nambari ya tarakimu 6 iliyotumwa kwa barua pepe yako:",
      "signup.verify": "Thibitisha na Fungua Akaunti",
      "signup.resend": "Tuma tena nambari",
      "signup.hasaccount": "Una akaunti tayari?",
      "signup.login": " Ingia"
    }
  };

  if (typeof translations !== 'undefined') {
    Object.keys(authKeys).forEach(lang => {
      Object.assign(translations[lang], authKeys[lang]);
    });
  }
})();

/* ─────────────────────────────────────────────
   DASHBOARD FLOATING SWITCHER SUPPORT
   Adds a floating 🌐 button to any page that
   loads lang.js, even if it has no switcher HTML.
   Also handles data-i18n-placeholder attributes.
───────────────────────────────────────────── */
(function() {
  // Extend applyLang to also handle placeholder attributes
  const _orig = window.applyLang;
  window.applyLang = function(lang) {
    if (_orig) _orig(lang);
    const t = translations[lang] || translations.en;
    // Handle data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key]) el.placeholder = t[key];
    });
    // Sync all lang-select dropdowns
    document.querySelectorAll('.lang-select').forEach(sel => { sel.value = lang; });
  };

  // Inject a floating switcher on pages that don't have one (dashboards, etc.)
  document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.lang-float') && !document.querySelector('.lang-switcher')) {
      const div = document.createElement('div');
      div.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.75);border:1px solid rgba(255,255,255,0.25);border-radius:20px;padding:6px 14px;backdrop-filter:blur(8px);box-shadow:0 4px 16px rgba(0,0,0,0.4);';
      div.innerHTML = '<span style="font-size:0.85rem;color:rgba(255,255,255,0.6);">🌐</span><select class="lang-select" onchange="changeLanguage(this.value);setTimeout(()=>applyLang(this.value),350)" style="background:transparent;border:none;color:#fff;font-size:0.82rem;font-weight:600;cursor:pointer;outline:none;font-family:inherit;"><option value="en">English</option><option value="sw">Kiswahili</option></select>';
      document.body.appendChild(div);
      // Sync to saved language
      const saved = localStorage.getItem('ss_lang') || 'en';
      div.querySelector('select').value = saved;
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD TEXT-MAP TRANSLATION ENGINE
   Works on ALL dashboards without needing data-i18n tags.
   Maps exact English strings → Swahili equivalents.
   Applied via DOM text-node walking on language switch.
═══════════════════════════════════════════════════════════════ */
(function () {

  /* ── Full English → Swahili text map ── */
  const swMap = {
    /* ── Sidebar nav ── */
    'Select Designer':           'Chagua Mbuni',
    'Select Customer':           'Chagua Mteja',
    'Upload Design':             'Pakia Muundo',
    'Customer Designs':          'Miundo ya Wateja',
    'Measurements':              'Vipimo',
    'View Previews':             'Tazama Mifano',
    'Chat with Designer':        'Gumzo na Mbuni',
    'Chat with Customer':        'Gumzo na Mteja',
    'Make Payment':              'Fanya Malipo',
    'AI Assistant':              'Msaidizi wa AI',
    'Delivery':                  'Utoaji',
    'Delivery Info':             'Maelezo ya Utoaji',
    'Inventory':                 'Hesabu',
    'Upload Preview':            'Pakia Mfano',
    'Payments':                  'Malipo',
    'Logout':                    'Toka',
    'Overview':                  'Muhtasari',
    'Orders':                    'Maagizo',
    'Delivery Management':       'Usimamizi wa Utoaji',
    'Delivered Inventory':       'Hesabu Zilizotolewa',
    'Product Inventory':         'Hesabu ya Bidhaa',
    'Fittings':                  'Majaribio',
    'Add Product':               'Ongeza Bidhaa',
    'Customers':                 'Wateja',
    'Earnings':                  'Mapato',
    'Collections':               'Mkusanyiko',
    'Shop Now':                  'Nunua Sasa',
    'My Orders':                 'Maagizo Yangu',
    'Wishlist':                  'Orodha ya Matakwa',
    'Book Fitting':              'Weka Miadi ya Kujaribu',
    'Leave a Review':            'Acha Tathmini',
    'Choose Provider':           'Chagua Mtoa Huduma',
    'SmartServe SMEs Platform':  'Jukwaa la SmartServe SMEs',

    /* ── Tab headings ── */
    '✂️ Select Your Designer':   '✂️ Chagua Mbuni Wako',
    '👤 Select Customer':        '👤 Chagua Mteja',
    '🎨 Upload Your Design':     '🎨 Pakia Muundo Wako',
    '🎨 Customer Designs':       '🎨 Miundo ya Wateja',
    '📏 Submit Measurements':    '📏 Wasilisha Vipimo',
    '📏 Customer Measurements':  '📏 Vipimo vya Mteja',
    '🖼️ Product Previews':       '🖼️ Mifano ya Bidhaa',
    '💬 Chat with Designer':     '💬 Gumzo na Mbuni',
    '💬 Chat with Customer':     '💬 Gumzo na Mteja',
    '💳 Make Payment':           '💳 Fanya Malipo',
    '💳 Customer Payments':      '💳 Malipo ya Mteja',
    '🤖 Tailoring AI Assistant': '🤖 Msaidizi wa AI wa Ushonaji',
    '🚚 Delivery Preference':    '🚚 Mapendeleo ya Utoaji',
    '🚚 Customer Delivery Info': '🚚 Maelezo ya Utoaji wa Mteja',
    '📋 Inventory':              '📋 Hesabu',
    '📸 Upload Preview':         '📸 Pakia Mfano',
    '🤖 Fashion AI Assistant':   '🤖 Msaidizi wa AI wa Mitindo',
    'Boutique Overview':         'Muhtasari wa Boutique',
    'Customer Orders':           'Maagizo ya Wateja',
    '🚚 Delivery Management':    '🚚 Usimamizi wa Utoaji',
    '📦 Delivered Inventory':    '📦 Hesabu Zilizotolewa',
    'Product Inventory':         'Hesabu ya Bidhaa',
    'Fitting Appointments':      'Miadi ya Majaribio',
    'Add New Product':           'Ongeza Bidhaa Mpya',
    'Customer Queue':            'Foleni ya Wateja',

    /* ── Sub-headings & card titles ── */
    '🧵 Available Designers':    '🧵 Mabuni Wanaopatikana',
    '🧵 Your Assigned Customers':'🧵 Wateja Wako Waliowekwa',
    '📎 Design Reference':       '📎 Kumbukumbu ya Muundo',
    '📐 Body Measurements':      '📐 Vipimo vya Mwili',
    '✨ Your Garment Previews':  '✨ Mifano ya Nguo Yako',
    '🗨️ Conversation':           '🗨️ Mazungumzo',
    '💰 Payment Options':        '💰 Chaguo za Malipo',
    '💰 Payment Records':        '💰 Rekodi za Malipo',
    '🧵 Ask the AI Tailor':      '🧵 Uliza Mbuni wa AI',
    '📦 How Would You Like to Receive Your Order?': '📦 Ungependa Kupokea Agizo Lako Vipi?',
    '📦 Delivery Preference':    '📦 Mapendeleo ya Utoaji',
    '🖼️ Uploaded Designs':       '🖼️ Miundo Iliyopakiwa',
    '📐 Measurement Records':    '📐 Rekodi za Vipimo',
    '🪡 Share Your Work':        '🪡 Shiriki Kazi Yako',

    /* ── Labels & buttons ── */
    'Select Garment Type':       'Chagua Aina ya Nguo',
    '— Choose Garment —':        '— Chagua Nguo —',
    '— Choose a Designer —':     '— Chagua Mbuni —',
    '— Select a Customer —':     '— Chagua Mteja —',
    '👗 Dress':                  '👗 Gauni',
    '👖 Trouser':                '👖 Suruali',
    '👔 Shirt':                  '👔 Shati',
    '🩱 Skirt':                  '🩱 Sketi',
    '🧥 Coat':                   '🧥 Koti',
    '📨 Submit Measurements':    '📨 Wasilisha Vipimo',
    '📤 Upload Design':          '📤 Pakia Muundo',
    '📤 Upload Preview':         '📤 Pakia Mfano',
    '✉️ Send Message':           '✉️ Tuma Ujumbe',
    '📲 Pay Now via M-Pesa':     '📲 Lipa Sasa kwa M-Pesa',
    '💬 Ask ChatGPT':            '💬 Uliza ChatGPT',
    '💾 Save Preference':        '💾 Hifadhi Mapendeleo',
    '🚚 Mark as Delivered & Save to Inventory': '🚚 Weka kama Imetolewa na Hifadhi kwenye Hesabu',
    '🔄 Refresh':                '🔄 Onyesha Upya',
    'Select preview image':      'Chagua picha ya mfano',
    'M-Pesa Phone Number':       'Nambari ya Simu ya M-Pesa',
    'Select Payment Method':     'Chagua Njia ya Malipo',

    /* ── Delivery options ── */
    'Pick Up':                   'Kuchukua',
    'Home Delivery':             'Utoaji Nyumbani',
    'Collect from the shop':     'Chukua kutoka dukani',
    'Delivered to your door':    'Atolewa mlangoni kwako',
    'Pick-up Instructions':      'Maelekezo ya Kuchukua',
    '📍 Delivery Address':       '📍 Anwani ya Utoaji',
    '🗺️ Location Notes / Landmark': '🗺️ Maelezo ya Mahali / Alama',
    '✅ Current Saved Preference': '✅ Mapendeleo Yaliyohifadhiwa',
    '✅ Mark Order as Delivered': '✅ Weka Agizo kama Limetolewa',

    /* ── AI chips ── */
    '👗 Best fabric for evening dress':  '👗 Kitambaa bora kwa gauni la jioni',
    '📏 How to measure at home':         '📏 Jinsi ya kupima nyumbani',
    '🌍 Trending African prints':        '🌍 Michapuo ya Afrika inayoongoza',
    '🧶 Fabric quantity for trousers':   '🧶 Kiasi cha kitambaa kwa suruali',
    '✂️ Darts vs pleats':                '✂️ Darts dhidi ya pleats',
    '🫧 Silk fabric care':               '🫧 Utunzaji wa kitambaa cha hariri',
    'ChatGPT opens in a new tab':        'ChatGPT inafungua kwenye kichupo kipya',
    'Type your question below, click the button, and ChatGPT will open with your question pre-filled and ready to answer.':
      'Andika swali lako hapa chini, bonyeza kitufe, na ChatGPT itafunguka na swali lako tayari.',
    'ChatGPT will open in a new tab. You may need a free ChatGPT account.':
      'ChatGPT itafunguka kwenye kichupo kipya. Unaweza kuhitaji akaunti ya bure ya ChatGPT.',

    /* ── Inventory table headers ── */
    'Customers':                 'Wateja',
    'Designs':                   'Miundo',
    'Pick-ups':                  'Michukuo',
    'Deliveries':                'Utoaji',
    'Previews':                  'Mifano',
    'All Sections':              'Sehemu Zote',
    'Delivery Preferences':      'Mapendeleo ya Utoaji',
    'Delivered Orders':          'Maagizo Yaliyotolewa',
    'Name':                      'Jina',
    'Email':                     'Barua Pepe',
    'Preview':                   'Mfano',
    'Customer':                  'Mteja',
    'Uploaded':                  'Imepakiwa',
    'Garment':                   'Nguo',
    'Key Measurements':          'Vipimo Muhimu',
    'Date':                      'Tarehe',
    'Option':                    'Chaguo',
    'Address':                   'Anwani',
    'Notes':                     'Maelezo',
    'Updated':                   'Imesasishwa',
    'Delivery Type':             'Aina ya Utoaji',
    'Delivered At':              'Imetolewa Tarehe',

    /* ── Hints & placeholders ── */
    'Select a customer first.':  'Chagua mteja kwanza.',
    'Select a customer first to view their delivery preference.':
      'Chagua mteja kwanza kuona mapendeleo yao ya utoaji.',
    'Selecting a customer loads their designs, measurements, payments and chat.':
      'Kuchagua mteja kunapakia miundo yao, vipimo, malipo na gumzo.',
    'Once selected, you can upload designs, submit measurements and chat directly.':
      'Ukichagua, unaweza kupakia miundo, kuwasilisha vipimo na kupiga gumzo moja kwa moja.',
    'Choose a skilled tailor to bring your vision to life':
      'Chagua fundi stadi kuleta maono yako kuwa ukweli',
    'Choose a customer to view their order details':
      'Chagua mteja kuona maelezo ya agizo lao',
    'Design references uploaded by the selected customer':
      'Kumbukumbu za muundo zilizopakiwa na mteja aliyechaguliwa',
    'Body measurements submitted by the customer':
      'Vipimo vya mwili vilivyowasilishwa na mteja',
    'Payment history for the selected customer':
      'Historia ya malipo ya mteja aliyechaguliwa',
    'Send a garment preview image to your customer':
      'Tuma picha ya mfano wa nguo kwa mteja wako',
    'Discuss design details, fittings and delivery':
      'Jadili maelezo ya muundo, majaribio na utoaji',
    'Discuss fittings, adjustments and delivery details':
      'Jadili majaribio, marekebisho na maelezo ya utoaji',
    'Secure payment for your tailoring order':
      'Malipo salama kwa agizo lako la ushonaji',
    'Powered by ChatGPT — expert advice on fabrics, styles, measurements and fashion trends':
      'Inayotolewa na ChatGPT — ushauri wa kitaalamu kuhusu vitambaa, mitindo, vipimo na mwelekeo wa mitindo',
    'See progress previews uploaded by your designer':
      'Tazama mifano ya maendeleo iliyopakiwa na mbuni wako',
    'Accurate measurements ensure a perfect fit':
      'Vipimo sahihi vinahakikisha kulingana vizuri',
    'Share your inspiration — photos, sketches or reference images':
      'Shiriki msukumo wako — picha, michoro au picha za kumbukumbu',
    'Choose how you want to receive your finished garment':
      'Chagua jinsi unavyotaka kupokea nguo yako iliyokamilika',
    'View how the selected customer wants to receive their order':
      'Tazama jinsi mteja aliyechaguliwa anataka kupokea agizo lake',
    'All customer records across designs, measurements, deliveries and previews':
      'Rekodi zote za wateja katika miundo, vipimo, utoaji na mifano',
    'Once the garment has been handed over or dispatched, mark it as delivered. This saves a record to your inventory.':
      'Nguo ikiwa imesalimiwa au kutumwa, iweke kama imetolewa. Hii inahifadhi rekodi kwenye hesabu yako.',

    /* ── Boutique provider ── */
    'Manage your inventory, orders, and customer fittings from here.':
      'Simamia hesabu yako, maagizo, na majaribio ya wateja kutoka hapa.',
    'Total Orders':              'Jumla ya Maagizo',
    'Pending':                   'Inasubiri',
    'Delivered':                 'Imetolewa',
    'Products Listed':           'Bidhaa Zilizoorodheshwa',
    'Fitting Bookings':          'Miadi ya Majaribio',
    'Total Revenue':             'Mapato Yote',
    'View pending/processing orders and mark them as delivered. Delivered orders are automatically saved to your inventory log.':
      'Tazama maagizo yanayosubiri/yanayoshughulikiwa na yaweke kama yametolewa. Maagizo yaliyotolewa yanahifadhiwa kiotomatiki kwenye kumbukumbu ya hesabu yako.',
    'All orders that have been marked as delivered.':
      'Maagizo yote yaliyowekwa kama yametolewa.',
    'Customers who have selected you as their provider.':
      'Wateja waliokuchagua kama mtoa huduma wao.',
    'Product Name':              'Jina la Bidhaa',
    'Category':                  'Kategoria',
    'Price (KSh)':               'Bei (KSh)',
    'Available Sizes':           'Saizi Zinazopatikana',
    'Stock Quantity':            'Kiasi cha Hisa',
    'Product Image':             'Picha ya Bidhaa',
    'Add Product':               'Ongeza Bidhaa',
    'Total Earned':              'Jumla Iliyopatikana',
    'Delivered Orders':          'Maagizo Yaliyotolewa',
    '🚚 Mark Delivered':         '🚚 Weka kama Imetolewa',

    /* ── Subscription page ── */
    'Provider Monthly Subscription': 'Usajili wa Kila Mwezi wa Mtoa Huduma',
    'per month':                 'kwa mwezi',
    'Full dashboard access':     'Ufikiaji kamili wa dashibodi',
    'Unlimited customers':       'Wateja wasio na kikomo',
    'AI assistant tools':        'Zana za msaidizi wa AI',
    'Inventory management':      'Usimamizi wa hesabu',
    '📱 Pay via M-Pesa':         '📱 Lipa kwa M-Pesa',
    'Enter your M-Pesa number to receive a payment prompt for KSh 300.':
      'Ingiza nambari yako ya M-Pesa kupokea ombi la malipo la KSh 300.',
    'M-Pesa Phone Number':       'Nambari ya Simu ya M-Pesa',
    '📲 Send M-Pesa Prompt':     '📲 Tuma Ombi la M-Pesa',
    'or':                        'au',
    '🧾 I already paid — enter M-Pesa code': '🧾 Nimelipa tayari — ingiza nambari ya M-Pesa',
    '⏳ Waiting for Payment':    '⏳ Inasubiri Malipo',
    '🧾 Enter M-Pesa Code':      '🧾 Ingiza Nambari ya M-Pesa',
    'Subscription Activated':    'Usajili Umewashwa',
    '🚀 Go to Dashboard':        '🚀 Nenda kwenye Dashibodi',
    '← Back to Login':           '← Rudi kwenye Kuingia',
    'Secure signup':             'Usajili salama',
    'M-Pesa payments':           'Malipo ya M-Pesa',
    'Made in Kenya':             'Imetengenezwa Kenya',
    'Ready in 2 minutes':        'Tayari kwa dakika 2',
  };

  /* Reverse map: Swahili → English (for switching back) */
  const enMap = {};
  Object.entries(swMap).forEach(([en, sw]) => { enMap[sw] = en; });

  /* ── Walk text nodes and translate ── */
  function translateTextNodes(node, map) {
    if (node.nodeType === Node.TEXT_NODE) {
      const trimmed = node.textContent.trim();
      if (trimmed && map[trimmed] !== undefined) {
        node.textContent = node.textContent.replace(trimmed, map[trimmed]);
      }
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      !['SCRIPT','STYLE','INPUT','TEXTAREA','SELECT'].includes(node.tagName)
    ) {
      node.childNodes.forEach(child => translateTextNodes(child, map));
    }
  }

  /* ── Translate placeholders ── */
  function translatePlaceholders(map) {
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
      const ph = el.placeholder.trim();
      if (ph && map[ph]) el.placeholder = map[ph];
    });
  }

  /* ── Translate option text ── */
  function translateOptions(map) {
    document.querySelectorAll('option').forEach(opt => {
      const t = opt.textContent.trim();
      if (t && map[t]) opt.textContent = map[t];
    });
  }

  /* ── Hook into the main applyLang ── */
  const _prev = window.applyLang;
  window.applyLang = function (lang) {
    if (_prev) _prev(lang);

    const map = lang === 'sw' ? swMap : enMap;

    // Only run text-map on dashboards (pages without full data-i18n coverage)
    // Detect by checking if body has sidebar (dashboard indicator)
    if (document.querySelector('.sidebar') || document.querySelector('.top-nav')) {
      translateTextNodes(document.body, map);
      translatePlaceholders(map);
      translateOptions(map);
    }
  };

  /* ── Re-apply on DOMContentLoaded for dashboards ── */
  document.addEventListener('DOMContentLoaded', function () {
    const saved = localStorage.getItem('ss_lang') || 'en';
    if (saved === 'sw') {
      // Small delay to let dashboard JS render dynamic content first
      setTimeout(() => applyLang('sw'), 300);
    }
  });

})();

/* ── Subscription page keys ── */
(function () {
  const subKeys = {
    en: {
      "sub.tagline":       "Provider Monthly Subscription",
      "sub.permonth":      "per month",
      "sub.feat1":         "Full dashboard access",
      "sub.feat2":         "Unlimited customers",
      "sub.feat3":         "AI assistant tools",
      "sub.feat4":         "Inventory management",
      "sub.active.h":      "Subscription Active",
      "sub.active.p":      "Your subscription is valid until —",
      "sub.step1.title":   "📱 Pay via M-Pesa",
      "sub.step1.sub":     "Enter your M-Pesa number to receive a payment prompt for KSh 300.",
      "sub.phone.label":   "M-Pesa Phone Number",
      "sub.phone.ph":      "e.g. 0712 345 678",
      "sub.step1.btn":     "📲 Send M-Pesa Prompt",
      "sub.or":            "or",
      "sub.manual.link":   "🧾 I already paid — enter M-Pesa code",
      "sub.wait.title":    "⏳ Waiting for Payment",
      "sub.wait.sub":      "A payment prompt has been sent to your phone. Enter your M-Pesa PIN to complete the KSh 300 payment.",
      "sub.wait.checking": "Checking payment status…",
      "sub.or.manual":     "or enter code manually",
      "sub.code.label":    "M-Pesa Transaction Code",
      "sub.code.ph":       "e.g. QGH7XXXXXX",
      "sub.confirm.btn":   "✅ Confirm Payment",
      "sub.back":          "← Back",
      "sub.manual.title":  "🧾 Enter M-Pesa Code",
      "sub.manual.sub":    "Send KSh 300 to Till Number 3326904 (Buy Goods), then paste the confirmation code below.",
      "sub.verify.btn":    "✅ Verify & Activate",
      "sub.success.title": "Subscription Activated!",
      "sub.success.sub":   "Your SmartServe SMEs provider account is now active for 30 days.",
      "sub.dashboard.btn": "🚀 Go to Dashboard",
      "sub.back.login":    "← Back to Login"
    },
    sw: {
      "sub.tagline":       "Usajili wa Kila Mwezi wa Mtoa Huduma",
      "sub.permonth":      "kwa mwezi",
      "sub.feat1":         "Ufikiaji kamili wa dashibodi",
      "sub.feat2":         "Wateja wasio na kikomo",
      "sub.feat3":         "Zana za msaidizi wa AI",
      "sub.feat4":         "Usimamizi wa hesabu",
      "sub.active.h":      "Usajili Umewashwa",
      "sub.active.p":      "Usajili wako ni halali hadi —",
      "sub.step1.title":   "📱 Lipa kwa M-Pesa",
      "sub.step1.sub":     "Ingiza nambari yako ya M-Pesa kupokea ombi la malipo la KSh 300.",
      "sub.phone.label":   "Nambari ya Simu ya M-Pesa",
      "sub.phone.ph":      "mfano 0712 345 678",
      "sub.step1.btn":     "📲 Tuma Ombi la M-Pesa",
      "sub.or":            "au",
      "sub.manual.link":   "🧾 Nimelipa tayari — ingiza nambari ya M-Pesa",
      "sub.wait.title":    "⏳ Inasubiri Malipo",
      "sub.wait.sub":      "Ombi la malipo limetumwa kwa simu yako. Ingiza PIN yako ya M-Pesa kukamilisha malipo ya KSh 300.",
      "sub.wait.checking": "Inakagua hali ya malipo…",
      "sub.or.manual":     "au ingiza nambari mwenyewe",
      "sub.code.label":    "Nambari ya Muamala wa M-Pesa",
      "sub.code.ph":       "mfano QGH7XXXXXX",
      "sub.confirm.btn":   "✅ Thibitisha Malipo",
      "sub.back":          "← Rudi",
      "sub.manual.title":  "🧾 Ingiza Nambari ya M-Pesa",
      "sub.manual.sub":    "Tuma KSh 300 kwa Nambari ya Till 3326904 (Buy Goods), kisha bandika nambari ya uthibitisho hapa chini.",
      "sub.verify.btn":    "✅ Thibitisha na Washa",
      "sub.success.title": "Usajili Umewashwa!",
      "sub.success.sub":   "Akaunti yako ya mtoa huduma wa SmartServe SMEs sasa iko hai kwa siku 30.",
      "sub.dashboard.btn": "🚀 Nenda kwenye Dashibodi",
      "sub.back.login":    "← Rudi kwenye Kuingia"
    }
  };

  if (typeof translations !== 'undefined') {
    Object.keys(subKeys).forEach(lang => {
      Object.assign(translations[lang], subKeys[lang]);
    });
  }
})();

/* ── Business card labels + hero h1 parts ── */
(function () {
  const extra = {
    en: {
      "biz.label.tailoring":  "Tailoring",
      "biz.label.salon":      "Salon",
      "biz.label.restaurant": "Restaurant",
      "biz.label.boutique":   "Boutique",
      "biz.label.agrovet":    "Agrovet",
      "biz.label.hardware":   "Hardware",
      "biz.label.cyber":      "Cyber Café",
      "hero.h1a":             "Connecting",
      "hero.h1b":             "Small Businesses",
      "hero.h1c":             "with More Customers"
    },
    sw: {
      "biz.label.tailoring":  "Ushonaji",
      "biz.label.salon":      "Saluni",
      "biz.label.restaurant": "Mgahawa",
      "biz.label.boutique":   "Boutique",
      "biz.label.agrovet":    "Agrovet",
      "biz.label.hardware":   "Vifaa",
      "biz.label.cyber":      "Cyber Café",
      "hero.h1a":             "Kuunganisha",
      "hero.h1b":             "Biashara Ndogo",
      "hero.h1c":             "na Wateja Zaidi"
    }
  };
  if (typeof translations !== 'undefined') {
    Object.keys(extra).forEach(lang => Object.assign(translations[lang], extra[lang]));
  }
})();

/* ── Ask ChatGPT button + KSh currency translation ── */
(function () {
  /* Add "Ask ChatGPT" key to translations */
  const keys = {
    en: { "c.ai.btn": "Ask ChatGPT" },
    sw: { "c.ai.btn": "Uliza ChatGPT" }
  };
  if (typeof translations !== 'undefined') {
    Object.keys(keys).forEach(lang => Object.assign(translations[lang], keys[lang]));
  }

  /* ── KSh ↔ Shilingi currency swap ── */
  // Runs after the main text-map engine, targeting text nodes that contain "KSh"
  function swapCurrency(toLang) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          // Skip script/style nodes
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      if (toLang === 'sw') {
        // KSh → Shilingi (keep the number)
        node.textContent = node.textContent.replace(/KSh\s*/g, 'Shilingi ');
      } else {
        // Shilingi → KSh (restore)
        node.textContent = node.textContent.replace(/Shilingi\s*/g, 'KSh ');
      }
    });

    // Also swap in placeholders
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
      if (toLang === 'sw') {
        el.placeholder = el.placeholder.replace(/KSh\s*/g, 'Shilingi ');
      } else {
        el.placeholder = el.placeholder.replace(/Shilingi\s*/g, 'KSh ');
      }
    });
  }

  /* Hook into applyLang */
  const _prev = window.applyLang;
  window.applyLang = function (lang) {
    if (_prev) _prev(lang);
    // Run currency swap after a short delay to catch dynamic content
    setTimeout(() => swapCurrency(lang), 100);
  };
})();
