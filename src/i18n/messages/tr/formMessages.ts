import type en from "../en/formMessages";

/* Keyed by the exact English text (src/lib/validation.ts, the public forms'
   Server Actions, lib/api.ts and the API). A key with {n} matches the message
   with any one number in it; an exact key wins over it. */
const formMessages: typeof en = {
  /* ---- Field checks: src/lib/validation.ts and backend/apps/core/validation.py */
  "Enter your full name.": "Adını ve soyadını gir.",
  "Use a single line.": "Tek satır kullan.",
  "That name looks too short.": "Bu ad çok kısa görünüyor.",
  "That name is too long.": "Bu ad çok uzun.",
  "Enter your email address.": "E-posta adresini gir.",
  "That doesn't look like a valid email address.": "Bu, geçerli bir e-posta adresine benzemiyor.",
  "Choose a password.": "Bir şifre belirle.",
  "Use at least {n} characters.": "En az {n} karakter kullan.",
  "That password is too long.": "Bu şifre çok uzun.",
  "Include at least one letter.": "En az bir harf ekle.",
  "Include at least one number.": "En az bir rakam ekle.",
  "That password is too common. Choose one that's harder to guess.":
    "Bu şifre çok yaygın. Tahmin edilmesi daha zor bir şifre seç.",
  "Keep this to {n} characters or fewer.": "En fazla {n} karakter yaz.",
  "Keep this to 2000 characters or fewer.": "En fazla 2.000 karakter yaz.",
  "Enter text.": "Metin gir.",

  /* ---- Sign-in forms: app/[lang]/(auth)/actions.ts, lib/auth.ts, lib/api.ts */
  "Enter your password.": "Şifreni gir.",
  "Please accept the terms to continue.": "Devam etmek için lütfen koşulları kabul et.",
  "This reset link is incomplete. Request a new one below.": "Bu sıfırlama bağlantısı eksik. Aşağıdan yenisini iste.",
  "That link didn't work.": "Bu bağlantı çalışmadı.",
  "That didn't work. Please try again.": "Bu olmadı. Lütfen tekrar dene.",
  "Google sign-in isn't configured yet. Set GOOGLE_CLIENT_ID (and the secret on the API) to enable it.":
    "Google ile giriş henüz ayarlanmadı. Açmak için GOOGLE_CLIENT_ID’yi (ve API’deki gizli anahtarı) tanımla.",
  "We couldn't reach the server just now. Please try again in a moment.":
    "Şu anda sunucuya ulaşamadık. Lütfen birazdan tekrar dene.",

  /* ---- Contact, events and newsletter forms: their actions.ts */
  "Choose what this is about.": "Mesajının konusunu seç.",
  "Write a short message.": "Kısa bir mesaj yaz.",
  "Tell us a little more (at least 10 characters).": "Biraz daha ayrıntı ver (en az 10 karakter).",
  "We couldn't send that just now. Please try again.": "Şu anda gönderemedik. Lütfen tekrar dene.",
  "We couldn't send your message just now. Please try again.": "Mesajını şu anda gönderemedik. Lütfen tekrar dene.",
  "Registration for this event has closed.": "Bu etkinliğin kayıtları kapandı.",
  "We couldn't save your registration just now. Please try again.":
    "Kaydını şu anda tamamlayamadık. Lütfen tekrar dene.",
  "We couldn't sign you up just now. Please try again.": "Seni şu anda listeye ekleyemedik. Lütfen tekrar dene.",

  /* ---- The API: backend/apps/accounts/services.py */
  "That email and password don't match. Try again, or reset your password.":
    "E-posta ve şifre eşleşmiyor. Tekrar dene ya da şifreni sıfırla.",
  "This reset link is invalid or has expired. Request a new one below.":
    "Bu sıfırlama bağlantısı geçersiz ya da süresi dolmuş. Aşağıdan yenisini iste.",
  "This confirmation link is invalid or has expired. Sign in to get a new one.":
    "Bu doğrulama bağlantısı geçersiz ya da süresi dolmuş. Yenisini almak için giriş yap.",
  "That email is already registered.": "Bu e-posta adresi zaten kayıtlı.",
  "Too many failed sign-ins for this account. Please wait {n} minutes, or reset your password.":
    "Bu hesapta çok fazla başarısız giriş denemesi var. Lütfen {n} dakika bekle ya da şifreni sıfırla.",
  "Too many failed sign-ins for this account. Please wait an hour, or reset your password.":
    "Bu hesapta çok fazla başarısız giriş denemesi var. Lütfen bir saat bekle ya da şifreni sıfırla.",

  /* ---- The API: backend/apps/content/services.py */
  "We couldn't find that event.": "Bu etkinliği bulamadık.",
  "This event is full. Follow the newsletter to hear about the next one.":
    "Bu etkinlik doldu. Bir sonrakinden haberdar olmak için bültenimizi takip et.",
  "This unsubscribe link isn't valid. Use the link in your latest email.":
    "Bu abonelikten çıkma bağlantısı geçerli değil. En son e-postandaki bağlantıyı kullan.",

  /* ---- The API: backend/apps/core/exceptions.py (rate limits: "1 minute", "12 minutes", "45 seconds") */
  "Some fields need another look — they're highlighted below.":
    "Bazı alanlara yeniden bakman gerekiyor; aşağıda işaretlendiler.",
  "Too many attempts. Please wait {n} minutes and try again.":
    "Çok fazla deneme yapıldı. Lütfen {n} dakika bekleyip tekrar dene.",
  "Too many attempts. Please wait {n} minute and try again.":
    "Çok fazla deneme yapıldı. Lütfen {n} dakika bekleyip tekrar dene.",
  "Too many attempts. Please wait {n} seconds and try again.":
    "Çok fazla deneme yapıldı. Lütfen {n} saniye bekleyip tekrar dene.",
  "Sign in to continue.": "Devam etmek için giriş yap.",
  "Not found.": "Bulunamadı.",
  "The request couldn't be completed.": "İstek tamamlanamadı.",
};

export default formMessages;
