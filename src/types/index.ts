// TypeScript interfaces for the frontend

export type FixtureStage = 'group' | 'round32' | 'round16' | 'qf' | 'sf' | 'third_place' | 'final';
export type FixtureStatus = 'scheduled' | 'live' | 'completed';
export type PredictionResult = 'exact' | 'winner' | 'wrong' | 'draw_correct' | 'pending';

export interface User {
    id: string;
    email: string;
    username: string;
    role: 'user' | 'admin';
    avatar_url?: string | null;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
}

export interface Fixture {
    id: string;
    match_number: number;
    home_team: string;
    away_team: string;
    kickoff_time: string;
    stage: FixtureStage;
    status: FixtureStatus;
    home_score: number | null;
    away_score: number | null;
    prediction_closes_at: string;
    api_fixture_id: number | null;
    penalty_enabled: boolean;
    penalty_home_score: number | null;
    penalty_away_score: number | null;
    poster_url: string | null;
}

export interface PredictionWindow {
    is_open: boolean;
    closes_at: string;
    minutes_remaining: number;
}

export interface UserPrediction {
    id: string;
    predicted_home_goals: number;
    predicted_away_goals: number;
    penalty_home_goals: number | null;
    penalty_away_goals: number | null;
    predicted_at: string;
}

export interface AvailableFixture extends Fixture {
    prediction_window: PredictionWindow;
    user_prediction: UserPrediction | null;
}

export interface Prediction {
    id: string;
    fixture_id: string;
    user_id: string;
    predicted_home_goals: number;
    predicted_away_goals: number;
    points: number | null;
    result: PredictionResult | null;
    predicted_at: string;
}

export interface PredictionHistoryItem {
    id: string;
    fixture: {
        id: string;
        match_number: number;
        home_team: string;
        away_team: string;
        kickoff_time: string;
        stage: FixtureStage;
        status: FixtureStatus;
    };
    prediction: {
        predicted_home_goals: number;
        predicted_away_goals: number;
        penalty_home_goals: number | null;
        penalty_away_goals: number | null;
        predicted_at: string;
    };
    result: {
        home_goals?: number;
        away_goals?: number;
        penalty_home_score?: number | null;
        penalty_away_score?: number | null;
        points?: number;
        result_type: PredictionResult;
    };
}

export interface LeaderboardEntry {
    rank: number;
    user_id: string;
    username: string;
    avatar_url: string | null;
    total_points: number;
    total_predictions: number;
    completed_predictions: number;
    exact_predictions: number;
    winner_predictions: number;
    accuracy_percentage: number;
}

export interface LeaderboardData {
    total_users: number;
    leaderboard: LeaderboardEntry[];
}

export interface UserStats {
    rank: number | null;
    total_points: number;
    total_predictions: number;
    completed_predictions: number;
    accuracy_percentage: number;
    exact_predictions: number;
    winner_predictions: number;
    wrong_predictions: number;
    percentile: number;
    next_milestone: {
        points_needed: number;
        next_rank_position: number;
        next_rank_username: string;
    } | null;
}

export interface AdminLog {
    id: string;
    admin_id: string;
    admin_email: string;
    action: string;
    details: Record<string, unknown>;
    created_at: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ApiError {
    success: false;
    error: string;
    code: string;
}
