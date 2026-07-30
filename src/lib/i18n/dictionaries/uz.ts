import type { Dictionary } from "./en";

/**
 * Uzbek (Latin script). Uses the modern orthography with the ‘ modifier on
 * o‘ and g‘. Addresses the client with the polite plural ("siz").
 */
export const uz: Dictionary = {
  meta: {
    title: "Malikov — saytlar va Telegram botlar, sifatli qilingan",
    description:
      "Buyurtma asosida saytlar, Telegram botlar va avtomatlashtirish. G‘oyangizni AI yordamchiga ayting, bir necha daqiqada reja oling va tayyor loyihani ko‘rganingizdan keyingina to‘lang.",
    ogDescription:
      "G‘oyangizni ayting, bir necha daqiqada reja oling, natijani ko‘rgach to‘lang.",
  },

  nav: {
    services: "Xizmatlar",
    work: "Nima qilaman",
    styles: "Uslublar",
    process: "Qanday ishlaydi",
    faq: "Savollar",
    request: "Buyurtma berish",
    openMenu: "Menyuni ochish",
    closeMenu: "Menyuni yopish",
    language: "Til",
    home: "Malikov — bosh sahifa",
  },

  hero: {
    eyebrow: "Yangi loyihalar qabul qilinmoqda",
    titleLine1: "Sayt, Telegram bot yoki IT loyiha kerakmi?",
    titleBuilt: "sifatli va",
    titleProperly: "arzon",
    lead: "Nima kerakligini o‘z so‘zlaringiz bilan ayting — texnik bilim shart emas. Bir necha daqiqada aniq reja olasiz va faqat loyiha tayyor bo‘lib, ishlayotganini ko‘rganingizdan keyin to‘laysiz.",
    ctaPrimary: "Buyurtma berish",
    ctaSecondary: "Ishlarni ko‘rish",
    promiseA: "To‘lov topshirilgandan keyin",
    promiseB: "Bir kun ichida javob",
    promiseC: "Narx oldindan aniq",
    scrollDown: "Pastga aylantirish",
  },

  services: {
    eyebrow: "Nima bilan shug‘ullanaman",
    title: "Uch yo‘nalish,",
    accent: "bitta daraja.",
    lead: "Qaysi biri kerak bo‘lmasin, tartib bir xil: siz aytasiz, men rejalashtiraman, siz tasdiqlaysiz — va pul to‘lashdan oldin ishlayotgan loyihani ko‘rasiz.",
    start: "Buyurtma berish",
    website: {
      title: "Saytlar",
      body: "Tez va chiroyli saytlar — telefonda tuzuk ishlaydi va ko'proq mijoz olib keladi.",
      points: [
        "Lending va portfolio",
        "To‘lovli onlayn do‘konlar",
        "Yozilish va ariza shakllari",
        "O‘zingiz boshqaradigan admin panel",
      ],
    },
    bot: {
      title: "Telegram botlar",
      body: "Biznesingiz Telegram ichida — siz uxlaganda ham buyurtma oladi va mijozlarga javob beradi.",
      points: [
        "Do‘kon va buyurtma botlari",
        "Yozilish va eslatmalar",
        "Chat ichida to‘lov",
        "To‘liq interfeysli Mini App",
      ],
    },
    other: {
      title: "Qolgan hammasi",
      body: "Noqulay ishlar: zerikarli jarayonlarni avtomatlashtirish, xizmatlarni bog‘lash yoki to‘xtab qolgan loyihani qutqarish.",
      points: [
        "Avtomatlashtirish skriptlari",
        "Xizmatlarni o‘zaro bog‘lash",
        "Ma’lumot yig‘ish va tozalash",
        "Mavjud ishni tuzatish yoki yakunlash",
      ],
    },
  },

  showcase: {
    eyebrow: "Namunalar",
    title: "Men nima qilaman",
    accent: "va ular qanchalik foydali.",
    lead: "Hech qancha. G‘oyangizga yaqinini tanlang va buyurtma bering — yordamchi bir necha daqiqada siz bilan tafsilotlarni aniqlaydi.",
    requestAria: "Shunga o‘xshash loyihaga buyurtma berish: {title}",
    items: {
      landing: {
        title: "Sotadigan lendinglar",
        body: "Bitta harakat atrofida qurilgan bir sahifa — qo‘ng‘iroq, buyurtma yoki yozilish. Tez yuklanadi, telefonda aniq ko‘rinadi.",
        tags: ["Lending", "Portfolio", "Ishga tushirish"],
      },
      shopBot: {
        title: "Buyurtma oladigan botlar",
        body: "Mijoz Telegramdan chiqmasdan ko‘radi, buyurtma beradi va to‘laydi. Har bir buyurtma sizga chatga tushadi.",
        tags: ["Katalog", "To‘lov", "Buyurtmalar"],
      },
      store: {
        title: "Onlayn do‘konlar",
        body: "Haqiqiy do‘kon: mahsulotlar, savat, karta orqali to‘lov va qoldiqni o‘zingiz boshqaradigan joy.",
        tags: ["Savat", "To‘lov", "Admin"],
      },
      booking: {
        title: "Yozilish va band qilish",
        body: "Mijoz vaqt tanlaydi, sizga xabar keladi, hech kim ikki marta yozilmaydi. Salon, klinika va studiyalar uchun.",
        tags: ["Kalendar", "Eslatmalar", "Kelmaganlar"],
      },
      dashboard: {
        title: "Dashboard va admin panellar",
        body: "Biznesingizda nima bo‘layotganini bir qarashda ko‘ring va dasturchiga qo‘ng‘iroq qilmasdan o‘zgartiring.",
        tags: ["Hisobotlar", "Rollar", "Yuklab olish"],
      },
      automation: {
        title: "Avtomatlashtirish va integratsiya",
        body: "Zerikarli ish o‘zi bajarilsin — ma’lumot ko‘chadi, hisobot yig‘iladi, bildirishnoma keladi.",
        tags: ["Skriptlar", "API", "Parsing"],
      },
    },
    bandTitle: "G‘oyangizni topmadingizmi?",
    bandBody:
      "Bu normal — ko‘p loyihalar aralash bo‘ladi. O‘zingiznikini oddiy so‘zlar bilan ayting, yordamchi uni tuzuk texnik topshiriqqa aylantiradi.",
    bandNote: "Ikki daqiqacha vaqt oladi · Tayyor bo‘lmaguncha to‘lov yo‘q",
  },

  styles: {
    eyebrow: "O‘nta yo‘nalish",
    title: "Ko‘rinishini tanlang.",
    accent: "Dizayn atamalarini bilish shart emas.",
    lead: "Chatda ularni haqiqiy namuna sifatida ko‘rasiz va yoqqanini ko‘rsatasiz. Ishonchingiz komil emasmi? Shunday deng — biznesingizga mosini o‘zim tanlayman.",
    note: "To‘xtatish uchun ustiga olib boring · Boshlash uchun uslubni bosing",
    noteTouch: "Ko‘rish uchun suring · Boshlash uchun uslubni bosing",
    requestAria: "{label} uslubida buyurtma berish",
  },

  process: {
    eyebrow: "Qanday ishlaydi",
    title: "To‘rt qadam va",
    accent: "to‘lov eng oxirida.",
    lead: "Tartib muhim. Bir tiyin sarflashdan oldin ishlayotgan loyihani ko‘rasiz — demak, xato ketish xavfi sizda emas, menda.",
    steps: [
      {
        title: "Nima kerakligini ayting",
        body: "Chatni oching va g‘oyangizni xohlagancha tasvirlang. Yordamchi bir nechta oddiy savol beradi, dizayn variantlarini ko‘rsatadi va topshiriqni o‘zi yozadi.",
        meta: "Taxminan 2 daqiqa",
      },
      {
        title: "Men ko‘rib chiqib javob beraman",
        body: "Topshiriqni diqqat bilan o‘qib, aniq narx va real muddat bilan qaytaman. Agar buni yaxshi bajara olmasam, pulingizni olgandan ko‘ra shuni aytaman.",
        meta: "Odatda bir kun ichida",
      },
      {
        title: "Men qilaman",
        body: "Ish borishidan xabardor bo‘lasiz va o‘zgartirish so‘rashingiz mumkin — faqat oxirida, tuzatish qimmatga tushganda emas.",
        meta: "Muddat oldindan kelishiladi",
      },
      {
        title: "Ko‘rasiz, keyin to‘laysiz",
        body: "Tayyor loyiha ochiladi, uni yaxshilab sinab ko‘rasiz. Pul faqat oldingizdagi natija sizga ma’qul bo‘lgandan keyin o‘tadi.",
        meta: "Siz uchun xavf yo‘q",
      },
    ],
  },

  faq: {
    eyebrow: "Savollar",
    title: "Odamlar ko'p",
    accent: "so‘raydigan narsalar.",
    items: [
      {
        q: "Rostdan ham faqat oxirida to‘laymanmi?",
        a: "Ha. Pul o‘tkazishdan oldin tayyor loyiha ishlayotganini ko‘rasiz. Katta loyihalarni bosqichlarga bo‘lish mumkin — har bir bosqichni ham avval ishlayotgan holda ko‘rasiz, keyin to‘laysiz.",
      },
      {
        q: "Natija yoqmasa-chi?",
        a: "Demak, u hali tayyor emas. Ish davomidagi o‘zgartirishlar vazifaning bir qismi, qo‘shimcha to‘lov emas. Agar bu kelishganimiz emas bo‘lsa va men tuzata olmasam, siz to‘lamaysiz.",
      },
      {
        q: "Loyiha qancha turadi?",
        a: "Bu butunlay nima qilishiga bog‘liq. Oddiy lending va to‘liq onlayn do‘kon — juda boshqa ishlar. Buyurtma qoldiring, ish boshlanishidan oldin aniq narx olasiz — soatbay kutilmagan hisoblarsiz.",
      },
      {
        q: "Men texnikadan hech narsa tushunmayman. Muammomi?",
        a: "Umuman yo‘q — yordamchi aynan shuning uchun qilingan. Xohlaganingizni do‘stingizga tushuntirgandek ayting. U texnik savol bermaydi, dizayn haqida esa atama o‘rniga rasm ko‘rsatadi.",
      },
      {
        q: "Tayyor loyiha kimniki bo‘ladi?",
        a: "Sizniki. Kod, dizayn va akkauntlar sizga tegishli, oxirida topshiriladi. Ishlashda davom etishi uchun menga bog‘lanib qolmaysiz.",
      },
      {
        q: "Mavjud narsani tuzatish yoki yakunlash mumkinmi?",
        a: "Ko‘pincha ha. Buyurtma boshlaganda «Boshqa narsa»ni tanlang va nima borligini hamda nimasi noto‘g‘riligini ayting. Agar to'g'irlab bo‘lmasa, ochiq aytaman.",
      },
      {
        q: "Nega mobil ilovalar yopiq?",
        a: "Chunki to‘rt ishni yomon qilgandan ko‘ra uch ishni yaxshi qilganim ma’qul. Mobil ilovalar xuddi shu darajada ushlay oladigan bo‘lganimda ochiladi — tez orada.",
      },
    ],
  },

  cta: {
    eyebrow: "Tayyor bo‘lganingizda",
    titleA: "G‘oyangizni ayting.",
    titleB: "To‘lashdan oldin ko‘ring.",
    lead: "Ikki daqiqalik savollar, hech qanday majburiyatsiz va bir kun ichida tirik odamdan tirik javob.",
    button: "Buyurtma berish",
  },

  footer: {
    blurb:
      "Saytlar, Telegram botlar va avtomatlashtirish — to‘lashga arziydigan darajada, ishlayotganini ko‘rganingizdan keyin.",
    explore: "Bo‘limlar",
    rights: "Barcha huquqlar himoyalangan.",
    admin: "Admin",
  },

  kinds: {
    heading: "Nima quramiz?",
    lead: "Toifani tanlang, men bir nechta tezkor savol beraman — texnik bilim shart emas. Ikki daqiqacha vaqt oladi.",
    footnote: "Siz faqat loyiha tayyor bo‘lib, ishlayotganini ko‘rganingizdan keyin to‘laysiz.",
    soon: "Tez orada",
    website: {
      label: "Sayt",
      tagline: "Lending, do‘kon, dashboard",
      blurb:
        "Brauzerda ochiladigan sayt — bir sahifalikdan tortib to‘lov va admin paneli bo‘lgan to‘liq do‘kongacha.",
      examples: ["Lending", "Onlayn do‘kon", "Portfolio"],
    },
    telegram_bot: {
      label: "Telegram bot",
      tagline: "Do‘kon, yozilish, avtomatlashtirish",
      blurb:
        "Mijozlaringiz Telegram ichida gaplashadigan bot. Buyurtma oladi, savollarga javob beradi, to‘lov yig‘adi, sizga xabar beradi.",
      examples: ["Do‘kon bot", "Yozilish bot", "Yordam bot"],
    },
    other: {
      label: "Boshqa narsa",
      tagline: "Skript, integratsiya, manba kodi",
      blurb:
        "Avtomatlashtirish skriptlari, API integratsiyalari, parserlar, mavjud loyihani tuzatish yoki yakunlash, yoki davom ettirsa bo‘ladigan manba kodi.",
      examples: ["Avtomatlashtirish", "Integratsiya", "Parser"],
    },
    mobile_app: {
      label: "Mobil ilova",
      tagline: "iOS va Android",
      blurb:
        "Native va krossplatforma mobil ilovalar. Hozircha buyurtma qabul qilinmaydi — tez orada ochiladi.",
      examples: ["iOS", "Android", "React Native"],
    },
  },

  chat: {
    headerSuffix: "buyurtmasi",
    headerHint: "O‘z so‘zlaringiz bilan javob bering — qolganini men hal qilaman.",
    back: "Toifalarga qaytish",
    placeholder: "Javobingizni yozing…",
    send: "Yuborish",
    privacy: "Ma’lumotlaringiz faqat shu buyurtmaga javob berish uchun ishlatiladi.",
    greetingWebsite:
      "Assalomu alaykum! Ish boshlanishidan oldin hech narsa yo‘qolmasligi uchun sizga aynan nima kerakligini aniqlab olaman.\n\nXo‘sh — qanday sayt o‘ylagansiz? O‘z so‘zlaringiz bilan, qanchalik batafsil bo‘lsa ham ayting.",
    greetingBot:
      "Assalomu alaykum! Botingiz nima qilishi kerakligini aniqlab olaylik.\n\nO‘z so‘zlaringiz bilan ayting — u siz yoki mijozlaringiz uchun nima qilsin? Texnik bo‘lishi shart emas.",
    greetingOther:
      "Assalomu alaykum! Nima qilish kerakligini ayting.\n\nBu skript, integratsiya, buzilgan narsani tuzatish yoki boshqa birov boshlagan loyihani yakunlash bo‘lishi mumkin. O‘zingizga qulay tarzda tasvirlang.",
    errorGeneric: "Nimadir xato ketdi.",
    errorSend: "Buyurtmani yuborib bo‘lmadi.",
  },

  design: {
    notSure: "Bilmadim — o‘zingiz tanlang",
    notSureEcho: "Ishonchim komil emas — mosini o‘zingiz tanlang",
    pickEcho: "Menga {label} uslubi yoqdi.",
  },

  contact: {
    name: "Ismingiz",
    namePlaceholder: "masalan, Bekzod",
    nameError: "Iltimos, ismingizni yozing.",
    method: "Siz bilan qanday bog‘lansam qulay",
    telegram: "Telegram",
    phone: "Telefon",
    email: "Email",
    valueError: "Iltimos, {method} ma’lumotini yozing.",
    when: "Qachon gaplashishga qulay?",
    slots: ["Istalgan vaqt", "Ertalab", "Kunduzi", "Kechqurun", "Dam olish kunlari"],
    exactPlaceholder: "Aniqroq bo‘lsinmi? Masalan, ish kunlari 18:00 dan keyin (ixtiyoriy)",
    continue: "Davom etish",
    echo: "Mening ismim {name}. Bog‘lanish: {method} — {value}. {availability} bo‘shman.",
    anytime: "istalgan vaqtda",
  },

  budget: {
    currency: "Valyuta",
    customPlaceholder: "Yoki o‘z summangizni yozing…",
    send: "Yuborish",
    dontKnow: "Bilmayman — o‘zingiz ayting",
    dontKnowEcho: "Rostini aytsam, bu qancha turishini tasavvur qilmayman.",
    dontKnowNote: "Mijoz hali aniq bilmaydi",
    bandEcho: "Byudjetim taxminan {band}.",
  },

  summary: {
    heading: "Sizning topshirig‘ingiz",
    project: "Loyiha",
    about: "Tavsif",
    features: "Imkoniyatlar",
    scope: "Hajmi",
    style: "Uslub",
    audience: "Kim uchun",
    languages: "Tillar",
    timing: "Muddat",
    likes: "Yoqadi",
    contact: "Aloqa",
    free: "Bo‘sh",
    budget: "Byudjet",
    budgetUnknown: "Hali aniq emas — baho kutilmoqda",
    budgetNone: "Ko‘rsatilmagan",
    edit: "Nimadir o‘zgartirish",
    confirm: "To‘g‘ri — yuborish",
    sending: "Yuborilmoqda…",
  },

  success: {
    title: "Bo‘ldi — buyurtmangiz qabul qilindi.",
    bodyA: "Ko‘rib chiqaman va sizga shu manzilda qaytaman:",
    bodyB: " — odatda bir kun ichida. Aniqlashtirmoqchi bo‘lsangiz, shu raqamni saqlab qo‘ying.",
    copied: "nusxalandi",
    note: "Eslatma: siz faqat loyiha tayyor bo‘lib, ishlayotganini ko‘rganingizdan keyin to‘laysiz.",
    done: "Tayyor",
  },
};
