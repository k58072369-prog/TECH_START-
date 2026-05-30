# تيك ستارت | TECH START Platform 🚀
> منصة عربية رائدة لتقنيات الذكاء الاصطناعي، البرمجة، والأدوات التقنية الحديثة.

منصة تيك ستارت مصممة لتكون بمثابة واجهة عالمية لتبسيط وتغطية أحدث مجالات الذكاء الاصطناعي، لغات البرمجة، وشروحات العتاد التقني بلمسات تصميم حديثة مستوحاة من عمالقة التكنلوجيا مثل Vercel و OpenAI و Stripe.

---

## المزايا والخصائص الفنية الرئيسية ✨
1. **تصميم ريادي مستقبلي:** يدعم الوضع المظلم الافتراضي، تأثيرات الزجاج الشبكي (Glassmorphism)، وهالات الضوء النيونية.
2. **عربي أصيل %100:** دعم كامل لـ RTL مع أفضل خطوط العرض العربية المقروءة للتصفح اليومي المستمر.
3. **ذكاء سحابي فريد:** متصل مباشرة بـ Supabase لإدارة قواعد البيانات والملفات والتحميل المباشر للصور.
4. **تأثيرات حركية فائقة الجودة:** مبني كلياً بالاستفادة من مكتبة Framer Motion لإنجاز حركات الدخول وسحب البيانات والانتقال السلس بيم الصفحات.
5. **لوحة تحكم إدارية كاملة (CMS):** بوابة للمسؤول تحت الرابط `/admin` تتيح كتابة المقالات، وتعديل التصنيفات بمدخل غني بالأكواد والفقرات.

---

## هيكل قواعد البيانات بـ Supabase (Database Schema) 📊
يرجى تشغيل حزم الـ SQL التالية داخل نافذة SQL Editor بـ Supabase لتصميم الجداول وإدراج التصنيفات الافتراضية:

```sql
-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Create Articles Table
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    external_url TEXT,
    featured BOOLEAN DEFAULT false NOT NULL,
    views INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### إعدادات مستودع التخزين (Supabase Storage Bucket) 📂
لرفع وإدارة صور غلاف المقالات مباشرة سحابياً:
1. قم بإنشاء Bucket جديد في صفحة **Storage** بـ Supabase وسمه: `article-images`.
2. تأكد من ضبط الصلاحيات كملف عام (Public) لسهولة جلب الروابط واستعراضها.
3. قم بإيقاف خيارات التقييد لتمكين الرفع المباشر من واجهة المسؤول.

---

## التشغيل والتطوير محلياً (Local Development) ⚙️

### 1. تثبيت الحزم:
```bash
npm install
```

### 2. إعداد المتغيرات البيئية (Environment Variables) 🔑
قم بإنشاء ملف `.env` في المسار الرئيسي للتطبيق واملأه بالقوام التالي:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://bqmnjscfnnpvtadlkhbx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_UhbCyFEANmVpkLb2z6o_Mw_9ogE0ZYD"

# Admin Dashboard parameters
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="password"
```

### 3. إطلاق خادم التطوير:
```bash
npm run dev
```

---

## دليل النشر لـ Vercel (Vercel Deployment Guide) ⚡
المشروع مبني كلياً بمعايير إنتاجية عالمية وجاهز للنشر المباشر بضغطة زر واحدة:

1. قم بربط مستودع الكود بـ **Vercel Dashboard**.
2. تحت قسم **Environment Variables** بـ Vercel، قم بإضافة الحقول التالية:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
3. قم بالنشر مباشرة. سيتكفل Vercel ببناء الملفات وضغط العتاد بأعلى جودة وسرعة تصفح ممكنة.
