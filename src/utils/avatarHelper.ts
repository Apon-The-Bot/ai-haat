/**
 * Helper to determine gender and assign consistent, friendly cartoon avatars
 * for customers across social proof notifications, reviews, and testimonials.
 */

const FEMALE_NAMES = new Set([
  "nusrat",
  "nafisa",
  "tasnim",
  "sadia",
  "anika",
  "sumaiya",
  "farzana",
  "jannat",
  "sabrina",
  "maliha",
  "ayesha",
  "fatima",
  "samia",
  "nabila",
  "shaila",
  "riya",
  "mim",
  "mou",
  "pooja",
  "tisha",
  "sarah",
  "lamia",
  "nila",
  "tania",
  "suraiya",
  "shirin",
  "maria",
  "marufa",
  "mousumi",
  "rubina",
  "farhana",
  "mehnaz",
  "tasmia",
  "bushra",
  "munira",
  "zarin",
  "fariha",
  "afroza",
  "humaira",
  "adiba",
  "laboni",
  "urmi",
  "shampa",
  "rumana",
  "sharmin",
  "roksana",
  "farzana",
  "tamanna",
  "fahima",
]);

/**
 * Intelligent gender detector based on common Bangladeshi / South Asian first names
 */
export function detectGender(name: string): "male" | "female" {
  if (!name) return "male";
  
  // Clean first word
  const firstWord = name.trim().split(/[\s.]+/)[0].toLowerCase();
  
  if (FEMALE_NAMES.has(firstWord)) {
    return "female";
  }

  // Check if any part matches female dictionary
  const parts = name.toLowerCase().split(/[\s.]+/);
  for (const part of parts) {
    if (FEMALE_NAMES.has(part)) {
      return "female";
    }
  }

  return "male";
}

/**
 * Deterministic hash from string to integer index
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const TOTAL_MALE_AVATARS = 8;
const TOTAL_FEMALE_AVATARS = 8;

/**
 * Get gender-matched cartoon avatar path
 */
export function getGenderAvatar(
  name: string,
  explicitGender?: "male" | "female",
  seed?: string | number
): {
  gender: "male" | "female";
  avatarPath: string;
  avatarId: string;
} {
  const gender = explicitGender || detectGender(name);
  const identifier = seed !== undefined ? `${name}_${seed}` : name;
  const hash = hashString(identifier);

  const total = gender === "female" ? TOTAL_FEMALE_AVATARS : TOTAL_MALE_AVATARS;
  const index = (hash % total) + 1; // 1 to 8

  const avatarId = `${gender}-${index}`;
  const avatarPath = `/images/avatars/${avatarId}.svg`;

  return {
    gender,
    avatarPath,
    avatarId,
  };
}
