import { DateTime } from 'luxon';

const IST = 'Asia/Kolkata';

export function formatKickoffIST(isoString: string): string {
    const match = DateTime.fromISO(isoString).setZone(IST);
    const today = DateTime.now().setZone(IST).startOf('day');
    const matchDay = match.startOf('day');
    const diffDays = matchDay.diff(today, 'days').days;

    let dayLabel: string;
    if (diffDays === 0) {
        dayLabel = 'Today';
    } else if (diffDays === 1) {
        dayLabel = 'Tomorrow';
    } else {
        dayLabel = match.toFormat('dd MMM');
    }

    return `${dayLabel}, ${match.toFormat("h:mm a 'IST'")}`;
}

export function formatDateIST(isoString: string): string {
    return DateTime.fromISO(isoString).setZone(IST).toFormat('dd MMM yyyy');
}

export function formatTimeIST(isoString: string): string {
    return DateTime.fromISO(isoString).setZone(IST).toFormat("h:mm a 'IST'");
}

export function formatRelative(isoString: string): string {
    return DateTime.fromISO(isoString).setZone(IST).toRelative() || '';
}

export function getCountdownParts(isoString: string): { hours: number; minutes: number; seconds: number; expired: boolean } {
    const now = DateTime.now().setZone(IST);
    const target = DateTime.fromISO(isoString).setZone(IST);
    const diff = target.diff(now, ['hours', 'minutes', 'seconds']);

    if (diff.as('seconds') <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
        hours: Math.floor(diff.hours),
        minutes: Math.floor(diff.minutes),
        seconds: Math.floor(diff.seconds),
        expired: false,
    };
}

export function isWindowOpen(closesAt: string): boolean {
    return DateTime.fromISO(closesAt).setZone(IST) > DateTime.now().setZone(IST);
}

export function formatStageName(stage: string): string {
    const map: Record<string, string> = {
        group: 'Group',
        round32: 'Round of 32',
        round16: 'Round of 16',
        qf: 'Quarter-Final',
        sf: 'Semi-Final',
        third_place: 'Third Place',
        final: 'Final',
    };
    return map[stage] || stage;
}
