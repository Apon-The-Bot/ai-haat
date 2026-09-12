/**
 * Environment Variable Validation — AI Haat
 *
 * Import this module early (e.g., in layout.tsx or middleware) to ensure
 * all required environment variables are present before the application
 * accepts traffic. Fails fast with a clear, actionable error message.
 */

interface EnvRule {
  key: string;
  required: boolean;
  /** Only required in production */
  productionOnly?: boolean;
  hint?: string;
}

const REQUIRED_VARS: EnvRule[] = [
  // Core Database
  { key: "DATABASE_URL", required: true, hint: "MySQL connection string. See .env.example" },

  // NextAuth
  { key: "NEXTAUTH_SECRET", required: true, hint: "Generate with: openssl rand -base64 32" },
  { key: "NEXTAUTH_URL", required: true, hint: "e.g., http://localhost:3000 or https://aihaat.shop" },

  // Google OAuth
  { key: "GOOGLE_CLIENT_ID", required: true, hint: "From Google Cloud Console OAuth 2.0 credentials" },
  { key: "GOOGLE_CLIENT_SECRET", required: true, hint: "From Google Cloud Console OAuth 2.0 credentials" },

  // MFA & Cryptographic Secrets (production only)
  { key: "MFA_ENCRYPTION_KEY", required: true, productionOnly: true, hint: "64-char hex string. Generate with: openssl rand -hex 32" },
  { key: "EMAIL_OTP_PEPPER", required: true, productionOnly: true, hint: "64-char hex string. Generate with: openssl rand -hex 32" },
  { key: "MFA_RECOVERY_CODE_PEPPER", required: true, productionOnly: true, hint: "64-char hex string. Generate with: openssl rand -hex 32" },
  { key: "CRON_SECRET", required: true, productionOnly: true, hint: "64-char hex string. Generate with: openssl rand -hex 32" },
  { key: "BACKUP_ENCRYPTION_KEY", required: true, productionOnly: true, hint: "64-char hex string. Generate with: openssl rand -hex 32" },

  // SMTP (production only)
  { key: "SMTP_HOST", required: true, productionOnly: true, hint: "e.g., smtp.hostinger.com" },
  { key: "SMTP_USER", required: true, productionOnly: true, hint: "SMTP username / email address" },
  { key: "SMTP_PASS", required: true, productionOnly: true, hint: "SMTP password" },
];

let validated = false;

/**
 * Validates that all required environment variables are set.
 * Throws an Error listing all missing variables if any are absent.
 *
 * Call once at application startup. Subsequent calls are no-ops.
 */
export function validateEnv(): void {
  if (validated) return;

  // Skip validation during Next.js build phase (SSG/SSR page generation).
  // Env vars may not be available during `next build` on CI/local machines.
  // Validation will run at actual server startup time instead.
  const nextPhase = process.env.NEXT_PHASE;
  if (nextPhase === "phase-production-build") {
    validated = true;
    return;
  }

  const isProduction = process.env.NODE_ENV === "production";
  const missing: string[] = [];

  for (const rule of REQUIRED_VARS) {
    if (!rule.required) continue;
    if (rule.productionOnly && !isProduction) continue;

    const value = process.env[rule.key];
    if (!value || value.trim() === "") {
      const suffix = rule.hint ? ` (${rule.hint})` : "";
      missing.push(`  • ${rule.key}${suffix}`);
    }
  }

  if (missing.length > 0) {
    const header = `[ENV VALIDATION] ${missing.length} required environment variable(s) missing:`;
    const body = missing.join("\n");
    const footer = "See .env.example for the full list of required variables.";

    // In production, crash immediately — never run with missing secrets
    if (isProduction) {
      throw new Error(`${header}\n${body}\n${footer}`);
    }

    // In development, log a prominent warning but allow partial startup
    console.warn(`\n⚠️  ${header}\n${body}\n${footer}\n`);
  }

  validated = true;
}
