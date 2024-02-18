export type SizeSetting = number | `${number}%` | `${number}px` | `${number}/${number}` | (string & {}) | (() => SizeSetting);

export function parseSize(size: SizeSetting): [value: number, type?: 'px' | '%'] {
    if (typeof size === 'function') {
        return parseSize(size());
    }
    if (typeof size === 'number') {
        return [size];
    }
    let match = size.match(/(\d+)(%|px)?/);
    if (match) {
        return [parseInt(match[1]), match[2] as 'px' | '%'];
    }
    match = size.match(/(\d+)\/(\d+)/);
    if (match) {
        return [100 * parseInt(match[1]) / parseInt(match[2]), '%'];
    }
    return [NaN];
}

export function toCssSize(size: SizeSetting | undefined | null): string | null {
    if (size === undefined || size === null) {
        return null;
    }
    const [val, unit = 'px'] = parseSize(size);
    if (Number.isNaN(val)) {
        return typeof size === 'string' ? size : null;
    }
    return `${val}${unit}`;
}
