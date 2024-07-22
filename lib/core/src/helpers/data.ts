import {$, Cash} from '../cash';

/**
 * Cache for data associated with the target object.
 */
const cache = new WeakMap<object, Record<string, unknown>>();

/**
 * Store data associated with the target object with key value in the cache.
 *
 * @param target  Target object to store data.
 * @param key     Key to store.
 * @param value   Value to store.
 */
export function storeData(target: object, key: string | null, value?: unknown): void;

/**
 * Store data associated with the target object in the cache.
 *
 * @param target  Target object to store data.
 * @param data    Data to store.
 */
export function storeData(target: object, data: Record<string, unknown>): void;

/**
 * Store data associated with the target object in the cache.
 *
 * @param target    Target object to store data.
 * @param keyOrData Key or data to store.
 * @param value     Value to store.
 */
export function storeData(target: object, keyOrData: string | Record<string, unknown> | null, value?: unknown): void {
    const hasCache = cache.has(target);
    const data = hasCache ? cache.get(target)! : {};
    if (typeof keyOrData === 'string') {
        data[keyOrData] = value;
    } else if (keyOrData === null) {
        Object.keys(data).forEach((key) => {
            delete data[key];
        });
    } else {
        Object.assign(data, keyOrData);
    }

    Object.keys(data).forEach((key) => {
        if (data[key] === undefined) {
            delete data[key];
        }
    });

    if (Object.keys(data).length) {
        if (!hasCache && target instanceof Element) {
            Object.assign(data, $(target).dataset(), data);
        }
        cache.set(target, data);
    } else {
        cache.delete(target);
    }
}

/**
 * Take data associated with the target object from the cache.
 *
 * @param target Target object to take data.
 */
export function takeData(target: object): Record<string, unknown>;

/**
 * Take data associated by key with the target object from the cache.
 *
 * @param target  Target object to take data.
 * @param key     Key to take.
 */
export function takeData(target: object, key: string): unknown;

/**
 * Take data associated by key with the target object from the cache.
 *
 * @param target  Target object to take data.
 * @param key     Key to take.
 */
export function takeData(target: object, key: string | undefined, skipElementData: boolean): unknown;

/**
 * Take data associated with the target object from the cache.
 *
 * @param target Target object to take data.
 * @param key    Key to take.
 * @returns      Data associated with the target object.
 */
export function takeData(target: object, key?: string, skipElementData?: boolean): unknown {
    let data = cache.get(target) || {};
    if (!skipElementData && target instanceof Element) {
        data = Object.assign({}, $(target).dataset(), data);
    }
    if (key === undefined) {
        return data;
    }
    return data[key];
}

/**
 * Clear data associated with the target object from the cache.
 */
export function clearData(target: object): void {
    cache.delete(target);
}

/* Declare types. */
declare module 'cash-dom' {
    interface Cash {
        dataset(): Record<string, unknown> | undefined;
        dataset(name: string): unknown | undefined;
        dataset(name: string, value: unknown): Cash;
        dataset(dataset: Record<string, unknown>): Cash;

        removeData(name?: string): Cash;
    }
}

/* Backup the origin $.fn.data method. */
$.fn.dataset = $.fn.data;

/* Extend as $.fn.data() */
$.fn.data = function (this: Cash, ...args: (string | Record<string, unknown> | unknown)[]) {
    const [data, value] = args;
    if (!args.length || (args.length === 1 && typeof data === 'string')) {
        if (!this.length) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return takeData(this[0]!, data as string) as any;
    }
    return this.each((_, ele) => {
        return storeData(ele, data as string, value);
    });
};

/* Extend as $.fn.removeData() */
$.fn.removeData = function (this: Cash, name: string | null = null) {
    return this.each((_, ele) => {
        return storeData(ele, name);
    });
};
