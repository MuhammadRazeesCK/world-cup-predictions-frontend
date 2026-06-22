// Official 2026 FIFA World Cup qualified teams (all 48)
// 9 AFC + 10 CAF + 6 CONCACAF + 6 CONMEBOL + 1 OFC + 16 UEFA = 48

import React from 'react';
import * as Flags from 'country-flag-icons/react/3x2';

export interface Team {
  name: string;
  flag: string;   // emoji (kept for dropdowns/text)
  code: string;   // 3-letter football code
  iso2: string;   // ISO 3166-1 alpha-2 for SVG flag
}

export const WC2026_TEAMS: Team[] = [
  // AFC (9)
  { name: 'Australia',             flag: '🇦🇺', code: 'AUS', iso2: 'AU' },
  { name: 'Iran',                  flag: '🇮🇷', code: 'IRN', iso2: 'IR' },
  { name: 'Iraq',                  flag: '🇮🇶', code: 'IRQ', iso2: 'IQ' },
  { name: 'Japan',                 flag: '🇯🇵', code: 'JPN', iso2: 'JP' },
  { name: 'Jordan',                flag: '🇯🇴', code: 'JOR', iso2: 'JO' },
  { name: 'Qatar',                 flag: '🇶🇦', code: 'QAT', iso2: 'QA' },
  { name: 'Saudi Arabia',          flag: '🇸🇦', code: 'KSA', iso2: 'SA' },
  { name: 'South Korea',           flag: '🇰🇷', code: 'KOR', iso2: 'KR' },
  { name: 'Uzbekistan',            flag: '🇺🇿', code: 'UZB', iso2: 'UZ' },
  // CAF (10)
  { name: 'Algeria',               flag: '🇩🇿', code: 'ALG', iso2: 'DZ' },
  { name: 'Cape Verde',            flag: '🇨🇻', code: 'CPV', iso2: 'CV' },
  { name: 'DR Congo',              flag: '🇨🇩', code: 'COD', iso2: 'CD' },
  { name: 'Egypt',                 flag: '🇪🇬', code: 'EGY', iso2: 'EG' },
  { name: 'Ghana',                 flag: '🇬🇭', code: 'GHA', iso2: 'GH' },
  { name: 'Ivory Coast',           flag: '🇨🇮', code: 'CIV', iso2: 'CI' },
  { name: 'Morocco',               flag: '🇲🇦', code: 'MAR', iso2: 'MA' },
  { name: 'Senegal',               flag: '🇸🇳', code: 'SEN', iso2: 'SN' },
  { name: 'South Africa',          flag: '🇿🇦', code: 'RSA', iso2: 'ZA' },
  { name: 'Tunisia',               flag: '🇹🇳', code: 'TUN', iso2: 'TN' },
  // CONCACAF (6)
  { name: 'Canada',                flag: '🇨🇦', code: 'CAN', iso2: 'CA' },
  { name: 'Curacao',               flag: '🇨🇼', code: 'CUW', iso2: 'CW' },
  { name: 'Haiti',                 flag: '🇭🇹', code: 'HAI', iso2: 'HT' },
  { name: 'Mexico',                flag: '🇲🇽', code: 'MEX', iso2: 'MX' },
  { name: 'Panama',                flag: '🇵🇦', code: 'PAN', iso2: 'PA' },
  { name: 'USA',                   flag: '🇺🇸', code: 'USA', iso2: 'US' },
  // CONMEBOL (6)
  { name: 'Argentina',             flag: '🇦🇷', code: 'ARG', iso2: 'AR' },
  { name: 'Brazil',                flag: '🇧🇷', code: 'BRA', iso2: 'BR' },
  { name: 'Colombia',              flag: '🇨🇴', code: 'COL', iso2: 'CO' },
  { name: 'Ecuador',               flag: '🇪🇨', code: 'ECU', iso2: 'EC' },
  { name: 'Paraguay',              flag: '🇵🇾', code: 'PAR', iso2: 'PY' },
  { name: 'Uruguay',               flag: '🇺🇾', code: 'URU', iso2: 'UY' },
  // OFC (1)
  { name: 'New Zealand',           flag: '🇳🇿', code: 'NZL', iso2: 'NZ' },
  // UEFA (16)
  { name: 'Austria',               flag: '🇦🇹', code: 'AUT', iso2: 'AT' },
  { name: 'Belgium',               flag: '🇧🇪', code: 'BEL', iso2: 'BE' },
  { name: 'Bosnia and Herzegovina',flag: '🇧🇦', code: 'BIH', iso2: 'BA' },
  { name: 'Croatia',               flag: '🇭🇷', code: 'CRO', iso2: 'HR' },
  { name: 'Czech Republic',        flag: '🇨🇿', code: 'CZE', iso2: 'CZ' },
  { name: 'England',               flag: '🏴', code: 'ENG', iso2: 'GB' },
  { name: 'France',                flag: '🇫🇷', code: 'FRA', iso2: 'FR' },
  { name: 'Germany',               flag: '🇩🇪', code: 'GER', iso2: 'DE' },
  { name: 'Netherlands',           flag: '🇳🇱', code: 'NED', iso2: 'NL' },
  { name: 'Norway',                flag: '🇳🇴', code: 'NOR', iso2: 'NO' },
  { name: 'Portugal',              flag: '🇵🇹', code: 'POR', iso2: 'PT' },
  { name: 'Scotland',              flag: '🏴', code: 'SCO', iso2: 'GB' },
  { name: 'Spain',                 flag: '🇪🇸', code: 'ESP', iso2: 'ES' },
  { name: 'Sweden',                flag: '🇸🇪', code: 'SWE', iso2: 'SE' },
  { name: 'Switzerland',           flag: '🇨🇭', code: 'SUI', iso2: 'CH' },
  { name: 'Turkey',                flag: '🇹🇷', code: 'TUR', iso2: 'TR' },
];

export const SORTED_TEAMS = [...WC2026_TEAMS].sort((a, b) => a.name.localeCompare(b.name));

export function getTeamByName(teamName: string): Team | undefined {
  if (!teamName) return undefined;
  const n = teamName.trim().toLowerCase();
  return WC2026_TEAMS.find((t) => t.name.toLowerCase() === n || t.code.toLowerCase() === n);
}

export function getTeamFlag(teamName: string): string {
  return getTeamByName(teamName)?.flag ?? '';
}

/** Renders a crisp SVG flag for a team name. Falls back to emoji if unknown. */
export function TeamFlag({ name, className = 'w-6 h-4 inline-block rounded-sm shadow-sm' }: { name: string; className?: string }) {
  const team = getTeamByName(name);
  if (!team) return React.createElement(React.Fragment, null, getTeamFlag(name));
  const FlagComponent = (Flags as Record<string, React.ComponentType<{ className?: string }>>)[team.iso2];
  if (!FlagComponent) return React.createElement(React.Fragment, null, team.flag);
  return React.createElement(FlagComponent, { className });
}
