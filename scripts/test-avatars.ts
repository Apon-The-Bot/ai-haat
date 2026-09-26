import fs from "fs";
import path from "path";
import { detectGender, getGenderAvatar } from "../src/utils/avatarHelper";

console.log("=== Testing Avatar System & Gender Matching ===");

const testCases: { name: string; expectedGender: "male" | "female" }[] = [
  { name: "Rafiul I.", expectedGender: "male" },
  { name: "Tanvir H.", expectedGender: "male" },
  { name: "Sakib A.", expectedGender: "male" },
  { name: "Farhan M.", expectedGender: "male" },
  { name: "Mahmud R.", expectedGender: "male" },
  { name: "Ahsan K.", expectedGender: "male" },
  { name: "Arif H.", expectedGender: "male" },
  { name: "Sabbir N.", expectedGender: "male" },
  { name: "Zubair E.", expectedGender: "male" },
  { name: "Mehedi H.", expectedGender: "male" },
  { name: "Nusrat J.", expectedGender: "female" },
  { name: "Nafisa T.", expectedGender: "female" },
  { name: "Tasnim R.", expectedGender: "female" },
  { name: "Sadia A.", expectedGender: "female" },
  { name: "Anika B.", expectedGender: "female" },
  { name: "Sumaiya K.", expectedGender: "female" },
  { name: "Farzana P.", expectedGender: "female" },
  { name: "Jannat M.", expectedGender: "female" },
];

let failed = 0;

for (const tc of testCases) {
  const detected = detectGender(tc.name);
  if (detected !== tc.expectedGender) {
    console.error(`FAIL: ${tc.name} -> detected ${detected}, expected ${tc.expectedGender}`);
    failed++;
  } else {
    const avatar = getGenderAvatar(tc.name);
    const fullPath = path.join(process.cwd(), "public", avatar.avatarPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`FAIL: File does not exist: ${fullPath}`);
      failed++;
    } else {
      const content = fs.readFileSync(fullPath, "utf-8");
      if (!content.startsWith("<svg") || !content.endsWith("</svg>")) {
        console.error(`FAIL: Malformed SVG at ${fullPath}`);
        failed++;
      } else {
        console.log(`PASS: ${tc.name.padEnd(12)} -> [${detected.toUpperCase()}] -> ${avatar.avatarPath} (${content.length} bytes)`);
      }
    }
  }
}

// Test all 16 files directly
for (let i = 1; i <= 8; i++) {
  const mPath = path.join(process.cwd(), "public", "images", "avatars", `male-${i}.svg`);
  const fPath = path.join(process.cwd(), "public", "images", "avatars", `female-${i}.svg`);
  if (!fs.existsSync(mPath) || !fs.existsSync(fPath)) {
    console.error(`FAIL: Missing avatar file male-${i} or female-${i}`);
    failed++;
  }
}

if (failed === 0) {
  console.log("\nALL AVATAR TESTS PASSED! (18/18 test cases + 16/16 files verified)");
  process.exit(0);
} else {
  console.error(`\n${failed} TESTS FAILED`);
  process.exit(1);
}
