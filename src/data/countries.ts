import { Country } from '../types/game';

export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', aliases: ['USA', 'America', 'US'] },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', aliases: ['CA'] },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', aliases: ['MX'] },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', aliases: ['Brasil', 'BR'] },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', aliases: ['AR'] },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', aliases: ['CO'] },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', aliases: ['CL'] },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', aliases: ['PE'] },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', aliases: ['UY'] },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', aliases: ['PY'] },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', aliases: ['VE'] },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', aliases: ['EC'] },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', aliases: ['BO'] },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', aliases: ['CR'] },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', aliases: ['PA'] },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺', aliases: ['CU'] },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲', aliases: ['JM'] },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', aliases: ['Dominicana', 'DO'] },

  // Europe
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', aliases: ['UK', 'Britain', 'England', 'Great Britain'] },
  { code: 'FR', name: 'France', flag: '🇫🇷', aliases: ['FR'] },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', aliases: ['Deutschland', 'DE'] },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', aliases: ['Italia', 'IT'] },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', aliases: ['España', 'ES'] },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', aliases: ['PT'] },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', aliases: ['Holland', 'NL'] },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', aliases: ['BE'] },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', aliases: ['Swiss', 'CH'] },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', aliases: ['AT'] },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', aliases: ['SE'] },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', aliases: ['NO'] },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', aliases: ['DK'] },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', aliases: ['FI'] },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', aliases: ['Eire', 'IE'] },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', aliases: ['Polska', 'PL'] },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', aliases: ['UA'] },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', aliases: ['Hellas', 'GR'] },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', aliases: ['Turkiye', 'TR'] },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', aliases: ['Czechia', 'CZ'] },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', aliases: ['HU'] },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', aliases: ['RO'] },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', aliases: ['BG'] },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', aliases: ['Hrvatska', 'HR'] },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', aliases: ['RS'] },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', aliases: ['IS'] },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', aliases: ['SK'] },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', aliases: ['SI'] },
  { code: 'AL', name: 'Albania', flag: '🇦🇱', aliases: ['AL'] },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦', aliases: ['Bosnia', 'BA'] },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', aliases: ['CY'] },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', aliases: ['EE'] },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', aliases: ['LV'] },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', aliases: ['LT'] },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', aliases: ['LU'] },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', aliases: ['MT'] },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩', aliases: ['MD'] },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪', aliases: ['ME'] },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰', aliases: ['Macedonia', 'MK'] },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪', aliases: ['GE'] },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲', aliases: ['AM'] },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿', aliases: ['AZ'] },

  // Asia
  { code: 'JP', name: 'Japan', flag: '🇯🇵', aliases: ['Nippon', 'JP'] },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', aliases: ['Korea', 'ROK', 'KR'] },
  { code: 'CN', name: 'China', flag: '🇨🇳', aliases: ['PRC', 'CN'] },
  { code: 'IN', name: 'India', flag: '🇮🇳', aliases: ['Bharat', 'IN'] },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', aliases: ['PK'] },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', aliases: ['BD'] },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', aliases: ['ID'] },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', aliases: ['PH'] },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', aliases: ['VN'] },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', aliases: ['Siam', 'TH'] },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', aliases: ['MY'] },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', aliases: ['SG'] },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', aliases: ['KSA', 'SA'] },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', aliases: ['UAE', 'Emirates', 'Dubai'] },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', aliases: ['QA'] },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', aliases: ['KW'] },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', aliases: ['OM'] },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', aliases: ['BH'] },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', aliases: ['IL'] },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', aliases: ['JO'] },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', aliases: ['LB'] },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶', aliases: ['IQ'] },
  { code: 'IR', name: 'Iran', flag: '🇮🇷', aliases: ['IR'] },
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', aliases: ['AF'] },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', aliases: ['LK'] },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', aliases: ['NP'] },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲', aliases: ['Burma', 'MM'] },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', aliases: ['KH'] },
  { code: 'LA', name: 'Laos', flag: '🇱🇦', aliases: ['LA'] },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳', aliases: ['MN'] },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', aliases: ['KZ'] },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', aliases: ['UZ'] },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', aliases: ['TW'] },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', aliases: ['HK'] },

  // Africa
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', aliases: ['EG'] },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', aliases: ['NG'] },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', aliases: ['RSA', 'ZA'] },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', aliases: ['KE'] },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', aliases: ['ET'] },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', aliases: ['GH'] },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', aliases: ['MA'] },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', aliases: ['DZ'] },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', aliases: ['TN'] },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', aliases: ['SN'] },
  { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮', aliases: ["Cote d'Ivoire", 'CI'] },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲', aliases: ['CM'] },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', aliases: ['UG'] },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', aliases: ['TZ'] },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', aliases: ['ZW'] },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', aliases: ['AO'] },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', aliases: ['MZ'] },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬', aliases: ['MG'] },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩', aliases: ['SD'] },
  { code: 'LY', name: 'Libya', flag: '🇱🇾', aliases: ['LY'] },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', aliases: ['RW'] },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', aliases: ['ZM'] },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴', aliases: ['SO'] },
  { code: 'CD', name: 'DR Congo', flag: '🇨🇩', aliases: ['Congo', 'CD'] },

  // Oceania
  { code: 'AU', name: 'Australia', flag: '🇦🇺', aliases: ['Aussie', 'AU'] },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', aliases: ['NZ'] },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯', aliases: ['FJ'] },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬', aliases: ['PNG'] },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸', aliases: ['WS'] },
];

// Helper to look up country by query (exact code, name, or alias match)
export function findCountry(query: string): Country | undefined {
  const clean = query.trim().toLowerCase();
  if (!clean) return undefined;

  // Direct matches
  const match = COUNTRIES.find((c) => {
    if (c.code.toLowerCase() === clean) return true;
    if (c.name.toLowerCase() === clean) return true;
    if (c.aliases?.some((a) => a.toLowerCase() === clean)) return true;
    return false;
  });

  if (match) return match;

  // Starts with match
  return COUNTRIES.find((c) => {
    if (c.name.toLowerCase().startsWith(clean)) return true;
    if (c.aliases?.some((a) => a.toLowerCase().startsWith(clean))) return true;
    return false;
  });
}

// Helper to filter country suggestions
export function searchCountries(query: string, limit: number = 8): Country[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return COUNTRIES.slice(0, limit);

  return COUNTRIES.filter((c) => {
    if (c.name.toLowerCase().includes(clean)) return true;
    if (c.code.toLowerCase().includes(clean)) return true;
    if (c.aliases?.some((a) => a.toLowerCase().includes(clean))) return true;
    return false;
  }).slice(0, limit);
}
