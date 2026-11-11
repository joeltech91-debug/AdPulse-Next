import { isIP } from "node:net";

export type ClickGeo = {
  countryCode: string | null;
  countryName: string | null;
  continentCode: string | null;
};

const displayNames = new Intl.DisplayNames(["fr"], { type: "region" });

function validPublicIp(value: string): boolean {
  const ip = value.trim();
  const version = isIP(ip);
  if (!version) return false;
  if (version === 4) {
    const [a,b] = ip.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0 || a >= 224) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    return true;
  }
  const normalized = ip.toLowerCase();
  return normalized !== "::1" && !normalized.startsWith("fc") && !normalized.startsWith("fd") && !normalized.startsWith("fe80:");
}

export async function locateClick(request: Request, ip: string): Promise<ClickGeo> {
  const edgeCountry = (request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country") || "").trim().toUpperCase();
  if (edgeCountry === "XX" || edgeCountry === "T1") return { countryCode: null, countryName: null, continentCode: null };

  if (validPublicIp(ip)) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 700);
    try {
      const response = await fetch("https://ipwho.is/" + encodeURIComponent(ip), {
        signal: controller.signal, cache: "no-store", headers: { Accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json() as { success?: boolean; country_code?: string; country?: string; continent_code?: string };
        if (data.success && /^[A-Z]{2}$/.test(data.country_code || "")) {
          return {
            countryCode: data.country_code!,
            countryName: data.country || displayNames.of(data.country_code!) || data.country_code!,
            continentCode: /^[A-Z]{2}$/.test(data.continent_code || "") ? data.continent_code! : null,
          };
        }
      }
    } catch {
      // Geolocation is best-effort and must never prevent click tracking.
    } finally {
      clearTimeout(timeout);
    }
  }

  if (/^[A-Z]{2}$/.test(edgeCountry)) {
    return { countryCode: edgeCountry, countryName: displayNames.of(edgeCountry) || edgeCountry, continentCode: null };
  }
  return { countryCode: null, countryName: null, continentCode: null };
}
