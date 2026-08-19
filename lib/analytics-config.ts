const META_PIXEL_PATTERN = /^\d{5,32}$/;
const GA4_MEASUREMENT_PATTERN = /^G-[A-Z0-9]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_PRIVACY_CONTACT_EMAIL = "info@masalto.com.ar";

export type AnalyticsConfig = {
  enabled: boolean;
  metaPixelId: string | null;
  ga4MeasurementId: string | null;
  privacyContactEmail: string | null;
};

function validValue(value: string | undefined, pattern: RegExp) {
  const candidate = value?.trim();
  return candidate && pattern.test(candidate) ? candidate : null;
}

export function getAnalyticsConfig(): AnalyticsConfig {
  const metaPixelId = validValue(
    process.env.NEXT_PUBLIC_META_PIXEL_ID,
    META_PIXEL_PATTERN,
  );
  const ga4MeasurementId = validValue(
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
    GA4_MEASUREMENT_PATTERN,
  );
  const privacyContactEmail = validValue(
    process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL ?? DEFAULT_PRIVACY_CONTACT_EMAIL,
    EMAIL_PATTERN,
  );

  return {
    enabled:
      process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true" &&
      Boolean(privacyContactEmail) &&
      Boolean(metaPixelId || ga4MeasurementId),
    metaPixelId,
    ga4MeasurementId,
    privacyContactEmail,
  };
}
