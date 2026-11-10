# Flutter String Extractor ✨

**Stop writing hardcoded strings. Extract them to `AppStrings` in one click.**

> Made with ❤️ by **Adel Khaled** — Flutter Developer from Egypt 🇪🇬

[Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
[Flutter](https://img.shields.io/badge/Flutter-02569B?logo=flutter&logoColor=white)
[Dart](https://img.shields.io/badge/Dart-0175C2?logo=dart&logoColor=white)
[License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 😩 المشكلة

كلنا بنعمل كده في الأول:

```dart
Text("متاح")
Text("بيع جديد")
Text("أهلا يا $name")
```

وبعدين بنكتشف المشاكل:
- ❌ لو عايز تغير كلمة، هتدور عليها في 100 ملف
- ❌ لو عايز تعمل نسخة انجليزي، هتعيد المشروع من الأول
- ❌ الكود بيبقى ملخبط ومش نظيف
- ❌ لو اتنين شغالين في نفس المشروع، كل واحد بيسمي بطريقة

## ✅ الحل

الـ Extension دي بتحول الكود ده:

```dart
// قبل
Text("متاح")
Text("أهلا يا $name")
```

لكده في ثانية واحدة:

```dart
// بعد
Text(AppStrings.available)
Text(AppStrings.hello(name: name))
```

والنصوص بتتخزن لوحدها في مكان واحد:

```dart
abstract class AppStrings {
 static const String available = 'متاح';
 static String hello({required String name}) => 'أهلا يا $name';
}
```

---

## 🚀 المميزات

### 1. استخراج كلمة واحدة
حدد أي نص ودوس كليك يمين.

| قبل | بعد |
| :--- | :--- |
| `Text("بيع جديد")` | `Text(AppStrings.newSale)` |

### 2. استخراج كل الملف مرة واحدة
كليك يمين في أي مكان فاضي واختار **Extract All**.
هيحول كل النصوص اللي في الملف مرة واحدة.

### 3. ترجمة عربي + انجليزي (AR + EN)
لما تستخرج نص، هيسألك عن الترجمة الانجليزية، وهيعملك لوحده:
```
lib/l10n/ar.json
lib/l10n/en.json
```

مثال:
```json
// ar.json
{
 "available": "متاح",
 "newSale": "بيع جديد"
}

// en.json
{
 "available": "Available",
 "newSale": "New Sale"
}
```

### 4. اقتراح الاسم أوتوماتيك
مش محتاج تفكر في اسم، هو بيقترحلك:

| النص | الاقتراح |
| :--- | :--- |
| `"متاح"` | `available` |
| `"غير متاح"` | `notAvailable` |
| `"بيع جديد"` | `newSale` |
| `"منتج جديد"` | `newProduct` |
| `"الرئيسيه"` | `home` |
| `"المخزون"` | `inventory` |
| `"الاعدادات"` | `settings` |

### 5. بيفهم المتغيرات
```dart
"أهلا يا $name" → AppStrings.hello(name: name)
"عندك $count منتج" → AppStrings.youHave(count: count)
```

### 6. بيشتغل حتى لو معندكش ملف AppStrings
لو معندكش ملف، هو هيعمله لوحده في:
```
lib/core/constants/app_strings.dart
```
وهيضيف الـ `import` لوحده:
```dart
import 'package:your_app/core/constants/app_strings.dart';
```

### 7. مبيعملش تكرار
لو النص موجود أصلاً، هيستخدم القديم مش هيعمل واحد جديد.

### 8. شغال على أي مشروع
مش مربوط بمشروع معين. شغال على متجر، مطعم، أي مشروع Flutter.

---

## 📦 التثبيت

### من VS Code
1. افتح VS Code
2. دوس `Ctrl + Shift + X` (Extensions)
3. ابحث عن `Flutter String Extractor`
4. دوس `Install`

### من الملف
1. نزل ملف `.vsix`
2. `Ctrl + Shift + P` → `Extensions: Install from VSIX...`
3. اختار الملف

---

## 🎮 الاستخدام

### الطريقة 1: كلمة واحدة
1. حدد النص بالماوس، مثال: `"متاح"`
2. كليك يمين → **Extract to AppStrings (AR + EN)**
3. اكتب الاسم أو دوس Enter عشان تقبل الاقتراح `available`
4. اكتب الترجمة الانجليزية `Available` أو دوس Enter

**اختصار:** `Ctrl + Alt + S`

### الطريقة 2: كل الملف
1. كليك يمين في أي مكان فاضي في الملف
2. اختار **Extract All Strings in File to AppStrings**
3. دوس **أيوه حوّلهم**

هيحول كل النصوص مرة واحدة.

### مثال كامل

**قبل:**
```dart
Column(
 children: [
  Text("الرئيسيه"),
  Text("بيع جديد"),
  Text("متاح"),
 ],
)
```

**بعد:**
```dart
Column(
 children: [
  Text(AppStrings.home),
  Text(AppStrings.newSale),
  Text(AppStrings.available),
 ],
)
```

---

## ⚙️ الإعدادات

من `Settings` ابحث عن `Flutter String Extractor`:

| الإعداد | الافتراضي | الشرح |
| :--- | :--- | :--- |
| `className` | `AppStrings` | اسم الكلاس |
| `filePath` | `lib/core/constants/app_strings.dart` | مكان الملف |
| `enableTranslation` | `true` | يسأل عن الترجمة ولا لأ |

مثال لو عايز تغير مكان الملف:
```json
{
 "flutterStringExtractor.className": "AppStrings",
 "flutterStringExtractor.filePath": "lib/utils/strings.dart"
}
```

---

## ❓ أسئلة شائعة

**س: لو معنديش ملف AppStrings أصلاً؟**
ج: هو هيعمله لوحده، مش محتاج تعمل حاجة.

**س: لو النص موجود قبل كده؟**
ج: هيستخدم القديم، مش هيعمل تكرار.

**س: بيشتغل على مشاريع انجليزي بس؟**
ج: لا، بيشتغل عربي وانجليزي، وبيقترح الاسم بالانجليزي حتى لو النص عربي.

**س: لو غلطت في الاسم؟**
ج: غيره من ملف `AppStrings` عادي، واستخدم `Ctrl + Shift + H` عشان تغيره في كل المشروع.

---

## 🗺️ اللي جاي في V2.1

- [ ] دعم `easy_localization` و `flutter_localizations`
- [ ] Undo للتحويل
- [ ] Preview قبل التحويل
- [ ] إحصائيات: "لسه عندك 124 نص في المشروع"
- [ ] دعم ملفات `.arb`

لو عندك فكرة، كلمني واتساب: 01010009279 أو لينكد إن.

---

## 👨‍💻 عن المطور

**Adel Khaled**

- Flutter Developer
- من مصر
- بيعمل تطبيقات ومشاريع Flutter
- الـ Extension دي اتعملت من مشكلة حقيقية قابلته في شغله، لما لقى نفسه بيكتب نفس النصوص في 100 ملف، فقرر يعمل أداة تحل المشكلة دي لكل المطورين.

> لو الـ Extension فادتك، سيب تقييم ⭐⭐⭐⭐⭐ على الـ Marketplace، ده بيساعد ناس كتير تلاقيها.

## 📩 تواصل

لو لقيت Bug أو عندك اقتراح أو عايز تطلب ميزة جديدة، كلمني على طول:

- 📱 **واتساب:** 01010009279
- 💼 **لينكد إن:** [www.linkedin.com/in/adel-khelad-23a2223b3](https://www.linkedin.com/in/adel-khelad-23a2223b3)

برد بسرعة، ولو الفكرة حلوة هنفذها في التحديث الجاي.

## 📄 الرخصة

MIT License - استخدمها براحتك في أي مشروع، شخصي أو تجاري.

---
**Made by Adel Khaled | Flutter String Extractor v2.0.0 | Egypt 🇪🇬**
