"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi" | "te";

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    te: string;
  };
}

export const translations: Translations = {
  // Brand & Tagline
  brandName: {
    en: "IronPulse",
    hi: "आयरनपल्स",
    te: "ఐరన్‌పల్స్",
  },
  tagline: {
    en: "Elite Gym Management & Fitness Intelligence",
    hi: "सर्वश्रेष्ठ जिम प्रबंधन और फिटनेस बुद्धिमत्ता",
    te: "ఉన్నత స్థాయి జిమ్ నిర్వహణ మరియు ఫిట్‌నెస్ ఇంటెలిజెన్స్",
  },
  welcomeHeader: {
    en: "Select Your IronPulse Portal",
    hi: "अपना आयरनपल्स पोर्टल चुनें",
    te: "మీ ఐరన్‌పల్స్ పోర్టల్‌ని ఎంచుకోండి",
  },
  welcomeSubheader: {
    en: "Tailored experience for club owners, elite trainers, and relentless members.",
    hi: "जिम मालिकों, विशेषज्ञ प्रशिक्षकों और समर्पित सदस्यों के लिए अनुकूलित अनुभव।",
    te: "జిమ్ యజమానులు, ట్రైనర్లు మరియు సభ్యుల కోసం ప్రత్యేక అనుభవం.",
  },

  // Role Cards
  ownerCardTitle: {
    en: "I'm the Gym Owner",
    hi: "मैं जिम का मालिक हूँ",
    te: "నేను జిమ్ యజమానిని",
  },
  ownerCardBadge: {
    en: "Boss Portal",
    hi: "बॉस पोर्टल",
    te: "బాస్ పోర్టల్",
  },
  ownerCardDesc: {
    en: "Full executive control: live floor occupancy, revenue analytics, member CRM, staff payroll, and multi-branch management.",
    hi: "पूर्ण नियंत्रण: लाइव उपस्थिति, राजस्व विश्लेषण, सदस्य प्रबंधन, वेतन और बहु-शाखा संचालन।",
    te: "పూర్తి నియంత్రణ: ప్రత్యక్ష హాజరు, ఆదాయ గణాంకాలు, సభ్యుల నిర్వహణ మరియు బహుళ బ్రాంచ్ కార్యకలాపాలు.",
  },
  memberCardTitle: {
    en: "I'm a Member",
    hi: "मैं एक सदस्य हूँ",
    te: "నేను ఒక సభ్యుడిని",
  },
  memberCardBadge: {
    en: "Athlete Portal",
    hi: "एथलीट पोर्टल",
    te: "అథ్లెట్ పోర్టల్",
  },
  memberCardDesc: {
    en: "Workout tracking, macro nutrition, class bookings, digital QR membership badge, AI coach, and gamified challenges.",
    hi: "कसरत ट्रैकिंग, पोषण डायरी, क्लास बुकिंग, डिजिटल क्यूआर कार्ड, एआई कोच और चुनौतियाँ।",
    te: "వర్కౌట్ ట్రాకింగ్, పోషకాహారం, క్లాస్ బుకింగ్స్, డిజిటల్ క్యూఆర్ కార్డ్ మరియు ఏఐ కోచ్.",
  },
  trainerOption: {
    en: "Trainer & Staff Access",
    hi: "प्रशिक्षक और स्टाफ प्रवेश",
    te: "ట్రైనర్ & స్టాఫ్ ప్రవేశం",
  },
  trainerOptionDesc: {
    en: "Client logs, custom workout assignments & commission tracking.",
    hi: "क्लाइंट लॉग, वर्कआउट असाइनमेंट और कमीशन ट्रैकिंग।",
    te: "క్లయింట్ లాగ్‌లు, వర్కౌట్ ప్లాన్లు మరియు కమీషన్ వివరాలు.",
  },

  // Auth & Form Labels
  loginTitle: {
    en: "Sign in to",
    hi: "लॉगिन करें",
    te: "లాగిన్ అవ్వండి",
  },
  emailLabel: {
    en: "Email Address",
    hi: "ईमेल पता",
    te: "ఈమెయిల్ చిరునామా",
  },
  phoneLabel: {
    en: "Phone Number",
    hi: "फ़ोन नंबर",
    te: "ఫోన్ నంబర్",
  },
  passwordLabel: {
    en: "Password",
    hi: "पासवर्ड",
    te: "పాస్‌వర్డ్",
  },
  rememberMe: {
    en: "Remember me",
    hi: "मुझे याद रखें",
    te: "నన్ను గుర్తుంచుకో",
  },
  forgotPassword: {
    en: "Forgot password?",
    hi: "पासवर्ड भूल गए?",
    te: "పాస్‌వర్డ్ మర్చిపోయారా?",
  },
  signInButton: {
    en: "Sign In",
    hi: "साइन इन करें",
    te: "సైన్ ఇన్ చేయండి",
  },
  signUpPrompt: {
    en: "Don't have an account?",
    hi: "खाता नहीं है?",
    te: "ఖాతా లేదా?",
  },
  signUpLink: {
    en: "Join with Gym Code",
    hi: "जिम कोड से जुड़ें",
    te: "జిమ్ కోడ్‌తో చేరండి",
  },
  demoQuickLogin: {
    en: "Quick 1-Click Demo Login",
    hi: "त्वरित 1-क्लिक डेमो लॉगिन",
    te: "శీఘ్ర 1-క్లిక్ డెమో లాగిన్",
  },
  demoOwnerBtn: {
    en: "Login as Owner (Boss)",
    hi: "मालिक के रूप में लॉगिन करें",
    te: "యజమానిగా లాగిన్ చేయండి",
  },
  demoMemberBtn: {
    en: "Login as Member",
    hi: "सदस्य के रूप में लॉगिन करें",
    te: "సభ్యుడిగా లాగిన్ చేయండి",
  },
  demoTrainerBtn: {
    en: "Login as Trainer",
    hi: "प्रशिक्षक के रूप में लॉगिन करें",
    te: "ట్రైనర్‌గా లాగిన్ చేయండి",
  },
  faceUnlockPlaceholder: {
    en: "Face Unlock / Biometric Sign-in",
    hi: "फेस अनलॉक / बायोमेट्रिक लॉगिन",
    te: "ఫేస్ అన్‌లాక్ / బయోమెట్రిక్ లాగిన్",
  },
  twoFactorLabel: {
    en: "Enable 2FA (Authenticator App)",
    hi: "2FA प्रमाणीकरण सक्षम करें",
    te: "2FA ప్రమాణీకరణ ప్రారంభించండి",
  },
  backToRoleSelect: {
    en: "← Switch Role",
    hi: "← भूमिका बदलें",
    te: "← పాత్రను మార్చండి",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("ironpulse_lang") as Language;
    if (saved && (saved === "en" || saved === "hi" || saved === "te")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("ironpulse_lang", lang);
  };

  const t = (key: string): string => {
    if (!translations[key]) return key;
    return translations[key][language] || translations[key].en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
