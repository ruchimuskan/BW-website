import type { AppLanguageCode } from "@/lib/app-language";

type MessageKey =
  | "personalInfo"
  | "personalInfoSubtitle"
  | "accountBadge"
  | "name"
  | "phoneNumber"
  | "email"
  | "emergencyContact"
  | "emergencyHint"
  | "emergencyConfigured"
  | "addEmergencyContact"
  | "notSet"
  | "contactDetails"
  | "safety"
  | "preferences"
  | "profileComplete"
  | "profileCompleteHint"
  | "profileCompleteDone"
  | "language"
  | "languageHint"
  | "chooseLanguage"
  | "verified"
  | "needed"
  | "addEmailHint"
  | "appLanguage"
  | "appLanguageDesc"
  | "languageSavedNote"
  | "goBack";

const en: Record<MessageKey, string> = {
  personalInfo: "Personal info",
  personalInfoSubtitle: "Manage how we reach you and keep your account secure.",
  accountBadge: "Bull Wave Rides account",
  name: "Name",
  phoneNumber: "Phone number",
  email: "Email",
  emergencyContact: "Emergency contact",
  emergencyHint: "Used for SOS during active rides",
  emergencyConfigured: "Ready for SOS alerts",
  addEmergencyContact: "Add a contact for SOS alerts",
  notSet: "Not set",
  contactDetails: "Contact details",
  safety: "Safety",
  preferences: "Preferences",
  profileComplete: "Profile complete",
  profileCompleteHint: "Complete your profile for faster SOS and account recovery.",
  profileCompleteDone: "Your profile is ready for rides and SOS.",
  language: "Language",
  languageHint: "Preferred language for Bull Wave Rides on this device",
  chooseLanguage: "Choose app language",
  verified: "Verified",
  needed: "Needed",
  addEmailHint: "Add an email to recover your account",
  appLanguage: "App language",
  appLanguageDesc: "Choose how Bull Wave Rides appears on this device.",
  languageSavedNote:
    "Preference is saved on this device. Full in-app translation rolls out over time.",
  goBack: "Go back",
};

const hi: Record<MessageKey, string> = {
  personalInfo: "व्यक्तिगत जानकारी",
  personalInfoSubtitle:
    "हम आपसे कैसे संपर्क करें और आपका खाता सुरक्षित कैसे रखें, इसे प्रबंधित करें।",
  accountBadge: "बुल वेव राइड्स खाता",
  name: "नाम",
  phoneNumber: "फ़ोन नंबर",
  email: "ईमेल",
  emergencyContact: "आपातकालीन संपर्क",
  emergencyHint: "सक्रिय राइड के दौरान SOS के लिए उपयोग होता है",
  emergencyConfigured: "SOS अलर्ट के लिए तैयार",
  addEmergencyContact: "SOS अलर्ट के लिए संपर्क जोड़ें",
  notSet: "सेट नहीं",
  contactDetails: "संपर्क विवरण",
  safety: "सुरक्षा",
  preferences: "प्राथमिकताएँ",
  profileComplete: "प्रोफ़ाइल पूर्ण",
  profileCompleteHint: "तेज़ SOS और खाता पुनर्प्राप्ति के लिए प्रोफ़ाइल पूरी करें।",
  profileCompleteDone: "आपकी प्रोफ़ाइल राइड और SOS के लिए तैयार है।",
  language: "भाषा",
  languageHint: "इस डिवाइस पर बुल वेव राइड्स के लिए पसंदीदा भाषा",
  chooseLanguage: "ऐप की भाषा चुनें",
  verified: "सत्यापित",
  needed: "आवश्यक",
  addEmailHint: "खाता पुनर्प्राप्ति के लिए ईमेल जोड़ें",
  appLanguage: "ऐप भाषा",
  appLanguageDesc: "चुनें कि बुल वेव राइड्स इस डिवाइस पर कैसे दिखे।",
  languageSavedNote:
    "पसंद इस डिवाइस पर सेव होती है। पूरा ऐप अनुवाद धीरे-धीरे उपलब्ध होगा।",
  goBack: "वापस जाएँ",
};

const bn: Record<MessageKey, string> = {
  personalInfo: "ব্যক্তিগত তথ্য",
  personalInfoSubtitle:
    "আমরা কীভাবে আপনার সঙ্গে যোগাযোগ করব এবং অ্যাকাউন্ট সুরক্ষিত রাখব তা পরিচালনা করুন।",
  accountBadge: "বুল ওয়েভ রাইডস অ্যাকাউন্ট",
  name: "নাম",
  phoneNumber: "ফোন নম্বর",
  email: "ইমেইল",
  emergencyContact: "জরুরি যোগাযোগ",
  emergencyHint: "সক্রিয় রাইডের সময় SOS-এর জন্য ব্যবহৃত হয়",
  emergencyConfigured: "SOS সতর্কতার জন্য প্রস্তুত",
  addEmergencyContact: "SOS সতর্কতার জন্য যোগাযোগ যোগ করুন",
  notSet: "সেট নয়",
  contactDetails: "যোগাযোগের বিবরণ",
  safety: "নিরাপত্তা",
  preferences: "পছন্দ",
  profileComplete: "প্রোফাইল সম্পূর্ণ",
  profileCompleteHint: "দ্রুত SOS এবং অ্যাকাউন্ট পুনরুদ্ধারের জন্য প্রোফাইল সম্পূর্ণ করুন।",
  profileCompleteDone: "আপনার প্রোফাইল রাইড এবং SOS-এর জন্য প্রস্তুত।",
  language: "ভাষা",
  languageHint: "এই ডিভাইসে বুল ওয়েভ রাইডসের পছন্দের ভাষা",
  chooseLanguage: "অ্যাপের ভাষা বেছে নিন",
  verified: "যাচাইকৃত",
  needed: "প্রয়োজন",
  addEmailHint: "অ্যাকাউন্ট পুনরুদ্ধারের জন্য ইমেইল যোগ করুন",
  appLanguage: "অ্যাপ ভাষা",
  appLanguageDesc: "এই ডিভাইসে বুল ওয়েভ রাইডস কীভাবে দেখাবে তা বেছে নিন।",
  languageSavedNote:
    "পছন্দ এই ডিভাইসে সংরক্ষিত হয়। পুরো অ্যাপ অনুবাদ ধীরে ধীরে আসবে।",
  goBack: "ফিরে যান",
};

const ta: Record<MessageKey, string> = {
  personalInfo: "தனிப்பட்ட தகவல்",
  personalInfoSubtitle:
    "நாங்கள் உங்களை எப்படி அடைவோம் மற்றும் உங்கள் கணக்கை பாதுகாப்பாக வைப்போம் என்பதை நிர்வகிக்கவும்.",
  accountBadge: "புல் வேவ் ரைட்ஸ் கணக்கு",
  name: "பெயர்",
  phoneNumber: "தொலைபேசி எண்",
  email: "மின்னஞ்சல்",
  emergencyContact: "அவசர தொடர்பு",
  emergencyHint: "செயலில் உள்ள சவாரியில் SOS-க்கு பயன்படும்",
  emergencyConfigured: "SOS எச்சரிக்கைகளுக்கு தயார்",
  addEmergencyContact: "SOS எச்சரிக்கைகளுக்கு தொடர்பைச் சேர்க்கவும்",
  notSet: "அமைக்கப்படவில்லை",
  contactDetails: "தொடர்பு விவரங்கள்",
  safety: "பாதுகாப்பு",
  preferences: "விருப்பங்கள்",
  profileComplete: "சுயவிவரம் முழுமை",
  profileCompleteHint: "விரைவான SOS மற்றும் கணக்கு மீட்புக்காக சுயவிவரத்தை முடிக்கவும்.",
  profileCompleteDone: "உங்கள் சுயவிவரம் பயணம் மற்றும் SOS-க்கு தயார்.",
  language: "மொழி",
  languageHint: "இந்த சாதனத்தில் புல் வேவ் ரைட்ஸுக்கான விருப்ப மொழி",
  chooseLanguage: "ஆப் மொழியைத் தேர்ந்தெடுக்கவும்",
  verified: "சரிபார்க்கப்பட்டது",
  needed: "தேவை",
  addEmailHint: "கணக்கை மீட்டெடுக்க மின்னஞ்சலைச் சேர்க்கவும்",
  appLanguage: "ஆப் மொழி",
  appLanguageDesc: "இந்த சாதனத்தில் புல் வேவ் ரைட்ஸ் எப்படி தோன்றும் என்பதைத் தேர்ந்தெடுக்கவும்.",
  languageSavedNote:
    "விருப்பம் இந்த சாதனத்தில் சேமிக்கப்படும். முழு ஆப் மொழிபெயர்ப்பு படிப்படியாக வரும்.",
  goBack: "பின்செல்",
};

const te: Record<MessageKey, string> = {
  personalInfo: "వ్యక్తిగత సమాచారం",
  personalInfoSubtitle:
    "మేము మిమ్మల్ని ఎలా సంప్రదించాలి మరియు మీ ఖాతాను సురక్షితంగా ఉంచాలో నిర్వహించండి.",
  accountBadge: "బుల్ వేవ్ రైడ్స్ ఖాతా",
  name: "పేరు",
  phoneNumber: "ఫోన్ నంబర్",
  email: "ఇమెయిల్",
  emergencyContact: "అత్యవసర సంప్రదింపు",
  emergencyHint: "యాక్టివ్ రైడ్ సమయంలో SOS కోసం ఉపయోగిస్తారు",
  emergencyConfigured: "SOS alerts కోసం సిద్ధం",
  addEmergencyContact: "SOS alerts కోసం సంప్రదింపును జోడించండి",
  notSet: "సెట్ చేయలేదు",
  contactDetails: "సంప్రదింపు వివరాలు",
  safety: "భద్రత",
  preferences: "ప్రాధాన్యతలు",
  profileComplete: "ప్రొఫైల్ పూర్తి",
  profileCompleteHint: "వేగ SOS మరియు ఖాతా రికవరీ కోసం ప్రొఫైల్ పూర్తి చేయండి.",
  profileCompleteDone: "మీ ప్రొఫైల్ రైడ్‌లు మరియు SOS కోసం సిద్ధంగా ఉంది.",
  language: "భాష",
  languageHint: "ఈ పరికరంలో బుల్ వేవ్ రైడ్స్ కోసం ఇష్టపడే భాష",
  chooseLanguage: "యాప్ భాషను ఎంచుకోండి",
  verified: "ధృవీకరించబడింది",
  needed: "అవసరం",
  addEmailHint: "ఖాతా రికవరీ కోసం ఇమెయిల్ జోడించండి",
  appLanguage: "యాప్ భాష",
  appLanguageDesc: "ఈ పరికరంలో బుల్ వేవ్ రైడ్స్ ఎలా కనిపించాలో ఎంచుకోండి.",
  languageSavedNote:
    "ప్రాధాన్యత ఈ పరికరంలో సేవ్ అవుతుంది. పూర్తి యాప్ అనువాదం క్రమంగా వస్తుంది.",
  goBack: "వెనుకకు",
};

const mr: Record<MessageKey, string> = {
  personalInfo: "वैयक्तिक माहिती",
  personalInfoSubtitle:
    "आम्ही तुमच्याशी कसे संपर्क साधू आणि तुमचे खाते सुरक्षित कसे ठेवू हे व्यवस्थापित करा.",
  accountBadge: "बुल वेव्ह राइड्स खाते",
  name: "नाव",
  phoneNumber: "फोन नंबर",
  email: "ईमेल",
  emergencyContact: "आणीबाणी संपर्क",
  emergencyHint: "सक्रिय राइड दरम्यान SOS साठी वापरले जाते",
  emergencyConfigured: "SOS सूचनांसाठी तयार",
  addEmergencyContact: "SOS सूचनांसाठी संपर्क जोडा",
  notSet: "सेट नाही",
  contactDetails: "संपर्क तपशील",
  safety: "सुरक्षा",
  preferences: "प्राधान्ये",
  profileComplete: "प्रोफाइल पूर्ण",
  profileCompleteHint: "जलद SOS आणि खाते पुनर्प्राप्तीसाठी प्रोफाइल पूर्ण करा.",
  profileCompleteDone: "तुमची प्रोफाइल राइड आणि SOS साठी तयार आहे.",
  language: "भाषा",
  languageHint: "या डिव्हाइसवर बुल वेव्ह राइड्ससाठी पसंतीची भाषा",
  chooseLanguage: "अॅप भाषा निवडा",
  verified: "पडताळले",
  needed: "आवश्यक",
  addEmailHint: "खाते पुनर्प्राप्तीसाठी ईमेल जोडा",
  appLanguage: "अॅप भाषा",
  appLanguageDesc: "या डिव्हाइसवर बुल वेव्ह राइड्स कसे दिसेल ते निवडा.",
  languageSavedNote:
    "पसंती या डिव्हाइसवर सेव्ह होते. संपूर्ण अॅप भाषांतर हळूहळू येईल.",
  goBack: "मागे जा",
};

const catalogs: Record<AppLanguageCode, Record<MessageKey, string>> = {
  en,
  hi,
  bn,
  ta,
  te,
  mr,
};

export type { MessageKey };

export function translate(
  code: AppLanguageCode,
  key: MessageKey,
): string {
  return catalogs[code]?.[key] ?? en[key] ?? key;
}
