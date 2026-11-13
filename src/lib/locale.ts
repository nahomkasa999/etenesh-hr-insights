export const LOCALE_COOKIE = "etenesh-locale";
export type Locale = "en" | "am";

export function normalizeLocale(value: string | undefined): Locale {
  return value === "am" ? "am" : "en";
}

const AMHARIC: Record<string, string> = {
  About: "ስለ እኛ",
  All: "ሁሉም",
  Apply: "ያመልክቱ",
  "Apply in five minutes.": "በአምስት ደቂቃ ውስጥ ያመልክቱ።",
  "Apply today.": "ዛሬ ያመልክቱ።",
  Banking: "ባንክ",
  "Browse jobs": "ስራዎችን ይመልከቱ",
  Companies: "ኩባንያዎች",
  Company: "ኩባንያ",
  Courses: "ኮርሶች",
  "Create alert": "ማሳወቂያ ፍጠር",
  Education: "ትምህርት",
  "Etenesh lists real jobs, checks each application against what the employer asked for, and updates you on Telegram at every step.":
    "እቴነሽ እውነተኛ ስራዎችን ያቀርባል፣ ማመልከቻዎችን ከአሰሪው መስፈርት ጋር ያወዳድራል እና በየደረጃው በቴሌግራም ያሳውቅዎታል።",
  "Ethiopian jobs from trusted employers, application updates on Telegram, and short career courses.":
    "ከታመኑ አሰሪዎች የኢትዮጵያ ስራዎች፣ በቴሌግራም የማመልከቻ ዝማኔዎች እና አጫጭር የሙያ ኮርሶች።",
  FAQ: "ተደጋጋሚ ጥያቄዎች",
  "Fill in your details, upload your CV and answer a few questions.":
    "መረጃዎን ይሙሉ፣ ሲቪዎን ይጫኑ እና ጥቂት ጥያቄዎችን ይመልሱ።",
  "Find a job": "ስራ ፈልግ",
  "Find work that fits you.": "ለእርስዎ የሚስማማ ስራ ያግኙ።",
  "Follow your application on Telegram": "የማመልከቻዎን ሂደት በቴሌግራም ይከታተሉ",
  "For employers": "ለአሰሪዎች",
  "Free to apply. Updates on Telegram.": "ማመልከት ነፃ ነው። ዝማኔዎችን በቴሌግራም ይቀበሉ።",
  "From vacancy to job offer.": "ከክፍት የስራ ቦታ እስከ ቅጥር ጥያቄ።",
  "Get reviewed": "ግምገማ",
  Health: "ጤና",
  "Hiring now in": "አሁን ቅጥር የሚያደርጉ",
  Hospitality: "መስተንግዶ",
  "How it works": "እንዴት እንደሚሰራ",
  "Interview and offer": "ቃለ መጠይቅ እና ቅጥር",
  "IT & Software": "ቴክኖሎጂ እና ሶፍትዌር",
  "Job alerts": "የስራ ማሳወቂያዎች",
  "Job seekers": "ስራ ፈላጊዎች",
  Jobs: "ስራዎች",
  Learn: "ይማሩ",
  Logistics: "ሎጂስቲክስ",
  Manufacturing: "ማምረቻ",
  Menu: "ምናሌ",
  New: "አዲስ",
  "New · Updates on Telegram": "አዲስ · በቴሌግራም ማሳወቂያዎች",
  NGOs: "መንግስታዊ ያልሆኑ ድርጅቶች",
  "One clear step at a time.": "በየደረጃው ግልጽ መረጃ።",
  "Open the job board": "የስራ ሰሌዳውን ክፈት",
  "Our HR team reviews your application. Telegram tells you the result.":
    "የሰው ሀብት ቡድናችን ማመልከቻዎን ይገመግማል። ውጤቱን በቴሌግራም ያሳውቅዎታል።",
  Privacy: "ግላዊነት",
  "Real vacancies from trusted Ethiopian employers. Apply with your CV, then follow every step of your application on Telegram.":
    "ከታመኑ የኢትዮጵያ አሰሪዎች እውነተኛ የስራ እድሎችን ያግኙ። በሲቪዎ ያመልክቱ፣ ከዚያም የማመልከቻዎን ሂደት በቴሌግራም ይከታተሉ።",
  Remote: "የርቀት",
  Saved: "የተቀመጡ",
  "Saved jobs": "የተቀመጡ ስራዎች",
  "Search by title or company. Filter by city, job type and level.":
    "በስራ መደብ ወይም በኩባንያ ይፈልጉ። በከተማ፣ በስራ አይነት እና በደረጃ ያጣሩ።",
  "Sectors hiring now": "አሁን ቅጥር የሚያደርጉ ዘርፎች",
  "See courses": "ኮርሶችን ይመልከቱ",
  "Shortlisted? You get the interview time, then the offer, on Telegram.":
    "ለቀጣይ ደረጃ ከተመረጡ የቃለ መጠይቅ ጊዜውን እና የቅጥር መረጃውን በቴሌግራም ያገኛሉ።",
  "Sign in": "ግባ",
  "Step 1": "ደረጃ 1",
  "Step 2": "ደረጃ 2",
  "Step 3": "ደረጃ 3",
  "Step 4": "ደረጃ 4",
  Terms: "ውሎች",
  "Your next job is waiting.": "ቀጣዩ ስራዎ ይጠብቅዎታል።",
};

export function translate(locale: Locale, english: string): string {
  return locale === "am" ? (AMHARIC[english] ?? english) : english;
}
