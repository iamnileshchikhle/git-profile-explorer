const UNITS = [
    ['year', 365 * 24 * 60 * 60 * 1000],
    ['month', 30 * 24 * 60 * 60 * 1000],
    ['week', 7 * 24 * 60 * 60 * 1000],
    ['day', 24 * 60 * 60 * 1000],
    ['hour', 60 * 60 * 1000],
    ['minute', 60 * 1000],
];

export function relativeTime(isoDate) {
    const diff = Date.now() - new Date(isoDate).getTime();
    if (diff < 60_000) return 'just now';

    for (const [unit, ms] of UNITS) {
        const value = Math.floor(diff / ms);
        if (value >= 1) return `${value} ${unit}${value > 1 ? 's' : ''} ago`;
    }
    return 'just now';
}
