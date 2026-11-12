export const languages = { am: "አማርኛ", en: "English", om: "Afaan Oromoo" };
export type Language = keyof typeof languages;

export function isLanguage(value: unknown): value is Language {
  return value === "am" || value === "en" || value === "om";
}

export const languageCookie = "etenesh-language";

const translations = {
  All: ["ሁሉም", "Hunda"],
  Apply: ["አመልክት", "Iyyadhu"],
  "Ask about enrollment": ["ስለ ምዝገባ ይጠይቁ", "Waa’ee galmee gaafadhu"],
  "Back to courses": ["ወደ ኮርሶች ተመለስ", "Gara koorsootaatti deebi’i"],
  "Back to job": ["ወደ ሥራው ተመለስ", "Gara hojii sanaatti deebi’i"],
  "Back to jobs": ["ወደ ሥራዎች ተመለስ", "Gara hojiiwwaniitti deebi’i"],
  "Browse jobs": ["ሥራዎችን ይመልከቱ", "Hojiiwwan ilaali"],
  "Browse jobs in Ethiopia and learn how to write a stronger CV, prepare for interviews, and apply with confidence.":
    [
      "በኢትዮጵያ ያሉ ሥራዎችን ይፈልጉ። የተሻለ ሲቪ ማዘጋጀት፣ ለቃለ መጠይቅ መዘጋጀት እና ለሥራ ማመልከት ይማሩ።",
      "Hojiiwwan Itoophiyaa keessa jiran barbaadi. CV gaarii qopheessuu, af-gaaffiif qophaa’uu fi hojii iyyachuu baradhu.",
    ],
  "Career guides": ["የሙያ መመሪያዎች", "Qajeelfamoota ogummaa"],
  "Careers in Ethiopia": ["ሥራ በኢትዮጵያ", "Hojiiwwan Itoophiyaa"],
  Closed: ["የተዘጉ", "Cufaman"],
  Companies: ["ኩባንያዎች", "Dhaabbilee"],
  "Companies hiring": ["በመቅጠር ላይ ያሉ ኩባንያዎች", "Dhaabbilee qacaraa jiran"],
  "Complete practice application": [
    "የልምምድ ማመልከቻውን ጨርስ",
    "Iyyata shaakalaa xumuri",
  ],
  "Course introduction": ["የኮርስ መግቢያ", "Seensa koorsii"],
  "Course outline": ["የኮርስ ይዘት", "Qabiyyee koorsii"],
  Courses: ["ኮርሶች", "Koorsoota"],
  "Courses and pricing": ["ኮርሶች እና ዋጋቸው", "Koorsootaa fi gatii isaanii"],
  "CV and Cover Letter": ["ሲቪ እና የማመልከቻ ደብዳቤ", "CV fi xalayaa iyyataa"],
  "Demo application": ["የሙከራ ማመልከቻ", "Iyyata fakkeenyaa"],
  "Demo price": ["የማሳያ ዋጋ", "Gatii fakkeenyaa"],
  "Demo prices. Contact Etenesh on Telegram for enrollment details.": [
    "እነዚህ የማሳያ ዋጋዎች ናቸው። ስለ ምዝገባ ኢተነሽን በቴሌግራም ያነጋግሩ።",
    "Gatiin kun gatii fakkeenyaa ti. Waa’ee galmee Etenesh Telegram irratti gaafadhu.",
  ],
  "Explore open roles by company, location, or type of work.": [
    "ክፍት ሥራዎችን በኩባንያ፣ በቦታ ወይም በሥራ ዓይነት ይፈልጉ።",
    "Hojiiwwan banaa dhaabbata, bakka ykn gosa hojiitiin barbaadi.",
  ],
  "Explore resources": ["መርጃዎችን ይመልከቱ", "Qabeenyawwan ilaali"],
  "Find your next role.": ["ቀጣዩን ሥራዎን ያግኙ።", "Hojii itti aanu barbaadi."],
  "Follow structured lessons and practice at your own pace.": [
    "የተደራጁ ትምህርቶችን ይከተሉ፣ በራስዎ ፍጥነት ይለማመዱ።",
    "Barnoota qindaa’e hordofi, saffisa keetiin shaakali.",
  ],
  "Get practical advice on CVs, applications, and interviews.": [
    "ስለ ሲቪ፣ ማመልከቻ እና ቃለ መጠይቅ ተግባራዊ ምክር ያግኙ።",
    "Waa’ee CV, iyyataa fi af-gaaffii gorsa hojii irra oolu argadhu.",
  ],
  "Get ready for it.": ["ለእሱም ይዘጋጁ።", "Isaaf qophaa’i."],
  "Get step-by-step help with your job search, CV, and interviews.": [
    "ሥራ ለመፈለግ፣ ሲቪ ለማዘጋጀት እና ለቃለ መጠይቅ ለመዘጋጀት ደረጃ በደረጃ ይማሩ።",
    "Hojii barbaaduu, CV qopheessuu fi af-gaaffiif qophaa’uu tartiibaan baradhu.",
  ],
  "Hiring this week": ["በዚህ ሳምንት የሚቀጥሩ", "Torban kana kan qacaran"],
  "Interview Preparation": ["የቃለ መጠይቅ ዝግጅት", "Qophii af-gaaffii"],
  "Job Search Foundations": ["የሥራ ፍለጋ መሠረቶች", "Bu’uura barbaacha hojii"],
  Jobs: ["ሥራዎች", "Hojiiwwan"],
  Language: ["ቋንቋ", "Afaan"],
  Menu: ["ምናሌ", "Baafata"],
  Open: ["ክፍት", "Banaa"],
  "Practice application": ["የልምምድ ማመልከቻ", "Iyyata shaakalaa"],
  "Practice application complete": [
    "የልምምድ ማመልከቻው ተጠናቋል",
    "Iyyanni shaakalaa xumurameera",
  ],
  "Preview course": ["ኮርሱን በቅድሚያ ይመልከቱ", "Koorsii dursee ilaali"],
  "Read career guides": ["የሙያ መመሪያዎችን ያንብቡ", "Qajeelfamoota ogummaa dubbisi"],
  "Ready to find your next role?": [
    "ቀጣዩን ሥራዎን ለማግኘት ዝግጁ ነዎት?",
    "Hojii itti aanu barbaaduuf qophoofteettaa?",
  ],
  "Remote-first": ["በዋናነት ከርቀት", "Dursa hojii fagoo"],
  "Sample email": ["የምሳሌ ኢሜይል", "Imeelii fakkeenyaa"],
  "Sample name": ["የምሳሌ ስም", "Maqaa fakkeenyaa"],
  "Sample note": ["የምሳሌ ማስታወሻ", "Yaadannoo fakkeenyaa"],
  Save: ["አስቀምጥ", "Olkaa’i"],
  Saved: ["የተቀመጡ", "Olkaa’aman"],
  "Saved jobs": ["የተቀመጡ ሥራዎች", "Hojiiwwan olkaa’aman"],
  Search: ["ፈልግ", "Barbaadi"],
  "Search companies": ["ኩባንያዎችን ፈልግ", "Dhaabbilee barbaadi"],
  "Search jobs": ["ሥራዎችን ፈልግ", "Hojiiwwan barbaadi"],
  "Search jobs by title or company": [
    "በሥራ መደብ ወይም በኩባንያ ፈልግ",
    "Maqaa hojii ykn dhaabbataatiin barbaadi",
  ],
  "Use sample information to try the applicant experience. This form sends and stores no data.":
    [
      "ለመለማመድ የምሳሌ መረጃ ይጠቀሙ። ይህ ቅጽ መረጃ አይልክም፣ አያከማችም።",
      "Shaakaluuf odeeffannoo fakkeenyaa fayyadami. Unki kun odeeffannoo hin ergu, hin kuusu.",
    ],
  "Watch on YouTube": ["በዩቲዩብ ይመልከቱ", "YouTube irratti ilaali"],
  "Watch the introduction": ["መግቢያውን ይመልከቱ", "Seensa ilaali"],
  "What would you like to do next?": [
    "ቀጥሎ ምን ማድረግ ይፈልጋሉ?",
    "Itti aansuun maal gochuu barbaadda?",
  ],
  "Your sample application stayed in this browser tab.": [
    "የምሳሌ ማመልከቻዎ በዚህ የአሳሽ ትር ውስጥ ብቻ ነው።",
    "Iyyanni fakkeenyaa kee tabii biraawzarii kana keessa qofa ture.",
  ],
} satisfies Record<string, [string, string]>;

export function translate(language: Language, text: string): string {
  if (language === "en" || !Object.hasOwn(translations, text)) {
    return text;
  }
  return translations[text as keyof typeof translations][
    language === "am" ? 0 : 1
  ];
}
