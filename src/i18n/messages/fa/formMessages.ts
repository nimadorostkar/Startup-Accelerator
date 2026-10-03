import type en from "../en/formMessages";

/* Keyed by the exact English text (src/lib/validation.ts, the public forms'
   Server Actions, lib/api.ts and the API). A key with {n} matches the message
   with any one number in it; an exact key wins over it, so the numbers we
   know in advance are written here with Persian digits. */
const formMessages: typeof en = {
  /* ---- Field checks: src/lib/validation.ts and backend/apps/core/validation.py */
  "Enter your full name.": "نام و نام خانوادگی‌تان را وارد کنید.",
  "Use a single line.": "همه را در یک خط بنویسید.",
  "That name looks too short.": "این نام خیلی کوتاه به نظر می‌رسد.",
  "That name is too long.": "این نام خیلی بلند است.",
  "Enter your email address.": "نشانی ایمیلتان را وارد کنید.",
  "That doesn't look like a valid email address.": "این نشانی ایمیل معتبر به نظر نمی‌رسد.",
  "Choose a password.": "یک رمز عبور انتخاب کنید.",
  "Use at least 8 characters.": "دست‌کم ۸ کاراکتر به کار ببرید.",
  "Use at least {n} characters.": "دست‌کم {n} کاراکتر به کار ببرید.",
  "That password is too long.": "این رمز عبور خیلی بلند است.",
  "Include at least one letter.": "دست‌کم یک حرف به کار ببرید.",
  "Include at least one number.": "دست‌کم یک رقم به کار ببرید.",
  "That password is too common. Choose one that's harder to guess.":
    "این رمز عبور خیلی رایج است. رمزی انتخاب کنید که حدس زدنش سخت‌تر باشد.",
  "Keep this to {n} characters or fewer.": "حداکثر {n} کاراکتر بنویسید.",
  "Keep this to 120 characters or fewer.": "حداکثر ۱۲۰ کاراکتر بنویسید.",
  "Keep this to 2000 characters or fewer.": "حداکثر ۲٬۰۰۰ کاراکتر بنویسید.",
  "Enter text.": "متن وارد کنید.",

  /* ---- Sign-in forms: app/[lang]/(auth)/actions.ts, lib/auth.ts, lib/api.ts */
  "Enter your password.": "رمز عبورتان را وارد کنید.",
  "Please accept the terms to continue.": "برای ادامه، لطفاً شرایط را بپذیرید.",
  "This reset link is incomplete. Request a new one below.":
    "این پیوند بازنشانی ناقص است. از پایین صفحه پیوند تازه‌ای درخواست کنید.",
  "That link didn't work.": "این پیوند کار نکرد.",
  "That didn't work. Please try again.": "انجام نشد. لطفاً دوباره امتحان کنید.",
  "Google sign-in isn't configured yet. Set GOOGLE_CLIENT_ID (and the secret on the API) to enable it.":
    "ورود با گوگل هنوز راه‌اندازی نشده است. برای فعال کردنش، GOOGLE_CLIENT_ID (و کلید محرمانهٔ API) را تنظیم کنید.",
  "We couldn't reach the server just now. Please try again in a moment.":
    "الان نتوانستیم به سرور دسترسی پیدا کنیم. لطفاً چند لحظهٔ دیگر دوباره امتحان کنید.",

  /* ---- Contact, events and newsletter forms: their actions.ts */
  "Choose what this is about.": "موضوع پیامتان را انتخاب کنید.",
  "Write a short message.": "پیام کوتاهی بنویسید.",
  "Tell us a little more (at least 10 characters).": "کمی بیشتر توضیح دهید (دست‌کم ۱۰ کاراکتر).",
  "We couldn't send that just now. Please try again.": "الان نتوانستیم آن را بفرستیم. لطفاً دوباره امتحان کنید.",
  "We couldn't send your message just now. Please try again.":
    "الان نتوانستیم پیامتان را بفرستیم. لطفاً دوباره امتحان کنید.",
  "Registration for this event has closed.": "ثبت‌نام این رویداد بسته شده است.",
  "We couldn't save your registration just now. Please try again.":
    "الان نتوانستیم ثبت‌نامتان را ذخیره کنیم. لطفاً دوباره امتحان کنید.",
  "We couldn't sign you up just now. Please try again.": "الان نتوانستیم شما را عضو کنیم. لطفاً دوباره امتحان کنید.",

  /* ---- The API: backend/apps/accounts/services.py */
  "That email and password don't match. Try again, or reset your password.":
    "ایمیل و رمز عبور با هم نمی‌خوانند. دوباره امتحان کنید یا رمز عبورتان را بازنشانی کنید.",
  "This reset link is invalid or has expired. Request a new one below.":
    "این پیوند بازنشانی نامعتبر است یا منقضی شده. از پایین صفحه پیوند تازه‌ای درخواست کنید.",
  "This confirmation link is invalid or has expired. Sign in to get a new one.":
    "این پیوند تأیید نامعتبر است یا منقضی شده. برای دریافت پیوند تازه وارد حسابتان شوید.",
  "That email is already registered.": "این ایمیل پیش‌تر ثبت شده است.",
  "Too many failed sign-ins for this account. Please wait 15 minutes, or reset your password.":
    "تلاش‌های ناموفق برای ورود به این حساب بیش از حد بوده است. لطفاً ۱۵ دقیقه صبر کنید یا رمز عبورتان را بازنشانی کنید.",
  "Too many failed sign-ins for this account. Please wait {n} minutes, or reset your password.":
    "تلاش‌های ناموفق برای ورود به این حساب بیش از حد بوده است. لطفاً {n} دقیقه صبر کنید یا رمز عبورتان را بازنشانی کنید.",
  "Too many failed sign-ins for this account. Please wait an hour, or reset your password.":
    "تلاش‌های ناموفق برای ورود به این حساب بیش از حد بوده است. لطفاً یک ساعت صبر کنید یا رمز عبورتان را بازنشانی کنید.",

  /* ---- The API: backend/apps/content/services.py */
  "We couldn't find that event.": "این رویداد را پیدا نکردیم.",
  "This event is full. Follow the newsletter to hear about the next one.":
    "ظرفیت این رویداد تکمیل شده است. خبرنامه را دنبال کنید تا از رویداد بعدی باخبر شوید.",
  "This unsubscribe link isn't valid. Use the link in your latest email.":
    "این پیوند لغو اشتراک معتبر نیست. از پیوند آخرین ایمیلتان استفاده کنید.",

  /* ---- The API: backend/apps/core/exceptions.py (rate limits: "1 minute", "12 minutes", "45 seconds") */
  "Some fields need another look — they're highlighted below.":
    "چند فیلد نیاز به بازبینی دارد؛ در زیر مشخص شده‌اند.",
  "Too many attempts. Please wait 1 minute and try again.":
    "تلاش‌ها بیش از حد بوده است. لطفاً یک دقیقه صبر کنید و دوباره امتحان کنید.",
  "Too many attempts. Please wait {n} minutes and try again.":
    "تلاش‌ها بیش از حد بوده است. لطفاً {n} دقیقه صبر کنید و دوباره امتحان کنید.",
  "Too many attempts. Please wait {n} minute and try again.":
    "تلاش‌ها بیش از حد بوده است. لطفاً {n} دقیقه صبر کنید و دوباره امتحان کنید.",
  "Too many attempts. Please wait {n} seconds and try again.":
    "تلاش‌ها بیش از حد بوده است. لطفاً {n} ثانیه صبر کنید و دوباره امتحان کنید.",
  "Sign in to continue.": "برای ادامه وارد شوید.",
  "Not found.": "پیدا نشد.",
  "The request couldn't be completed.": "درخواست انجام نشد.",
};

export default formMessages;
