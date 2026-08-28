/**
 * AI Haat Digital Vault - Product Activation & Setup Guides Engine
 * Tailored instructions, security warnings, setup steps & troubleshooting for digital categories.
 */

export interface SetupStep {
  stepNumber: number;
  titleEn: string;
  titleBn: string;
  instructionEn: string;
  instructionBn: string;
  codeSnippet?: string;
  actionUrl?: string;
}

export interface SecurityWarning {
  titleEn: string;
  titleBn: string;
  textEn: string;
  textBn: string;
  severity: "danger" | "warning" | "info";
}

export interface TroubleshootingTip {
  problemEn: string;
  problemBn: string;
  solutionEn: string;
  solutionBn: string;
}

export interface ActivationGuide {
  categoryKey: string;
  categoryNameEn: string;
  categoryNameBn: string;
  badge: {
    textEn: string;
    textBn: string;
    color: "emerald" | "amber" | "blue" | "purple" | "rose";
  };
  summaryEn: string;
  summaryBn: string;
  securityWarnings: SecurityWarning[];
  setupSteps: SetupStep[];
  troubleshootingTips: TroubleshootingTip[];
  supportNoteEn: string;
  supportNoteBn: string;
}

// 1. AI TOOLS & API CREDENTIALS
export const AI_TOOLS_GUIDE: ActivationGuide = {
  categoryKey: "ai_tools",
  categoryNameEn: "AI Tools & API Subscriptions",
  categoryNameBn: "এআই টুলস ও এপিআই সাবস্ক্রিপশন",
  badge: {
    textEn: "AI Model Access",
    textBn: "এআই মডেল এক্সেস",
    color: "purple",
  },
  summaryEn: "Activate your AI tool subscription or integrate API tokens securely into your workflows.",
  summaryBn: "আপনার এআই টুল সাবস্ক্রিপশন চালু করুন অথবা এপিআই কি দিয়ে নিরাপদে কানেক্ট করুন।",
  securityWarnings: [
    {
      titleEn: "Do Not Change Account Details",
      titleBn: "অ্যাকাউন্টের কোনো তথ্য পরিবর্তন করবেন না",
      textEn: "Never modify account email, password, payment method, or billing preferences. Doing so will permanently void your warranty.",
      textBn: "অ্যাকাউন্টের ইমেইল, পাসওয়ার্ড বা পেমেন্ট মেথড পরিবর্তন করবেন না। এতে ওয়ারেন্টি বাতিল হবে।",
      severity: "danger",
    },
    {
      titleEn: "API Key Security",
      titleBn: "এপিআই কি সুরক্ষা",
      textEn: "Do not expose API keys in client-side code, public GitHub repos, or browser scripts.",
      textBn: "আপনার এপিআই কি কখনো পাবলিক গিটহাব বা ক্লায়েন্ট সাইড কোডে প্রকাশ করবেন না।",
      severity: "warning",
    },
    {
      titleEn: "Single Session / Device Rule",
      titleBn: "নির্দিষ্ট সেশন নিয়ম",
      textEn: "For shared plans, use only 1 active session at a time to prevent rate limits or automatic account suspension.",
      textBn: "শেয়ার্ড প্ল্যানের ক্ষেত্রে এক সাথে একাধিক ব্রাউজারে লগইন করবেন না যাতে অ্যাকাউন্ট লক না হয়।",
      severity: "info",
    },
  ],
  setupSteps: [
    {
      stepNumber: 1,
      titleEn: "Sign In to Official AI Portal",
      titleBn: "অফিসিয়াল এআই পোর্টালে লগইন করুন",
      instructionEn: "Navigate to the official login portal (e.g., chatgpt.com, claude.ai, perplexity.ai, midjourney.com).",
      instructionBn: "অফিসিয়াল পোর্টালে যান (যেমন: chatgpt.com, claude.ai, perplexity.ai)।",
    },
    {
      stepNumber: 2,
      titleEn: "Enter Provided Credentials",
      titleBn: "প্রদত্ত ইউজারনেম ও পাসওয়ার্ড দিয়ে লগইন করুন",
      instructionEn: "Use the copy button in your vault to paste the Email/Username and Password accurately without extra spaces.",
      instructionBn: "ভল্ট থেকে ইমেইল ও পাসওয়ার্ড কপি করে সতর্কতার সাথে পেস্ট করুন।",
    },
    {
      stepNumber: 3,
      titleEn: "Configure Environment Variable (For API Keys)",
      titleBn: "এপিআই কি এর ক্ষেত্রে এনভায়রনমেন্ট ভেরিয়েবল সেট করুন",
      instructionEn: "If you received an API key, store it in your backend .env file:",
      instructionBn: "এপিআই কি পেয়ে থাকলে আপনার ব্যাকএন্ড .env ফাইলে সংরক্ষণ করুন:",
      codeSnippet: "OPENAI_API_KEY=your_api_key_here\nANTHROPIC_API_KEY=your_api_key_here",
    },
  ],
  troubleshootingTips: [
    {
      problemEn: "Login says 'Wrong Password' or 'Incorrect Details'",
      problemBn: "লগইনে 'Wrong Password' দেখাচ্ছে",
      solutionEn: "Ensure no trailing spaces were copied. Clear browser cookies/cache or try an Incognito/Private window. If still failing, claim warranty replacement immediately.",
      solutionBn: "কপিতে কোনো বাড়তি স্পেস পড়েছে কিনা দেখুন। ইনকগনিটো উইন্ডোতে চেষ্টা করুন। কাজ না করলে রিপ্লেসমেন্ট ক্লেইম করুন।",
    },
    {
      problemEn: "Account is prompting for Email 2FA / OTP",
      problemBn: "ইমেইল ২এফএ বা ওটিপি চাচ্ছে",
      solutionEn: "If a 2FA code is needed and not included in your vault notes, submit a quick warranty claim to receive updated credentials.",
      solutionBn: "যদি ওটিপি চায় যা ভল্টে দেওয়া নেই, তবে অবিলম্বে ভল্ট থেকে রিপ্লেসমেন্ট ক্লেইম করুন।",
    },
  ],
  supportNoteEn: "AI accounts come with 100% replacement warranty during the active coverage duration.",
  supportNoteBn: "ওয়ারেন্টি চলাকালীন যেকোনো সমস্যায় ইনস্ট্যান্ট রিপ্লেসমেন্ট সুবিধা পাবেন।",
};

// 2. STREAMING & OTT SERVICES
export const STREAMING_GUIDE: ActivationGuide = {
  categoryKey: "streaming",
  categoryNameEn: "Streaming & OTT Services",
  categoryNameBn: "স্ট্রিমিং ও বিনোদন সেবা",
  badge: {
    textEn: "OTT & Entertainment",
    textBn: "ওটিটি ও বিনোদন",
    color: "rose",
  },
  summaryEn: "Log into your premium streaming account and access your dedicated screen profile.",
  summaryBn: "আপনার প্রিমিয়াম স্ট্রিমিং অ্যাকাউন্টে লগইন করে নির্দিষ্ট প্রোফাইল ব্যবহার করুন।",
  securityWarnings: [
    {
      titleEn: "Profile Integrity & PIN Protection",
      titleBn: "নির্দিষ্ট প্রোফাইল নিয়ম",
      textEn: "Strictly use ONLY your assigned profile. Do not modify profile names, avatars, or access other users' profiles.",
      textBn: "শুধুমাত্র আপনার জন্য নির্ধারিত প্রোফাইল ব্যবহার করুন। অন্য কারো প্রোফাইলে প্রবেশ বা নাম পরিবর্তন করবেন না।",
      severity: "danger",
    },
    {
      titleEn: "Strictly No Password / Email Changes",
      titleBn: "পাসওয়ার্ড বা ইমেইল পরিবর্তন নিষেধ",
      textEn: "Changing the master account password, recovery phone, or email will trigger an instant ban without refund.",
      textBn: "মাস্টার পাসওয়ার্ড বা ইমেইল পরিবর্তনের চেষ্টা করলে সাবস্ক্রিপশন সাথে সাথে বাতিল হবে।",
      severity: "danger",
    },
    {
      titleEn: "Device Limit Compliance",
      titleBn: "ডিভাইস লিমিট মেনে চলুন",
      textEn: "Use strictly on 1 screen/device at a time as per your purchased plan.",
      textBn: "আপনার ক্রয়কৃত প্যাকেজের নিয়ম অনুযায়ী নির্দিষ্ট সংখ্যক ডিভাইসেই ব্যবহার করুন।",
      severity: "warning",
    },
  ],
  setupSteps: [
    {
      stepNumber: 1,
      titleEn: "Open Streaming App or Website",
      titleBn: "স্ট্রিমিং অ্যাপ বা ওয়েবসাইটে যান",
      instructionEn: "Open the official Netflix, Prime Video, Spotify, Disney+, or Crunchyroll app on your TV, PC, or Mobile.",
      instructionBn: "অফিসিয়াল অ্যাপ (Netflix, Prime Video, Spotify ইত্যাদি) ওপেন করুন।",
    },
    {
      stepNumber: 2,
      titleEn: "Log In with Vault Credentials",
      titleBn: "ভল্টের তথ্য দিয়ে লগইন করুন",
      instructionEn: "Enter the email and password provided in your Digital Vault card.",
      instructionBn: "ভল্ট কার্ডে দেওয়া ইমেইল এবং পাসওয়ার্ড দিন।",
    },
    {
      stepNumber: 3,
      titleEn: "Select Your Assigned Profile",
      titleBn: "আপনার নির্ধারিত প্রোফাইল সিলেক্ট করুন",
      instructionEn: "Click on your assigned profile name/number (e.g. Profile 1, Screen A) and enter the 4-digit PIN if specified.",
      instructionBn: "আপনার প্রোফাইল নাম বেছে নিন এবং পিন দেওয়া থাকলে তা প্রদান করুন।",
    },
  ],
  troubleshootingTips: [
    {
      problemEn: "Account says 'Too many people are using the account right now'",
      problemBn: "Too many people are using the account দেখাচ্ছে",
      solutionEn: "Wait 5-10 minutes and ensure you are only streaming on 1 screen. If the error persists, report via warranty replacement.",
      solutionBn: "নিশ্চিত করুন আপনি একটি ডিভাইসেই চালাচ্ছেন। সমস্যা অব্যাহত থাকলে রিপ্লেসমেন্ট ক্লেইম করুন।",
    },
    {
      problemEn: "Household / Location Verification Prompt on Smart TV",
      problemBn: "স্মার্ট টিভিতে Household / Location ভেরিফিকেশন চাচ্ছে",
      solutionEn: "Select 'I'm Traveling' or 'Watch Temporarily' on screen. Contact support via WhatsApp if TV code activation is needed.",
      solutionBn: "স্ক্রিনে 'I'm Traveling' বেছে নিন। প্রয়োজন হলে হোয়াটসঅ্যপ সাপোর্টে যোগাযোগ করুন।",
    },
  ],
  supportNoteEn: "Full duration replacement warranty guaranteed for continuous streaming.",
  supportNoteBn: "সম্পূর্ণ মেয়াদের রিপ্লেসমেন্ট ওয়ারেন্টি নিশ্চয়তা।",
};

// 3. VPN & PRIVACY SERVICES
export const VPN_GUIDE: ActivationGuide = {
  categoryKey: "vpn",
  categoryNameEn: "VPN & Privacy Solutions",
  categoryNameBn: "ভিপিএন ও প্রাইভেসি সেবা",
  badge: {
    textEn: "Encrypted Privacy",
    textBn: "এনক্রিপ্টেড প্রাইভেসি",
    color: "blue",
  },
  summaryEn: "Setup high-speed encrypted VPN connections on PC, Mac, Android, and iOS.",
  summaryBn: "পিসি, ম্যাক, অ্যান্ড্রয়েড এবং আইওএসে হাই-স্পিড সিকিউর ভিপিএন সংযোগ চালু করুন।",
  securityWarnings: [
    {
      titleEn: "Do Not Change Account Credentials",
      titleBn: "অ্যাকাউন্ট ক্রেডেনশিয়াল পরিবর্তন করবেন না",
      textEn: "Account credentials are shared securely. Modifying settings or password will lock your access.",
      textBn: "পাসওয়ার্ড পরিবর্তনের চেষ্টা করবেন না।",
      severity: "danger",
    },
    {
      titleEn: "Protocol Recommendation",
      titleBn: "প্রোটোকল পরামর্শ",
      textEn: "For maximum speed and bypass capabilities in Bangladesh, select WireGuard, NordLynx, or Lightway protocol.",
      textBn: "সর্বোচ্চ স্পিড পেতে WireGuard বা NordLynx প্রোটোকল সিলেক্ট করুন।",
      severity: "info",
    },
  ],
  setupSteps: [
    {
      stepNumber: 1,
      titleEn: "Download Official VPN Client",
      titleBn: "অফিসিয়াল ভিপিএন অ্যাপ ডাউনলোড করুন",
      instructionEn: "Download the official client directly from NordVPN, Surfshark, ExpressVPN, or CyberGhost official download centers.",
      instructionBn: "অফিসিয়াল ওয়েবসাইট বা অ্যাপ স্টোর থেকে অ্যাপটি ডাউনলোড করুন।",
    },
    {
      stepNumber: 2,
      titleEn: "Authenticate with Vault Credentials",
      titleBn: "ভল্টের তথ্য দিয়ে লগইন করুন",
      instructionEn: "Log in using the delivered Email and Password. If 2FA is requested, check your vault instructions.",
      instructionBn: "ভল্টের ইমেইল ও পাসওয়ার্ড ব্যবহার করে লগইন করুন।",
    },
    {
      stepNumber: 3,
      titleEn: "Connect to High-Speed Server",
      titleBn: "পছন্দের সার্ভারে কানেক্ট করুন",
      instructionEn: "Choose a server close to your location (e.g., Singapore, India) for lowest ping and optimal speed.",
      instructionBn: "দ্রুততম স্পিডের জন্য নিকটস্থ সার্ভার (যেমন Singapore) কানেক্ট করুন।",
    },
  ],
  troubleshootingTips: [
    {
      problemEn: "VPN Disconnects or Cannot Connect in Local ISP",
      problemBn: "ভিপিএন কানেক্ট হতে সমস্যা হলে",
      solutionEn: "Switch VPN Protocol in app settings from Automatic to OpenVPN (TCP) or activate 'Obfuscated / Stealth Servers'.",
      solutionBn: "অ্যাপ সেটিংসে গিয়ে প্রোটোকল OpenVPN (TCP) বা Obfuscated Server অন করুন।",
    },
  ],
  supportNoteEn: "VPN accounts are monitored 24/7 for zero downtime.",
  supportNoteBn: "২৪/৭ নিরবচ্ছিন্ন ভিপিএন এক্সেস গ্যারান্টি।",
};

// 4. WINDOWS & MICROSOFT OFFICE LICENSES
export const WINDOWS_OFFICE_GUIDE: ActivationGuide = {
  categoryKey: "windows_office",
  categoryNameEn: "Windows & Office Genuine Licenses",
  categoryNameBn: "উইন্ডোজ ও অফিস জেনুইন লাইসেন্স",
  badge: {
    textEn: "Genuine Retail Key",
    textBn: "জেনুইন রিটেল কি",
    color: "emerald",
  },
  summaryEn: "Activate Windows 10/11 Pro, Office 2021/2024, or Office 365 with official Microsoft servers.",
  summaryBn: "অফিসিয়াল মাইক্রোসফট সার্ভারের মাধ্যমে উইন্ডোজ বা অফিস অ্যাক্টিভেট করুন।",
  securityWarnings: [
    {
      titleEn: "1 PC / 1 Device Rule",
      titleBn: "১ পিসি / ১ ডিভাইস নিয়ম",
      textEn: "Retail and OEM keys bind to your PC motherboard hardware ID. Do not attempt activating multiple computers with 1 key.",
      textBn: "একটি লাইসেন্স কি শুধুমাত্র ১টি কম্পিউটারে ব্যবহারযোগ্য। একাধিক পিসিতে ব্যবহার করা যাবে না।",
      severity: "danger",
    },
    {
      titleEn: "Clean Official ISO Requirement",
      titleBn: "অফিসিয়াল আইএসও বা বিল্ড প্রয়োজন",
      textEn: "Ensure you are running an official non-cracked Windows/Office build before entering the license key.",
      textBn: "লাইসেন্স কি ব্যবহারের পূর্বে নিশ্চিত করুন যে অফিসিয়াল মাইক্রোসফট সফটওয়্যার ইনস্টল আছে।",
      severity: "warning",
    },
  ],
  setupSteps: [
    {
      stepNumber: 1,
      titleEn: "Open Windows Activation Settings",
      titleBn: "উইন্ডোজ অ্যাক্টিভেশন সেটিংসে যান",
      instructionEn: "On Windows: Press Win + I -> Settings -> System -> Activation -> Change Product Key.",
      instructionBn: "উইন্ডোজ সেটিংসে গিয়ে System -> Activation -> Change Product Key অপশনে ক্লিক করুন।",
    },
    {
      stepNumber: 2,
      titleEn: "Paste License Key",
      titleBn: "লাইসেন্স কি পেস্ট করুন",
      instructionEn: "Copy the 25-character key (XXXXX-XXXXX-XXXXX-XXXXX-XXXXX) from your vault and paste it into the dialog.",
      instructionBn: "ভল্ট থেকে ২৫ ডিজিটের লাইসেন্স কি কপি করে পেস্ট করুন এবং Activate চাপুন।",
      codeSnippet: "slmgr.vbs /ipk XXXXX-XXXXX-XXXXX-XXXXX-XXXXX\nslmgr.vbs /ato",
    },
    {
      stepNumber: 3,
      titleEn: "Office 365 / Account Bind Setup",
      titleBn: "অফিস ৩৬৫ সেটআপ",
      instructionEn: "For Office accounts, visit setup.office.com or login.microsoftonline.com to download official installers.",
      instructionBn: "অফিসের ক্ষেত্রে setup.office.com অথবা login.microsoftonline.com এ লগইন করে সফটওয়্যার ডাউনলোড করুন।",
    },
  ],
  troubleshootingTips: [
    {
      problemEn: "Error code 0xC004C008 or 0xC004C060",
      problemBn: "এরর কোড 0xC004C008 বা 0xC004C060 আসলে",
      solutionEn: "This indicates Telephone Activation or a server refresh is required. Run 'slui 4' in Run dialog (Win+R) or claim instant key replacement.",
      solutionBn: "কীবোর্ডে Win+R চেপে 'slui 4' লিখে ফোন অ্যাক্টিভেশন করতে পারেন অথবা ইনস্ট্যান্ট কি রিপ্লেসমেন্ট ক্লেইম করুন।",
    },
    {
      problemEn: "Edition Mismatch (e.g., Home to Pro Upgrade)",
      problemBn: "হোম থেকে প্রো আপগ্রেড সমস্যা",
      solutionEn: "Disconnect internet, enter the Pro key to initiate upgrade download, and reconnect once rebooted.",
      solutionBn: "ইন্টারনেট সাময়িক বন্ধ করে প্রো কি দিয়ে আপগ্রেড শুরু করুন এবং রিবুট হওয়ার পর নেট কানেক্ট করুন।",
    },
  ],
  supportNoteEn: "Permanent lifetime activation warranty for genuine retail licenses.",
  supportNoteBn: "আজীবন স্থায়ী অ্যাক্টিভেশন লাইসেন্স নিশ্চয়তা।",
};

// 5. DEVELOPER, DESIGN & WORKSPACE TOOLS
export const DEVELOPER_TOOLS_GUIDE: ActivationGuide = {
  categoryKey: "developer",
  categoryNameEn: "Developer & Designer Pro Tools",
  categoryNameBn: "ডেভেলপার ও ডিজাইনার প্রো টুলস",
  badge: {
    textEn: "Developer Tier",
    textBn: "ডেভেলপার টিয়ার",
    color: "blue",
  },
  summaryEn: "Activate your Canva Pro, GitHub Copilot, JetBrains, Adobe CC, or Figma Professional license.",
  summaryBn: "ক্যানভা প্রো, গিটহাব কোপাইলট, জেটব্রেইন্স বা অ্যাডোবি ক্রিয়েটিভ ক্লাউড চালু করুন।",
  securityWarnings: [
    {
      titleEn: "Accept Team Workspace Invite",
      titleBn: "টিম ইনভাইট লিংক গ্রহণ করুন",
      textEn: "If an invitation link was delivered, click the link and accept joining the AI Haat Verified Team Workspace.",
      textBn: "ইনভাইটেশন লিংক দেওয়া থাকলে লিংকে ক্লিক করে টিম ওয়ার্কস্পেসে জয়েন করুন।",
      severity: "info",
    },
    {
      titleEn: "Personal Email Privacy",
      titleBn: "ব্যক্তিগত তথ্যের নিরাপত্তা",
      textEn: "Workspace admins cannot see your private files, code, or personal designs.",
      textBn: "টিমে জয়েন করলেও আপনার ব্যক্তিগত ডিজাইন বা ফাইল সম্পূর্ণ গোপন থাকবে।",
      severity: "info",
    },
  ],
  setupSteps: [
    {
      stepNumber: 1,
      titleEn: "Redeem Invite or Login",
      titleBn: "ইনভাইট লিংক রিডিম করুন",
      instructionEn: "If a custom link is provided, open it while logged into your personal account. If credentials are provided, sign in directly.",
      instructionBn: "ইনভাইট লিংক থাকলে নিজের অ্যাকাউন্টে লগইন থাকা অবস্থায় ওপেন করুন।",
    },
    {
      stepNumber: 2,
      titleEn: "Switch to Pro Team / Workspace",
      titleBn: "প্রো ওয়ার্কস্পেসে সুইচ করুন",
      instructionEn: "In account settings, switch from 'Personal' to the joined Pro workspace team to unlock all premium features.",
      instructionBn: "অ্যাকাউন্ট ড্রপডাউন থেকে যুক্ত হওয়া প্রো টিমে সুইচ করুন।",
    },
  ],
  troubleshootingTips: [
    {
      problemEn: "Invite link expired or says 'Team Full'",
      problemBn: "ইনভাইট লিংক এক্সপায়ার্ড বা টিম ফুল দেখালে",
      solutionEn: "Request a fresh team workspace invite link via the 1-click replacement warranty button in your vault.",
      solutionBn: "ভল্ট থেকে ১-ক্লিকে রিপ্লেসমেন্ট ক্লেইম করে নতুন ইনভাইট লিংক গ্রহণ করুন।",
    },
  ],
  supportNoteEn: "Seamless workspace access with instant replacement guarantee.",
  supportNoteBn: "নিরবচ্ছিন্ন প্রো অ্যাক্সেস সুবিধা।",
};

// 6. DEFAULT / GENERAL DIGITAL PRODUCTS
export const GENERAL_DIGITAL_GUIDE: ActivationGuide = {
  categoryKey: "general",
  categoryNameEn: "Digital Product & License",
  categoryNameBn: "ডিজিটাল প্রোডাক্ট ও লাইসেন্স",
  badge: {
    textEn: "Verified Digital Delivery",
    textBn: "ভেরিফাইড ডিজিটাল ডেলিভারি",
    color: "emerald",
  },
  summaryEn: "Instructions to access and activate your purchased digital software and subscription.",
  summaryBn: "আপনার ক্রয়কৃত ডিজিটাল সফটওয়্যার বা সাবস্ক্রিপশন চালু করার নির্দেশিকা।",
  securityWarnings: [
    {
      titleEn: "Credential Confidentiality",
      titleBn: "তথ্যের গোপনীয়তা রক্ষা করুন",
      textEn: "Never share your delivered credentials or license keys with untrusted third parties.",
      textBn: "আপনার লাইসেন্স বা লগইন তথ্য অন্য কারো সাথে শেয়ার করবেন না।",
      severity: "warning",
    },
    {
      titleEn: "Warranty Protection",
      titleBn: "ওয়ারেন্টি সুবিধা",
      textEn: "Keep your order ID handy. If any issue arises, claim self-service replacement directly from this vault card.",
      textBn: "যেকোনো সমস্যায় ভল্ট কার্ড থেকেই সরাসরি ১-ক্লিকে রিপ্লেসমেন্ট ক্লেইম করতে পারবেন।",
      severity: "info",
    },
  ],
  setupSteps: [
    {
      stepNumber: 1,
      titleEn: "Copy Delivered Credentials",
      titleBn: "ভল্ট থেকে তথ্য কপি করুন",
      instructionEn: "Click the copy button on your credential box to safely copy without extra spaces.",
      instructionBn: "ভল্টের কপি বাটনে ক্লিক করে সঠিক তথ্য কপি করে নিন।",
    },
    {
      stepNumber: 2,
      titleEn: "Apply in Official Application",
      titleBn: "অফিসিয়াল সফটওয়্যারে প্রয়োগ করুন",
      instructionEn: "Paste the credentials or product key into the official software activation screen.",
      instructionBn: "অফিসিয়াল সফটওয়্যার বা পোর্টালে তথ্য পেস্ট করে অ্যাক্টিভেট করুন।",
    },
  ],
  troubleshootingTips: [
    {
      problemEn: "Need assistance with activation?",
      problemBn: "অ্যাক্টিভেশনে সহায়তার প্রয়োজন হলে?",
      solutionEn: "Contact AI Haat Support directly via WhatsApp or submit a self-service warranty claim.",
      solutionBn: "আমাদের অফিশিয়াল হোয়াটসঅ্যাপ বা সাপোর্ট টিকিটে যোগাযোগ করুন।",
    },
  ],
  supportNoteEn: "AI Haat guarantee: 100% verified authentic digital products.",
  supportNoteBn: "এআই হাট গ্যারান্টি: শতভাগ জেনুইন ডিজিটাল পণ্য।",
};

/**
 * Intelligent Guide Resolver: Match product by category, name, or keywords
 */
export function resolveActivationGuide(product: {
  name?: string;
  category?: string;
  accountType?: string;
  productType?: string;
}): ActivationGuide {
  const combined = `${product.category || ""} ${product.name || ""} ${product.accountType || ""} ${product.productType || ""}`.toLowerCase();

  // 1. AI Tools
  if (
    combined.includes("chatgpt") ||
    combined.includes("claude") ||
    combined.includes("openai") ||
    combined.includes("midjourney") ||
    combined.includes("perplexity") ||
    combined.includes("gemini") ||
    combined.includes("cursor") ||
    combined.includes("deepseek") ||
    combined.includes("elevenlabs") ||
    combined.includes("suno") ||
    combined.includes("ai tool") ||
    combined.includes("api key")
  ) {
    return AI_TOOLS_GUIDE;
  }

  // 2. Streaming
  if (
    combined.includes("netflix") ||
    combined.includes("prime") ||
    combined.includes("spotify") ||
    combined.includes("youtube") ||
    combined.includes("disney") ||
    combined.includes("crunchyroll") ||
    combined.includes("hbo") ||
    combined.includes("hoichoi") ||
    combined.includes("chorki") ||
    combined.includes("zee5") ||
    combined.includes("streaming") ||
    combined.includes("ott") ||
    combined.includes("screen") ||
    combined.includes("profile")
  ) {
    return STREAMING_GUIDE;
  }

  // 3. VPN
  if (
    combined.includes("vpn") ||
    combined.includes("nordvpn") ||
    combined.includes("surfshark") ||
    combined.includes("expressvpn") ||
    combined.includes("cyberghost") ||
    combined.includes("ipvanish") ||
    combined.includes("proton")
  ) {
    return VPN_GUIDE;
  }

  // 4. Windows & Office
  if (
    combined.includes("windows") ||
    combined.includes("office") ||
    combined.includes("visio") ||
    combined.includes("project") ||
    combined.includes("microsoft") ||
    combined.includes("kms") ||
    combined.includes("win 10") ||
    combined.includes("win 11") ||
    combined.includes("retail key")
  ) {
    return WINDOWS_OFFICE_GUIDE;
  }

  // 5. Developer & Design
  if (
    combined.includes("canva") ||
    combined.includes("github") ||
    combined.includes("copilot") ||
    combined.includes("jetbrains") ||
    combined.includes("figma") ||
    combined.includes("adobe") ||
    combined.includes("photoshop") ||
    combined.includes("illustrator") ||
    combined.includes("envato") ||
    combined.includes("freepik")
  ) {
    return DEVELOPER_TOOLS_GUIDE;
  }

  // Default fallback
  return GENERAL_DIGITAL_GUIDE;
}
