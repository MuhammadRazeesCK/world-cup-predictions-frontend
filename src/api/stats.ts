import apiClient from './client';

export interface PlayerLeader {
    rank: number;
    value: number;
    displayValue: string;
    name: string;
    shortName: string;
    country: string;
    flagUrl: string | null;
    headshotUrl: string | null;
    cropY: number;
}

export interface StatCategory {
    name: string;
    displayName: string;
    leaders: PlayerLeader[];
}

export interface GroupEntry {
    rank: number;
    team: string;
    flagUrl: string | null;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    gf: number;
    ga: number;
    gd: string;
    points: number;
    advanced: boolean;
}

export interface Group {
    name: string;
    entries: GroupEntry[];
}

export interface TournamentStats {
    categories: StatCategory[];
    groups: Group[];
    fetchedAt: string;
}

export interface BracketFixture {
    id: string;
    match_number: number;
    home_team: string;
    away_team: string;
    home_score: number | null;
    away_score: number | null;
    penalty_home_score: number | null;
    penalty_away_score: number | null;
    penalty_enabled: boolean;
    stage: string;
    status: string;
    kickoff_time: string;
}

export type BracketData = Record<string, BracketFixture[]>;

export const statsApi = {
    getTournament: async (): Promise<TournamentStats> => {
        const { data } = await apiClient.get('/stats/tournament');
        return data.data;
    },
    getBracket: async (): Promise<BracketData> => {
        const { data } = await apiClient.get('/stats/bracket');
        return data.data;
    },
};
