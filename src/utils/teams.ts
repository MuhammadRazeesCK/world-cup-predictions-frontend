// Official 2026 FIFA World Cup qualified teams (all 48)
// 9 AFC + 10 CAF + 6 CONCACAF + 6 CONMEBOL + 1 OFC + 16 UEFA = 48

export interface Team {
  name: string;
  flag: string;
  code: string;
}

export const WC2026_TEAMS: Team[] = [
  // AFC (9)
  { name: 'Australia', flag: '🇦🇺', code: 'AUS' },
  { name: 'Iran', flag: '🇮🇷', code: 'IRN' },
  { name: 'Iraq', flag: '🇮🇶', code: 'IRQ' },
  { name: 'Japan', flag: '🇯🇵', code: 'JPN' },
  { name: 'Jordan', flag: '🇯🇴', code: 'JOR' },
  { name: 'Qatar', flag: '🇶🇦', code: 'QAT' },
  { name: 'Saudi Arabia', flag: '🇸🇦', code: 'KSA' },
  { name: 'South Korea', flag: '🇰🇷', code: 'KOR' },
  { name: 'Uzbekistan', flag: '🇺🇿', code: 'UZB' },
  // CAF (10)
  { name: 'Algeria', flag: '🇩🇿', code: 'ALG' },
  { name: 'Cape Verde', flag: '🇨🇻', code: 'CPV' },
  { name: 'DR Congo', flag: '🇨🇩', code: 'COD' },
  { name: 'Egypt', flag: '🇪🇬', code: 'EGY' },
  { name: 'Ghana', flag: '🇬🇭', code: 'GHA' },
  { name: 'Ivory Coast', flag: '🇨🇮', code: 'CIV' },
  { name: 'Morocco', flag: '🇲🇦', code: 'MAR' },
  { name: 'Senegal', flag: '🇸🇳', code: 'SEN' },
  { name: 'South Africa', flag: '🇿🇦', code: 'RSA' },
  { name: 'Tunisia', flag: '🇹🇳', code: 'TUN' },
  // CONCACAF (6)
  { name: 'Canada', flag: '🇨🇦', code: 'CAN' },
  { name: 'Curacao', flag: '🇨🇼', code: 'CUW' },
  { name: 'Haiti', flag: '🇭🇹', code: 'HAI' },
  { name: 'Mexico', flag: '🇲🇽', code: 'MEX' },
  { name: 'Panama', flag: '🇵🇦', code: 'PAN' },
  { name: 'USA', flag: '🇺🇸', code: 'USA' },
  // CONMEBOL (6)
  { name: 'Argentina', flag: '🇦🇷', code: 'ARG' },
  { name: 'Brazil', flag: '🇧🇷', code: 'BRA' },
  { name: 'Colombia', flag: '🇨🇴', code: 'COL' },
  { name: 'Ecuador', flag: '🇪🇨', code: 'ECU' },
  { name: 'Paraguay', flag: '🇵🇾', code: 'PAR' },
  { name: 'Uruguay', flag: '🇺🇾', code: 'URU' },
  // OFC (1)
  { name: 'New Zealand', flag: '🇳🇿', code: 'NZL' },
  // UEFA (16)
  { name: 'Austria', flag: '🇦🇹', code: 'AUT' },
  { name: 'Belgium', flag: '🇧🇪', code: 'BEL' },
  { name: 'Bosnia and Herzegovina', flag: '🇧🇦', code: 'BIH' },
  { name: 'Croatia', flag: '🇭🇷', code: 'CRO' },
  { name: 'Czech Republic', flag: '🇨🇿', code: 'CZE' },
  { name: 'England', flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', code: 'ENG' },
  { name: 'France', flag: '🇫🇷', code: 'FRA' },
  { name: 'Germany', flag: '🇩🇪', code: 'GER' },
  { name: 'Netherlands', flag: '🇳🇱', code: 'NED' },
  { name: 'Norway', flag: '🇳🇴', code: 'NOR' },
  { name: 'Portugal', flag: '🇵🇹', code: 'POR' },
  { name: 'Scotland', flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}', code: 'SCO' },
  { name: 'Spain', flag: '🇪🇸', code: 'ESP' },
  { name: 'Sweden', flag: '🇸🇪', code: 'SWE' },
  { name: 'Switzerland', flag: '🇨🇭', code: 'SUI' },
  { name: 'Turkey', flag: '🇹🇷', code: 'TUR' },
];

export const SORTED_TEAMS = [...WC2026_TEAMS].sort((a, b) => a.name.localeCompare(b.name));

export function getTeamFlag(teamName: string): string {
  if (!teamName) return '';
  const normalized = teamName.trim().toLowerCase();
  const team = WC2026_TEAMS.find(
    (t) => t.name.toLowerCase() === normalized || t.code.toLowerCase() === normalized
  );
  return team?.flag ?? '';
}
