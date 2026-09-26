import fs from "fs";
import path from "path";

// Color palettes
const PALETTES = {
  maleBg: ["#E0F2FE", "#DCFCE7", "#FEF3C7", "#EDE9FE", "#FFE4E6", "#CFFAFE", "#ECFCCB", "#E0E7FF"],
  femaleBg: ["#FCE7F3", "#FFEDD5", "#D1FAE5", "#EDE9FE", "#E0F2FE", "#FEF3C7", "#FFF7ED", "#FDF2F8"],
  skin: ["#FBD8B5", "#F6C89F", "#E8B382", "#FCD5B5", "#F8D7B8", "#E5A66B"],
  hair: ["#1F2937", "#2D3748", "#1A202C", "#3E2723", "#451A03", "#262626"],
};

interface AvatarConfig {
  id: string;
  gender: "male" | "female";
  svg: string;
}

const avatars: AvatarConfig[] = [
  // --- MALE 1: Techie with glasses & navy hoodie ---
  {
    id: "male-1",
    gender: "male",
    svg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="m1Clip"><rect width="128" height="128" rx="64" fill="#fff"/></clipPath>
    <linearGradient id="m1Bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#BAE6FD"/>
      <stop offset="1" stop-color="#E0F2FE"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#m1Clip)">
    <rect width="128" height="128" fill="url(#m1Bg)"/>
    <!-- Body / Navy Hoodie -->
    <path d="M24 132 C24 98 42 86 64 86 C86 86 104 98 104 132 Z" fill="#1E3A8A"/>
    <!-- Hoodie Inner Collar -->
    <path d="M52 86 C52 98 64 104 64 104 C64 104 76 98 76 86 Z" fill="#172554"/>
    <path d="M58 86 C58 92 64 96 64 96 C64 96 70 92 70 86 Z" fill="#FBD8B5"/>
    <path d="M60 98 L58 116" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
    <path d="M68 98 L70 116" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
    <!-- Neck -->
    <rect x="56" y="70" width="16" height="20" rx="4" fill="#F6C89F"/>
    <!-- Head / Face -->
    <ellipse cx="64" cy="58" rx="26" ry="28" fill="#FBD8B5"/>
    <!-- Ears -->
    <circle cx="37" cy="58" r="6" fill="#F6C89F"/>
    <circle cx="91" cy="58" r="6" fill="#F6C89F"/>
    <!-- Hair Base -->
    <path d="M38 52 C38 32 50 24 64 24 C78 24 90 32 90 52 C84 46 76 42 64 42 C50 42 42 46 38 52 Z" fill="#1F2937"/>
    <path d="M42 38 C48 30 58 26 68 28 C78 30 84 36 86 42 C80 36 70 34 62 36 C54 38 48 40 42 46 Z" fill="#374151"/>
    <!-- Cheeks Blush -->
    <circle cx="48" cy="65" r="4" fill="#FCA5A5" opacity="0.4"/>
    <circle cx="80" cy="65" r="4" fill="#FCA5A5" opacity="0.4"/>
    <!-- Glasses -->
    <rect x="44" y="50" width="16" height="13" rx="4" fill="#FFFFFF" fill-opacity="0.25" stroke="#1E293B" stroke-width="2.5"/>
    <rect x="68" y="50" width="16" height="13" rx="4" fill="#FFFFFF" fill-opacity="0.25" stroke="#1E293B" stroke-width="2.5"/>
    <path d="M60 56 L68 56" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M37 54 L44 54" stroke="#1E293B" stroke-width="2"/>
    <path d="M84 54 L91 54" stroke="#1E293B" stroke-width="2"/>
    <!-- Eyes behind glasses -->
    <circle cx="52" cy="56" r="2.5" fill="#0F172A"/>
    <circle cx="76" cy="56" r="2.5" fill="#0F172A"/>
    <circle cx="53" cy="55" r="0.9" fill="#FFFFFF"/>
    <circle cx="77" cy="55" r="0.9" fill="#FFFFFF"/>
    <!-- Eyebrows -->
    <path d="M46 47 C50 45 56 46 58 48" stroke="#1F2937" stroke-width="2" stroke-linecap="round"/>
    <path d="M70 48 C72 46 78 45 82 47" stroke="#1F2937" stroke-width="2" stroke-linecap="round"/>
    <!-- Smile -->
    <path d="M57 69 C60 74 68 74 71 69" stroke="#9A3412" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>`,
  },

  // --- MALE 2: Clean side-part polo guy (Sakib / Farhan) ---
  {
    id: "male-2",
    gender: "male",
    svg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="m2Clip"><rect width="128" height="128" rx="64" fill="#fff"/></clipPath>
    <linearGradient id="m2Bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#A7F3D0"/>
      <stop offset="1" stop-color="#DCFCE7"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#m2Clip)">
    <rect width="128" height="128" fill="url(#m2Bg)"/>
    <!-- Body / Emerald Polo -->
    <path d="M22 132 C22 96 40 84 64 84 C88 84 106 96 106 132 Z" fill="#047857"/>
    <!-- White Polo Collar -->
    <path d="M48 84 L64 98 L58 114 L42 90 Z" fill="#FFFFFF"/>
    <path d="M80 84 L64 98 L70 114 L86 90 Z" fill="#F1F5F9"/>
    <!-- Neck -->
    <rect x="56" y="68" width="16" height="20" rx="4" fill="#E8B382"/>
    <!-- Head -->
    <ellipse cx="64" cy="56" rx="25" ry="27" fill="#F6C89F"/>
    <!-- Ears -->
    <circle cx="38" cy="57" r="6" fill="#E8B382"/>
    <circle cx="90" cy="57" r="6" fill="#E8B382"/>
    <!-- Modern Side-Part Hair -->
    <path d="M37 48 C37 28 50 20 68 20 C82 20 91 30 91 48 C85 40 76 36 64 36 C48 36 40 42 37 48 Z" fill="#18181B"/>
    <path d="M42 30 C54 22 72 23 84 28 C74 25 60 26 48 32 Z" fill="#3F3F46"/>
    <!-- Eyes -->
    <ellipse cx="52" cy="55" rx="3" ry="3.5" fill="#18181B"/>
    <ellipse cx="76" cy="55" rx="3" ry="3.5" fill="#18181B"/>
    <circle cx="53" cy="54" r="1.1" fill="#FFFFFF"/>
    <circle cx="77" cy="54" r="1.1" fill="#FFFFFF"/>
    <!-- Cheeks Blush -->
    <circle cx="48" cy="63" r="4.5" fill="#FB923C" opacity="0.35"/>
    <circle cx="80" cy="63" r="4.5" fill="#FB923C" opacity="0.35"/>
    <!-- Eyebrows -->
    <path d="M46 47 C50 44 56 45 58 48" stroke="#18181B" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M70 48 C72 45 78 44 82 47" stroke="#18181B" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Confident Smile -->
    <path d="M56 67 C60 72 68 72 72 67" stroke="#9A3412" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M60 69 Q64 72 68 69" fill="#FFFFFF"/>
  </g>
</svg>`,
  },

  // --- MALE 3: Stylish trimmed beard & mustard jacket (Rafiul / Mahmud) ---
  {
    id: "male-3",
    gender: "male",
    svg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="m3Clip"><rect width="128" height="128" rx="64" fill="#fff"/></clipPath>
    <linearGradient id="m3Bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FDE68A"/>
      <stop offset="1" stop-color="#FEF3C7"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#m3Clip)">
    <rect width="128" height="128" fill="url(#m3Bg)"/>
    <!-- Mustard Jacket & White Tee -->
    <path d="M22 132 C22 96 42 84 64 84 C86 84 106 96 106 132 Z" fill="#D97706"/>
    <path d="M50 84 C50 102 64 116 64 116 C64 116 78 102 78 84 Z" fill="#F8FAFC"/>
    <!-- Neck -->
    <rect x="56" y="68" width="16" height="20" rx="4" fill="#E8B382"/>
    <!-- Head -->
    <ellipse cx="64" cy="56" rx="25" ry="27" fill="#F6C89F"/>
    <!-- Ears -->
    <circle cx="38" cy="57" r="6" fill="#E8B382"/>
    <circle cx="90" cy="57" r="6" fill="#E8B382"/>
    <!-- Wavy Hair -->
    <path d="M37 46 C36 28 50 20 64 20 C78 20 92 28 91 46 C84 38 74 34 64 34 C54 34 44 38 37 46 Z" fill="#1C1917"/>
    <circle cx="48" cy="28" r="8" fill="#1C1917"/>
    <circle cx="64" cy="24" r="8" fill="#1C1917"/>
    <circle cx="78" cy="28" r="8" fill="#1C1917"/>
    <!-- Trimmed Beard & Mustache -->
    <path d="M42 60 C42 80 54 84 64 84 C74 84 86 80 86 60 C86 74 74 80 64 80 C54 80 42 74 42 60 Z" fill="#292524"/>
    <path d="M54 68 C58 66 70 66 74 68 C70 70 58 70 54 68 Z" fill="#292524"/>
    <!-- Eyes -->
    <ellipse cx="52" cy="54" rx="3" ry="3.2" fill="#1C1917"/>
    <ellipse cx="76" cy="54" rx="3" ry="3.2" fill="#1C1917"/>
    <circle cx="53" cy="53" r="1" fill="#FFFFFF"/>
    <circle cx="77" cy="53" r="1" fill="#FFFFFF"/>
    <!-- Eyebrows -->
    <path d="M46 46 C50 43 56 44 58 47" stroke="#1C1917" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M70 47 C72 44 78 43 82 46" stroke="#1C1917" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Smile -->
    <path d="M58 72 C61 75 67 75 70 72" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>`,
  },

  // --- MALE 4: Gamer / DJ with over-ear violet headphones (Ahsan / Arif) ---
  {
    id: "male-4",
    gender: "male",
    svg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="m4Clip"><rect width="128" height="128" rx="64" fill="#fff"/></clipPath>
    <linearGradient id="m4Bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#DDD6FE"/>
      <stop offset="1" stop-color="#EDE9FE"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#m4Clip)">
    <rect width="128" height="128" fill="url(#m4Bg)"/>
    <!-- Violet Sweatshirt -->
    <path d="M22 132 C22 96 40 84 64 84 C88 84 106 96 106 132 Z" fill="#6D28D9"/>
    <!-- Neck -->
    <rect x="56" y="68" width="16" height="20" rx="4" fill="#F8D7B8"/>
    <!-- Head -->
    <ellipse cx="64" cy="56" rx="25" ry="27" fill="#FBD8B5"/>
    <!-- Headphone Band Over Head -->
    <path d="M34 52 C34 26 94 26 94 52" stroke="#4C1D95" stroke-width="6" stroke-linecap="round"/>
    <!-- Spiky Hair -->
    <path d="M38 48 C38 30 52 24 64 24 C76 24 88 30 88 48 C82 42 74 38 64 38 C54 38 44 42 38 48 Z" fill="#451A03"/>
    <path d="M48 30 L54 22 L60 30 L66 20 L72 30" fill="#451A03"/>
    <!-- Headphone Earcups -->
    <rect x="29" y="46" width="10" height="22" rx="5" fill="#7C3AED" stroke="#4C1D95" stroke-width="2"/>
    <rect x="89" y="46" width="10" height="22" rx="5" fill="#7C3AED" stroke="#4C1D95" stroke-width="2"/>
    <!-- Cheeks Blush -->
    <circle cx="48" cy="64" r="4.5" fill="#F43F5E" opacity="0.3"/>
    <circle cx="80" cy="64" r="4.5" fill="#F43F5E" opacity="0.3"/>
    <!-- Energetic Winking Eyes -->
    <ellipse cx="52" cy="55" rx="3.2" ry="3.5" fill="#1E1B4B"/>
    <circle cx="53" cy="54" r="1.1" fill="#FFFFFF"/>
    <!-- Cute Wink on Right Eye -->
    <path d="M72 56 C74 53 78 53 80 56" stroke="#1E1B4B" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Eyebrows -->
    <path d="M46 47 C50 44 56 45 58 48" stroke="#451A03" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M70 47 C72 45 78 44 82 46" stroke="#451A03" stroke-width="2.2" stroke-linecap="round"/>
    <!-- Playful Open Smile -->
    <path d="M56 67 C56 74 72 74 72 67 Z" fill="#BE123C"/>
    <path d="M58 67 C60 69 68 69 70 67" stroke="#FFFFFF" stroke-width="2"/>
  </g>
</svg>`,
  },

  // --- MALE 5: Cool guy with streetwear cap (Sabbir / Zubair) ---
  {
    id: "male-5",
    gender: "male",
    svg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="m5Clip"><rect width="128" height="128" rx="64" fill="#fff"/></clipPath>
    <linearGradient id="m5Bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FECDD3"/>
      <stop offset="1" stop-color="#FFE4E6"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#m5Clip)">
    <rect width="128" height="128" fill="url(#m5Bg)"/>
    <!-- Charcoal Streetwear Hoodie -->
    <path d="M22 132 C22 96 40 84 64 84 C88 84 106 96 106 132 Z" fill="#334155"/>
    <path d="M52 84 C52 98 64 106 64 106 C64 106 76 98 76 84 Z" fill="#1E293B"/>
    <!-- Neck -->
    <rect x="56" y="68" width="16" height="20" rx="4" fill="#E5A66B"/>
    <!-- Head -->
    <ellipse cx="64" cy="58" rx="25" ry="27" fill="#F6C89F"/>
    <!-- Ears -->
    <circle cx="38" cy="59" r="6" fill="#E5A66B"/>
    <circle cx="90" cy="59" r="6" fill="#E5A66B"/>
    <!-- Cool Cap (Turned Backward/Slanted) -->
    <path d="M36 44 C36 28 50 20 66 20 C82 20 92 28 92 44 Z" fill="#0284C7"/>
    <path d="M30 44 C30 40 98 40 98 44 C98 48 30 48 30 44 Z" fill="#0369A1"/>
    <!-- Hair peeking out -->
    <path d="M38 50 C40 54 44 56 46 52" stroke="#18181B" stroke-width="3" stroke-linecap="round"/>
    <path d="M82 52 C84 56 88 54 90 50" stroke="#18181B" stroke-width="3" stroke-linecap="round"/>
    <!-- Eyes -->
    <ellipse cx="52" cy="57" rx="3" ry="3.2" fill="#0F172A"/>
    <ellipse cx="76" cy="57" rx="3" ry="3.2" fill="#0F172A"/>
    <circle cx="53" cy="56" r="1" fill="#FFFFFF"/>
    <circle cx="77" cy="56" r="1" fill="#FFFFFF"/>
    <!-- Eyebrows -->
    <path d="M46 50 C50 47 56 48 58 51" stroke="#18181B" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M70 51 C72 48 78 47 82 50" stroke="#18181B" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Sideways Grin -->
    <path d="M57 69 C62 74 72 72 73 68" stroke="#9A3412" stroke-width="2.2" stroke-linecap="round"/>
  </g>
</svg>`,
  },

  // --- MALE 6: Minimalist smart casual with round spectacles (Mehedi / Shahriar) ---
  {
    id: "male-6",
    gender: "male",
    svg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="m6Clip"><rect width="128" height="128" rx="64" fill="#fff"/></clipPath>
    <linearGradient id="m6Bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#A5F3FC"/>
      <stop offset="1" stop-color="#CFFAFE"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#m6Clip)">
    <rect width="128" height="128" fill="url(#m6Bg)"/>
    <!-- Denim Shirt -->
    <path d="M22 132 C22 96 40 84 64 84 C88 84 106 96 106 132 Z" fill="#0284C7"/>
    <path d="M64 84 L64 128" stroke="#0369A1" stroke-width="3"/>
    <circle cx="64" cy="98" r="2" fill="#FFFFFF"/>
    <circle cx="64" cy="112" r="2" fill="#FFFFFF"/>
    <!-- Neck -->
    <rect x="56" y="68" width="16" height="20" rx="4" fill="#E8B382"/>
    <!-- Head -->
    <ellipse cx="64" cy="56" rx="25" ry="27" fill="#FBD8B5"/>
    <!-- Ears -->
    <circle cx="38" cy="57" r="6" fill="#E8B382"/>
    <circle cx="90" cy="57" r="6" fill="#E8B382"/>
    <!-- Neat Crew Cut -->
    <path d="M38 48 C38 28 50 22 64 22 C78 22 90 28 90 48 C84 42 76 38 64 38 C52 38 44 42 38 48 Z" fill="#292524"/>
    <!-- Cheeks Blush -->
    <circle cx="48" cy="65" r="4" fill="#FCA5A5" opacity="0.3"/>
    <circle cx="80" cy="65" r="4" fill="#FCA5A5" opacity="0.3"/>
    <!-- Round Spectacles -->
    <circle cx="51" cy="55" r="9" fill="#FFFFFF" fill-opacity="0.3" stroke="#854D0E" stroke-width="2.2"/>
    <circle cx="77" cy="55" r="9" fill="#FFFFFF" fill-opacity="0.3" stroke="#854D0E" stroke-width="2.2"/>
    <path d="M60 55 L68 55" stroke="#854D0E" stroke-width="2.2"/>
    <!-- Eyes -->
    <circle cx="51" cy="55" r="2.8" fill="#1C1917"/>
    <circle cx="77" cy="55" r="2.8" fill="#1C1917"/>
    <circle cx="52" cy="54" r="1" fill="#FFFFFF"/>
    <circle cx="78" cy="54" r="1" fill="#FFFFFF"/>
    <!-- Eyebrows -->
    <path d="M44 44 C48 42 54 43 56 45" stroke="#292524" stroke-width="2" stroke-linecap="round"/>
    <path d="M72 45 C74 43 80 42 84 44" stroke="#292524" stroke-width="2" stroke-linecap="round"/>
    <!-- Calm Smile -->
    <path d="M58 68 C61 72 67 72 70 68" stroke="#9A3412" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>`,
  },

  // --- MALE 7: Cheerful curly hair student in coral hoodie (Nabil / Rakib) ---
  {
    id: "male-7",
    gender: "male",
    svg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="m7Clip"><rect width="128" height="128" rx="64" fill="#fff"/></clipPath>
    <linearGradient id="m7Bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#D9F99D"/>
      <stop offset="1" stop-color="#ECFCCB"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#m7Clip)">
    <rect width="128" height="128" fill="url(#m7Bg)"/>
    <!-- Coral Hoodie -->
    <path d="M22 132 C22 96 40 84 64 84 C88 84 106 96 106 132 Z" fill="#EA580C"/>
    <path d="M52 84 C52 98 64 104 64 104 C64 104 76 98 76 84 Z" fill="#C2410C"/>
    <!-- Neck -->
    <rect x="56" y="68" width="16" height="20" rx="4" fill="#F6C89F"/>
    <!-- Head -->
    <ellipse cx="64" cy="56" rx="25" ry="27" fill="#FBD8B5"/>
    <!-- Ears -->
    <circle cx="38" cy="57" r="6" fill="#F6C89F"/>
    <circle cx="90" cy="57" r="6" fill="#F6C89F"/>
    <!-- Curly Afro/Texture Hair -->
    <circle cx="44" cy="38" r="9" fill="#1C1917"/>
    <circle cx="56" cy="30" r="9" fill="#1C1917"/>
    <circle cx="72" cy="30" r="9" fill="#1C1917"/>
    <circle cx="84" cy="38" r="9" fill="#1C1917"/>
    <circle cx="64" cy="24" r="9" fill="#1C1917"/>
    <circle cx="38" cy="46" r="7" fill="#1C1917"/>
    <circle cx="90" cy="46" r="7" fill="#1C1917"/>
    <!-- Eyes -->
    <ellipse cx="52" cy="55" rx="3.2" ry="3.5" fill="#18181B"/>
    <ellipse cx="76" cy="55" rx="3.2" ry="3.5" fill="#18181B"/>
    <circle cx="53" cy="54" r="1.1" fill="#FFFFFF"/>
    <circle cx="77" cy="54" r="1.1" fill="#FFFFFF"/>
    <!-- Cheeks Blush -->
    <circle cx="47" cy="63" r="5" fill="#FB7185" opacity="0.4"/>
    <circle cx="81" cy="63" r="5" fill="#FB7185" opacity="0.4"/>
    <!-- Eyebrows -->
    <path d="M46 47 C50 44 56 45 58 48" stroke="#1C1917" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M70 48 C72 45 78 44 82 47" stroke="#1C1917" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Big Happy Smile -->
    <path d="M54 66 C54 75 74 75 74 66 Z" fill="#991B1B"/>
    <path d="M57 66 C59 69 69 69 71 66" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
  </g>
</svg>`,
  },

  // --- MALE 8: Tech lead / Dev in indigo zip jacket (Hasan / Fahim) ---
  {
    id: "male-8",
    gender: "male",
    svg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="m8Clip"><rect width="128" height="128" rx="64" fill="#fff"/></clipPath>
    <linearGradient id="m8Bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#C7D2FE"/>
      <stop offset="1" stop-color="#E0E7FF"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#m8Clip)">
    <rect width="128" height="128" fill="url(#m8Bg)"/>
    <!-- Indigo Zip Jacket -->
    <path d="M22 132 C22 96 40 84 64 84 C88 84 106 96 106 132 Z" fill="#4338CA"/>
    <path d="M64 84 L64 128" stroke="#818CF8" stroke-width="2.5"/>
    <rect x="62" y="92" width="4" height="6" rx="1" fill="#FFFFFF"/>
    <!-- Neck -->
    <rect x="56" y="68" width="16" height="20" rx="4" fill="#E8B382"/>
    <!-- Head -->
    <ellipse cx="64" cy="56" rx="25" ry="27" fill="#F6C89F"/>
    <!-- Ears -->
    <circle cx="38" cy="57" r="6" fill="#E8B382"/>
    <circle cx="90" cy="57" r="6" fill="#E8B382"/>
    <!-- Stylish Tapered Hair -->
    <path d="M37 46 C37 26 52 18 68 18 C84 18 91 28 91 46 C84 38 74 32 62 34 C48 36 40 42 37 46 Z" fill="#1E293B"/>
    <!-- Eyes -->
    <ellipse cx="52" cy="55" rx="3" ry="3.2" fill="#0F172A"/>
    <ellipse cx="76" cy="55" rx="3" ry="3.2" fill="#0F172A"/>
    <circle cx="53" cy="54" r="1" fill="#FFFFFF"/>
    <circle cx="77" cy="54" r="1" fill="#FFFFFF"/>
    <!-- Light Designer Stubble -->
    <path d="M52 74 C56 78 72 78 76 74" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 3"/>
    <!-- Eyebrows -->
    <path d="M46 47 C50 44 56 45 58 48" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M70 48 C72 45 78 44 82 47" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Confident Smile -->
    <path d="M57 67 C61 71 67 71 71 67" stroke="#9A3412" stroke-width="2.2" stroke-linecap="round"/>
  </g>
</svg>`,
  },

  // ==================== FEMALE AVATARS ====================

  // --- FEMALE 1: Modern Rose/Mauve Hijabi (Nusrat / Tasnim) ---
  {
    id: "female-1",
    gender: "female",
    svg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="f1Clip"><rect width="128" height="128" rx="64" fill="#fff"/></clipPath>
    <linearGradient id="f1Bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FBCFE8"/>
      <stop offset="1" stop-color="#FCE7F3"/>
    </linearGradient>
    <linearGradient id="f1Hijab" x1="30" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F472B6"/>
      <stop offset="1" stop-color="#DB2777"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#f1Clip)">
    <rect width="128" height="128" fill="url(#f1Bg)"/>
    <!-- Modest Lavender Blouse -->
    <path d="M22 132 C22 98 40 88 64 88 C88 88 106 98 106 132 Z" fill="#9333EA"/>
    <!-- Hijab Drapery on Shoulders -->
    <path d="M30 92 C30 84 48 80 64 80 C80 80 98 84 98 92 C98 118 78 128 64 128 C50 128 30 118 30 92 Z" fill="url(#f1Hijab)"/>
    <path d="M46 94 C54 104 74 104 82 94" stroke="#BE185D" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Hijab Outer Wrap Around Head -->
    <ellipse cx="64" cy="54" rx="33" ry="34" fill="url(#f1Hijab)"/>
    <!-- Inner Face Oval -->
    <ellipse cx="64" cy="57" rx="20" ry="23" fill="#FBD8B5"/>
    <!-- Under-cap fold / framing -->
    <path d="M48 46 C54 41 74 41 80 46 C74 43 54 43 48 46 Z" fill="#9D174D"/>
    <!-- Soft Cheeks Blush -->
    <circle cx="52" cy="65" r="4.5" fill="#FB7185" opacity="0.45"/>
    <circle cx="76" cy="65" r="4.5" fill="#FB7185" opacity="0.45"/>
    <!-- Almond Eyes with delicate lashes -->
    <ellipse cx="54" cy="56" rx="3.2" ry="3.5" fill="#18181B"/>
    <ellipse cx="74" cy="56" rx="3.2" ry="3.5" fill="#18181B"/>
    <circle cx="55" cy="55" r="1.1" fill="#FFFFFF"/>
    <circle cx="75" cy="55" r="1.1" fill="#FFFFFF"/>
    <!-- Eyelash flicks -->
    <path d="M57 53 L60 51" stroke="#18181B" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M71 53 L68 51" stroke="#18181B" stroke-width="1.5" stroke-linecap="round"/>
    <!-- Graceful Eyebrows -->
    <path d="M48 49 C52 46 57 47 59 49" stroke="#500724" stroke-width="2" stroke-linecap="round"/>
    <path d="M69 49 C71 47 76 46 80 49" stroke="#500724" stroke-width="2" stroke-linecap="round"/>
    <!-- Sweet Rosy Smile -->
    <path d="M58 68 C61 72 67 72 70 68" stroke="#E11D48" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M60 69 Q64 72 68 69" fill="#FFF1F2"/>
  </g>
</svg>`,
  },

  // --- FEMALE 2: Modern bob cut with rose-gold glasses (Nafisa / Sadia) ---
  {
    id: "female-2",
    gender: "female",
    svg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="f2Clip"><rect width="128" height="128" rx="64" fill="#fff"/></clipPath>
    <linearGradient id="f2Bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FED7AA"/>
      <stop offset="1" stop-color="#FFEDD5"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#f2Clip)">
    <rect width="128" height="128" fill="url(#f2Bg)"/>
    <!-- Coral Knit Top -->
    <path d="M22 132 C22 96 40 84 64 84 C88 84 106 96 106 132 Z" fill="#F97316"/>
    <!-- Neck -->
    <rect x="57" y="68" width="14" height="20" rx="4" fill="#F6C89F"/>
    <!-- Head -->
    <ellipse cx="64" cy="56" rx="23" ry="26" fill="#FCE0CA"/>
    <!-- Modern Bob Hair Behind -->
    <path d="M34 50 C34 30 48 20 64 20 C80 20 94 30 94 50 C94 66 90 76 86 80 C84 76 84 64 84 56 C84 40 76 34 64 34 C52 34 44 40 44 56 C44 64 44 76 42 80 C38 76 34 66 34 50 Z" fill="#1C1917"/>
    <!-- Bob Hair Bangs -->
    <path d="M42 36 C50 30 64 28 86 36 C80 34 72 32 64 32 C54 32 46 34 42 36 Z" fill="#292524"/>
    <!-- Cheeks Blush -->
    <circle cx="48" cy="64" r="5" fill="#FB7185" opacity="0.45"/>
    <circle cx="80" cy="64" r="5" fill="#FB7185" opacity="0.45"/>
    <!-- Rose-Gold Trendy Round Glasses -->
    <circle cx="51" cy="55" r="9.5" fill="#FFFFFF" fill-opacity="0.3" stroke="#E11D48" stroke-width="2"/>
    <circle cx="77" cy="55" r="9.5" fill="#FFFFFF" fill-opacity="0.3" stroke="#E11D48" stroke-width="2"/>
    <path d="M60.5 55 L67.5 55" stroke="#E11D48" stroke-width="2"/>
    <!-- Eyes behind glasses -->
    <ellipse cx="51" cy="55" rx="3" ry="3.2" fill="#18181B"/>
    <ellipse cx="77" cy="55" rx="3" ry="3.2" fill="#18181B"/>
    <circle cx="52" cy="54" r="1.1" fill="#FFFFFF"/>
    <circle cx="78" cy="54" r="1.1" fill="#FFFFFF"/>
    <!-- Eyelash -->
    <path d="M54 52 L57 50" stroke="#18181B" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M74 52 L71 50" stroke="#18181B" stroke-width="1.5" stroke-linecap="round"/>
    <!-- Eyebrows -->
    <path d="M45 44 C49 42 54 43 56 45" stroke="#1C1917" stroke-width="2" stroke-linecap="round"/>
    <path d="M72 45 C74 43 79 42 83 44" stroke="#1C1917" stroke-width="2" stroke-linecap="round"/>
    <!-- Bright Radiant Smile -->
    <path d="M57 68 C60 73 68 73 71 68" stroke="#BE123C" stroke-width="2.2" stroke-linecap="round"/>
  </g>
</svg>`,
  },

  // --- FEMALE 3: Chic Emerald/Teal Hijabi (Anika / Farzana) ---
  {
    id: "female-3",
    gender: "female",
    svg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="f3Clip"><rect width="128" height="128" rx="64" fill="#fff"/></clipPath>
    <linearGradient id="f3Bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#A7F3D0"/>
      <stop offset="1" stop-color="#D1FAE5"/>
    </linearGradient>
    <linearGradient id="f3Hijab" x1="30" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop stop-color="#14B8A6"/>
      <stop offset="1" stop-color="#0F766E"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#f3Clip)">
    <rect width="128" height="128" fill="url(#f3Bg)"/>
    <!-- Cream Top -->
    <path d="M22 132 C22 98 40 88 64 88 C88 88 106 98 106 132 Z" fill="#F8FAFC"/>
    <!-- Teal Hijab Wrap -->
    <path d="M30 92 C30 84 48 80 64 80 C80 80 98 84 98 92 C98 118 78 128 64 128 C50 128 30 118 30 92 Z" fill="url(#f3Hijab)"/>
    <ellipse cx="64" cy="54" rx="33" ry="34" fill="url(#f3Hijab)"/>
    <!-- Face -->
    <ellipse cx="64" cy="57" rx="20" ry="23" fill="#F6C89F"/>
    <!-- Under-cap fold -->
    <path d="M48 46 C54 41 74 41 80 46 C74 43 54 43 48 46 Z" fill="#115E59"/>
    <!-- Cheeks Blush -->
    <circle cx="52" cy="65" r="4.5" fill="#FB923C" opacity="0.45"/>
    <circle cx="76" cy="65" r="4.5" fill="#FB923C" opacity="0.45"/>
    <!-- Eyes -->
    <ellipse cx="54" cy="56" rx="3.2" ry="3.5" fill="#042F2E"/>
    <ellipse cx="74" cy="56" rx="3.2" ry="3.5" fill="#042F2E"/>
    <circle cx="55" cy="55" r="1.1" fill="#FFFFFF"/>
    <circle cx="75" cy="55" r="1.1" fill="#FFFFFF"/>
    <path d="M57 53 L60 51" stroke="#042F2E" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M71 53 L68 51" stroke="#042F2E" stroke-width="1.5" stroke-linecap="round"/>
    <!-- Eyebrows -->
    <path d="M48 49 C52 46 57 47 59 49" stroke="#042F2E" stroke-width="2" stroke-linecap="round"/>
    <path d="M69 49 C71 47 76 46 80 49" stroke="#042F2E" stroke-width="2" stroke-linecap="round"/>
    <!-- Smile -->
    <path d="M58 68 C61 72 67 72 70 68" stroke="#9A3412" stroke-width="2.2" stroke-linecap="round"/>
  </g>
</svg>`,
  },

  // --- FEMALE 4: Long wavy hair with gold headband (Sumaiya / Maliha) ---
  {
    id: "female-4",
    gender: "female",
    svg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="f4Clip"><rect width="128" height="128" rx="64" fill="#fff"/></clipPath>
    <linearGradient id="f4Bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#DDD6FE"/>
      <stop offset="1" stop-color="#EDE9FE"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#f4Clip)">
    <rect width="128" height="128" fill="url(#f4Bg)"/>
    <!-- Lilac Top -->
    <path d="M22 132 C22 96 40 84 64 84 C88 84 106 96 106 132 Z" fill="#8B5CF6"/>
    <!-- Long Wavy Hair Behind Shoulders -->
    <path d="M28 60 C28 90 36 120 40 132 L88 132 C92 120 100 90 100 60 C100 30 84 18 64 18 C44 18 28 30 28 60 Z" fill="#451A03"/>
    <!-- Neck -->
    <rect x="57" y="68" width="14" height="20" rx="4" fill="#F8D7B8"/>
    <!-- Head -->
    <ellipse cx="64" cy="56" rx="23" ry="26" fill="#FBD8B5"/>
    <!-- Gold/Amber Headband -->
    <path d="M38 46 C38 28 90 28 90 46" stroke="#F59E0B" stroke-width="5" stroke-linecap="round"/>
    <circle cx="44" cy="38" r="3" fill="#D97706"/>
    <!-- Front Hair strands -->
    <path d="M38 48 C42 66 42 80 44 94 C46 84 46 66 42 50 Z" fill="#3B1501"/>
    <path d="M90 48 C86 66 86 80 84 94 C82 84 82 66 86 50 Z" fill="#3B1501"/>
    <!-- Cheeks Blush -->
    <circle cx="49" cy="64" r="5" fill="#FDA4AF" opacity="0.5"/>
    <circle cx="79" cy="64" r="5" fill="#FDA4AF" opacity="0.5"/>
    <!-- Sparkling Eyes -->
    <ellipse cx="53" cy="55" rx="3.2" ry="3.5" fill="#18181B"/>
    <ellipse cx="75" cy="55" rx="3.2" ry="3.5" fill="#18181B"/>
    <circle cx="54" cy="54" r="1.1" fill="#FFFFFF"/>
    <circle cx="76" cy="54" r="1.1" fill="#FFFFFF"/>
    <path d="M56 52 L59 50" stroke="#18181B" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M72 52 L69 50" stroke="#18181B" stroke-width="1.5" stroke-linecap="round"/>
    <!-- Eyebrows -->
    <path d="M47 47 C51 44 56 45 58 47" stroke="#451A03" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M70 47 C72 45 77 44 81 47" stroke="#451A03" stroke-width="2.2" stroke-linecap="round"/>
    <!-- Cheerful Rosy Smile -->
    <path d="M57 67 C60 72 68 72 71 67" stroke="#E11D48" stroke-width="2.2" stroke-linecap="round"/>
  </g>
</svg>`,
  },

  // --- FEMALE 5: Graceful Sky-Blue Hijabi (Jannat / Sabrina) ---
  {
    id: "female-5",
    gender: "female",
    svg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="f5Clip"><rect width="128" height="128" rx="64" fill="#fff"/></clipPath>
    <linearGradient id="f5Bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#BAE6FD"/>
      <stop offset="1" stop-color="#E0F2FE"/>
    </linearGradient>
    <linearGradient id="f5Hijab" x1="30" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop stop-color="#38BDF8"/>
      <stop offset="1" stop-color="#0284C7"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#f5Clip)">
    <rect width="128" height="128" fill="url(#f5Bg)"/>
    <!-- Navy Cardigan -->
    <path d="M22 132 C22 98 40 88 64 88 C88 88 106 98 106 132 Z" fill="#1E3A8A"/>
    <!-- Sky Blue Hijab -->
    <path d="M30 92 C30 84 48 80 64 80 C80 80 98 84 98 92 C98 118 78 128 64 128 C50 128 30 118 30 92 Z" fill="url(#f5Hijab)"/>
    <ellipse cx="64" cy="54" rx="33" ry="34" fill="url(#f5Hijab)"/>
    <!-- Face -->
    <ellipse cx="64" cy="57" rx="20" ry="23" fill="#FBD8B5"/>
    <path d="M48 46 C54 41 74 41 80 46 C74 43 54 43 48 46 Z" fill="#0369A1"/>
    <!-- Cheeks Blush -->
    <circle cx="52" cy="65" r="4.5" fill="#FB7185" opacity="0.4"/>
    <circle cx="76" cy="65" r="4.5" fill="#FB7185" opacity="0.4"/>
    <!-- Eyes -->
    <ellipse cx="54" cy="56" rx="3.2" ry="3.5" fill="#0C4A6E"/>
    <ellipse cx="74" cy="56" rx="3.2" ry="3.5" fill="#0C4A6E"/>
    <circle cx="55" cy="55" r="1.1" fill="#FFFFFF"/>
    <circle cx="75" cy="55" r="1.1" fill="#FFFFFF"/>
    <path d="M57 53 L60 51" stroke="#0C4A6E" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M71 53 L68 51" stroke="#0C4A6E" stroke-width="1.5" stroke-linecap="round"/>
    <!-- Eyebrows -->
    <path d="M48 49 C52 46 57 47 59 49" stroke="#0C4A6E" stroke-width="2" stroke-linecap="round"/>
    <path d="M69 49 C71 47 76 46 80 49" stroke="#0C4A6E" stroke-width="2" stroke-linecap="round"/>
    <!-- Gentle Smile -->
    <path d="M58 68 C61 72 67 72 70 68" stroke="#C2410C" stroke-width="2.2" stroke-linecap="round"/>
  </g>
</svg>`,
  },

  // --- FEMALE 6: High Ponytail / Sporty Chic (Ayesha / Riya) ---
  {
    id: "female-6",
    gender: "female",
    svg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="f6Clip"><rect width="128" height="128" rx="64" fill="#fff"/></clipPath>
    <linearGradient id="f6Bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FDE68A"/>
      <stop offset="1" stop-color="#FEF3C7"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#f6Clip)">
    <rect width="128" height="128" fill="url(#f6Bg)"/>
    <!-- Teal Sports Tee -->
    <path d="M22 132 C22 96 40 84 64 84 C88 84 106 96 106 132 Z" fill="#0F766E"/>
    <!-- High Ponytail Hair Flowing to Side -->
    <path d="M84 32 C96 32 108 44 106 68 C104 62 96 52 86 46 Z" fill="#1E1B4B"/>
    <circle cx="84" cy="34" r="5" fill="#EF4444"/>
    <!-- Neck -->
    <rect x="57" y="68" width="14" height="20" rx="4" fill="#FBD8B5"/>
    <!-- Head -->
    <ellipse cx="64" cy="56" rx="23" ry="26" fill="#FCE0CA"/>
    <!-- Sleek Pulled-Back Hair with Cute Side Bangs -->
    <path d="M38 48 C38 28 50 20 66 20 C82 20 90 28 90 48 C84 40 76 34 64 34 C50 34 42 40 38 48 Z" fill="#1E1B4B"/>
    <path d="M40 46 C44 58 46 64 48 70" stroke="#1E1B4B" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Cheeks Blush -->
    <circle cx="49" cy="64" r="5" fill="#FB7185" opacity="0.45"/>
    <circle cx="79" cy="64" r="5" fill="#FB7185" opacity="0.45"/>
    <!-- Eyes: Energetic Smile & Wink -->
    <ellipse cx="53" cy="55" rx="3.2" ry="3.5" fill="#1E1B4B"/>
    <circle cx="54" cy="54" r="1.1" fill="#FFFFFF"/>
    <path d="M72 56 C74 53 78 53 80 56" stroke="#1E1B4B" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Eyebrows -->
    <path d="M47 47 C51 44 56 45 58 47" stroke="#1E1B4B" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M70 47 C72 45 77 44 81 47" stroke="#1E1B4B" stroke-width="2.2" stroke-linecap="round"/>
    <!-- Radiant Open Smile -->
    <path d="M56 66 C56 74 72 74 72 66 Z" fill="#BE123C"/>
    <path d="M58 66 C60 68 68 68 70 66" stroke="#FFFFFF" stroke-width="2"/>
  </g>
</svg>`,
  },

  // --- FEMALE 7: Terracotta Hijabi with cute round spectacles (Fatima / Samia) ---
  {
    id: "female-7",
    gender: "female",
    svg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="f7Clip"><rect width="128" height="128" rx="64" fill="#fff"/></clipPath>
    <linearGradient id="f7Bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFEDD5"/>
      <stop offset="1" stop-color="#FFF7ED"/>
    </linearGradient>
    <linearGradient id="f7Hijab" x1="30" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EA580C"/>
      <stop offset="1" stop-color="#C2410C"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#f7Clip)">
    <rect width="128" height="128" fill="url(#f7Bg)"/>
    <!-- Sage Green Tunic -->
    <path d="M22 132 C22 98 40 88 64 88 C88 88 106 98 106 132 Z" fill="#4D7C0F"/>
    <!-- Terracotta Hijab -->
    <path d="M30 92 C30 84 48 80 64 80 C80 80 98 84 98 92 C98 118 78 128 64 128 C50 128 30 118 30 92 Z" fill="url(#f7Hijab)"/>
    <ellipse cx="64" cy="54" rx="33" ry="34" fill="url(#f7Hijab)"/>
    <!-- Face -->
    <ellipse cx="64" cy="57" rx="20" ry="23" fill="#FBD8B5"/>
    <path d="M48 46 C54 41 74 41 80 46 C74 43 54 43 48 46 Z" fill="#9A3412"/>
    <!-- Cheeks Blush -->
    <circle cx="52" cy="65" r="4.5" fill="#FB7185" opacity="0.4"/>
    <circle cx="76" cy="65" r="4.5" fill="#FB7185" opacity="0.4"/>
    <!-- Cute Round Glasses -->
    <circle cx="52" cy="55" r="8.5" fill="#FFFFFF" fill-opacity="0.3" stroke="#7C2D12" stroke-width="2"/>
    <circle cx="76" cy="55" r="8.5" fill="#FFFFFF" fill-opacity="0.3" stroke="#7C2D12" stroke-width="2"/>
    <path d="M60.5 55 L67.5 55" stroke="#7C2D12" stroke-width="2"/>
    <!-- Eyes -->
    <circle cx="52" cy="55" r="2.6" fill="#1C1917"/>
    <circle cx="76" cy="55" r="2.6" fill="#1C1917"/>
    <circle cx="53" cy="54" r="1" fill="#FFFFFF"/>
    <circle cx="77" cy="54" r="1" fill="#FFFFFF"/>
    <!-- Eyebrows -->
    <path d="M46 45 C50 43 55 44 57 46" stroke="#7C2D12" stroke-width="2" stroke-linecap="round"/>
    <path d="M71 46 C73 44 78 43 82 45" stroke="#7C2D12" stroke-width="2" stroke-linecap="round"/>
    <!-- Warm Intelligent Smile -->
    <path d="M58 68 C61 72 67 72 70 68" stroke="#9A3412" stroke-width="2.2" stroke-linecap="round"/>
  </g>
</svg>`,
  },

  // --- FEMALE 8: Artist Top Bun with curly wisps & yellow sweater (Lamia / Mou) ---
  {
    id: "female-8",
    gender: "female",
    svg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="f8Clip"><rect width="128" height="128" rx="64" fill="#fff"/></clipPath>
    <linearGradient id="f8Bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FCE7F3"/>
      <stop offset="1" stop-color="#FDF2F8"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#f8Clip)">
    <rect width="128" height="128" fill="url(#f8Bg)"/>
    <!-- Yellow Cozy Sweater -->
    <path d="M22 132 C22 96 40 84 64 84 C88 84 106 96 106 132 Z" fill="#EAB308"/>
    <path d="M50 84 C50 94 64 100 64 100 C64 100 78 94 78 84 Z" fill="#CA8A04"/>
    <!-- Top Bun Hairpiece -->
    <circle cx="64" cy="22" r="14" fill="#3E2723"/>
    <circle cx="64" cy="22" r="11" fill="#4E342E"/>
    <!-- Neck -->
    <rect x="57" y="68" width="14" height="20" rx="4" fill="#FBD8B5"/>
    <!-- Head -->
    <ellipse cx="64" cy="56" rx="23" ry="26" fill="#FCE0CA"/>
    <!-- Hair Base Around Face -->
    <path d="M38 48 C38 28 50 24 64 24 C78 24 90 28 90 48 C84 40 76 36 64 36 C52 36 44 40 38 48 Z" fill="#3E2723"/>
    <!-- Cute Curly Wisps on sides -->
    <path d="M39 52 C37 62 41 68 39 74" stroke="#3E2723" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M89 52 C91 62 87 68 89 74" stroke="#3E2723" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Cheeks Blush -->
    <circle cx="49" cy="64" r="5" fill="#FB7185" opacity="0.45"/>
    <circle cx="79" cy="64" r="5" fill="#FB7185" opacity="0.45"/>
    <!-- Sparkling Eyes -->
    <ellipse cx="53" cy="55" rx="3.2" ry="3.5" fill="#1C1917"/>
    <ellipse cx="75" cy="55" rx="3.2" ry="3.5" fill="#1C1917"/>
    <circle cx="54" cy="54" r="1.1" fill="#FFFFFF"/>
    <circle cx="76" cy="54" r="1.1" fill="#FFFFFF"/>
    <path d="M56 52 L59 50" stroke="#1C1917" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M72 52 L69 50" stroke="#18181B" stroke-width="1.5" stroke-linecap="round"/>
    <!-- Eyebrows -->
    <path d="M47 46 C51 43 56 44 58 46" stroke="#3E2723" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M70 46 C72 44 77 43 81 46" stroke="#3E2723" stroke-width="2.2" stroke-linecap="round"/>
    <!-- Sweet Smile -->
    <path d="M57 67 C60 72 68 72 71 67" stroke="#BE123C" stroke-width="2.2" stroke-linecap="round"/>
  </g>
</svg>`,
  },
];

const targetDir = path.join(process.cwd(), "public", "images", "avatars");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

for (const a of avatars) {
  const filePath = path.join(targetDir, `${a.id}.svg`);
  fs.writeFileSync(filePath, a.svg.trim(), "utf-8");
  console.log(`Saved avatar: ${filePath}`);
}

console.log(`Successfully generated ${avatars.length} gender-matched cartoon avatars!`);
