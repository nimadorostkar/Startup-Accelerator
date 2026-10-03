import type en from "../en/contact";

const contact: typeof en = {
  metaTitle: "İletişim — Fundup Club",
  metaDescription:
    "Hızlandırıcı, yatırım ya da iş birlikleri hakkında soruların mı var? Fundup Club ekibine mesaj gönder.",
  eyebrow: "İletişim",
  titleStart: "Hadi",
  titleAccent: "konuşalım",
  lead: "Kurucular, yatırımcılar, mentorlar ve basın: bize bir mesaj gönder, ekipteki doğru kişi sana dönüş yapsın.",
  formTitle: "Bize mesaj gönder",
  formNote: "İsteğe bağlı olarak belirtilenler dışında tüm alanlar zorunludur.",
  shortcutsLabel: "Yardım almanın diğer yolları",
  shortcuts: {
    apply: {
      title: "Başvurmaya hazır mısın?",
      body: "Silicon Valley Sonbahar 2026 başvuruları açık. Başvuru ücretsiz.",
      cta: "Başvurunu başlat",
    },
    program: {
      title: "Program hakkında sorular",
      body: "Ücretler, hisse, sözleşmeler ve sana hangi programın uygun olduğu.",
      cta: "SSS’yi oku",
    },
    applied: {
      title: "Zaten başvurdun mu?",
      body: "Başvurunun durumunu ve ekibimizden gelen mesajları kontrol et.",
      cta: "Giriş yap",
    },
  },
  form: {
    name: "Ad soyad",
    namePlaceholder: "Ayşe Kurucu",
    email: "E-posta",
    emailPlaceholder: "sen@sirket.com",
    company: "Şirket (isteğe bağlı)",
    companyPlaceholder: "Girişimin ya da firman",
    topic: "Konu nedir?",
    topicPlaceholder: "Bir konu seç",
    topics: {
      "Applying to the program": "Programa başvuru",
      "Investing or partnerships": "Yatırım veya iş birlikleri",
      Mentoring: "Mentorluk",
      Press: "Basın",
      "Something else": "Başka bir konu",
    },
    message: "Mesaj",
    messagePlaceholder: "Sana nasıl yardımcı olabiliriz?",
    send: "Mesajı gönder",
    sending: "Gönderiliyor…",
    sentTitle: "Mesaj gönderildi",
    sentBody: "Teşekkürler {name}. Ekibimiz {email} adresine yanıt verecek.",
    sendAnother: "Başka bir mesaj gönder",
  },
};

export default contact;
