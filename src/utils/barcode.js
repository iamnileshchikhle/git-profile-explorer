export function generateBarcodeBars(seed, count = 24) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }

    const bars = [];
    for (let i = 0; i < count; i++) {
        hash = (Math.imul(hash, 1103515245) + 12345) >>> 0;
        const width = 1 + (hash % 4);
        hash = (Math.imul(hash, 1103515245) + 12345) >>> 0;
        const height = 45 + (hash % 56);
        bars.push({ width, height });
    }
    return bars;
}
