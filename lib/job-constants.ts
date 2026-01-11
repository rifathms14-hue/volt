/**
 * Job Platform/Source Options
 * Platforms where jobs can be applied through
 */
export const JOB_PLATFORMS = [
  "LinkedIn",
  "Indeed",
  "Naukri",
  "Naukri Gulf",
  "Bayt",
  "FoundIt (Monster)",
  "Glassdoor",
  "Wellfound",
  "Instahyre",
  "Hirist",
  "Google Jobs",
  "Company Website",
  "Referral",
  "Agency",
  "Other",
] as const;

export type JobPlatform = (typeof JOB_PLATFORMS)[number];

/**
 * Job Location/City Options
 * Grouped by country/region for better organization
 */
export interface CityGroup {
  label: string;
  cities: readonly string[];
}

export const CITY_GROUPS: readonly CityGroup[] = [
  {
    label: "India",
    cities: [
      "Bengaluru",
      "Mumbai",
      "Delhi NCR",
      "Hyderabad",
      "Pune",
      "Chennai",
      "Kochi",
    ] as const,
  },
  {
    label: "UAE",
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Remote (UAE)"] as const,
  },
  {
    label: "KSA",
    cities: ["Riyadh", "Jeddah", "Dammam", "Neom", "Remote (KSA)"] as const,
  },
  {
    label: "Global",
    cities: ["Remote (Global)"] as const,
  },
] as const;

/**
 * Flattened list of all cities for easier searching
 */
export const ALL_CITIES = CITY_GROUPS.flatMap((group) => group.cities);
