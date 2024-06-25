export type DateLike = Date | number | string;

export type DurationType = 'day' | 'month' | 'year' | 'week' | 'hour' | 'minute' | 'second';

export type DateFormatter = (date: Date) => string;

/**
 * 一天的总毫秒数
 */
export const TIME_DAY = 24 * 60 * 60 * 1000;

/**
 * 创建一个 Date 对象
 * @param date 用于创建 Date 对象的日期时间表达值，如果留空则创建当前系统时间对象
 * @returns 日期时间对象
 */
export const createDate = (date?: DateLike): Date => {
    if (date === undefined) {
        return new Date();
    }
    if (date instanceof Date) {
        return date;
    }
    if (typeof date === 'string') {
        date = date.trim();
        if (/^\d+$/.test(date)) {
            date = Number.parseInt(date, 10);
        }
    }
    if (typeof date === 'number' && date < 10000000000) {
        date *= 1000;
    }
    date = new Date(date);
    return date;
};

export const addDate = (date: DateLike, value: number | string, type: DurationType = 'day'): Date => {
    if (typeof value === 'string') {
        const count = Number.parseInt(value, 10);
        type = value.replace(count.toString(), '') as DurationType;
        value = count;
    }
    date = new Date(createDate(date).getTime());
    if (type === 'month') {
        date.setMonth(date.getMonth() + value);
    } else if (type === 'year') {
        date.setFullYear(date.getFullYear() + value);
    } else if (type === 'week') {
        date.setDate(date.getDate() + value * 7);
    } else if (type === 'hour') {
        date.setHours(date.getHours() + value);
    } else if (type === 'minute') {
        date.setMinutes(date.getMinutes() + value);
    } else if (type === 'second') {
        date.setSeconds(date.getSeconds() + value);
    } else {
        date.setDate(date.getDate() + value);
    }
    return date;
};

/**
 * 判断两个日期是否是在同一天
 * @param date1 第一个日期时间表达值
 * @param date2 第二个日期时间表达值，如果留空则使用当前系统时间
 * @returns 如果为 `true` 则表示两个日期是同一天
 */
export const isSameDay = (date1: DateLike, date2: DateLike = new Date()): boolean => {
    return createDate(date1).toDateString() === createDate(date2).toDateString();
};

/**
 * 判断两个日期是否是在同一年
 * @param date1 第一个日期时间表达值
 * @param date2 第二个日期时间表达值，如果留空则使用当前系统时间
 * @returns 如果为 `true` 则表示两个日期是同一年
 */
export const isSameYear = (date1: DateLike, date2: DateLike = new Date()): boolean => createDate(date1).getFullYear() === createDate(date2).getFullYear();

/**
 * 判断两个日期是否是在同一个月
 * @param date1 第一个日期时间表达值
 * @param date2 第二个日期时间表达值，如果留空则使用当前系统时间
 * @returns 如果为 `true` 则表示两个日期是同一月
 */
export const isSameMonth = (date1: DateLike, date2: DateLike = new Date()): boolean => {
    date1 = createDate(date1);
    date2 = createDate(date2);
    return date1.getFullYear() === date2.getFullYear()
        && date1.getMonth() === date2.getMonth();
};

/**
 * 判断两个日期是否是在同一个周（周一为第一天）
 * @param date1 第一个日期时间表达值
 * @param date2 第二个日期时间表达值，如果留空则使用当前系统时间
 * @returns 如果为 `true` 则表示两个日期是同一周
 */
export const isSameWeek = (date1: DateLike, date2: DateLike = new Date()): boolean => {
    date1 = createDate(date1);
    date2 = createDate(date2);
    const oneDayTime = 1000 * 60 * 60 * 24;
    const weeks1 = Math.floor(date1.getTime() / oneDayTime);
    const weeks2 = Math.floor(date2.getTime() / oneDayTime);
    // 1970-1-1 是周四
    return Math.floor((weeks1 + 4) / 7) === Math.floor((weeks2 + 4) / 7);
};

/**
 * 判断指定的日期是否是在今天
 * @param date 要判断的日期时间表达值
 * @param now 作为今天判断依据的日期，如果留空则使用当前系统时间
 * @returns 如果为 `true` 则表示是今天
 */
export const isToday = (date: DateLike, now?: DateLike): boolean => isSameDay(createDate(now), date);

/**
 * 判断指定的日期是否是在昨天
 * @param date 要判断的日期时间表达值
 * @param now 作为今天判断依据的日期，如果留空则使用当前系统时间
 * @returns 如果为 `true` 则表示是昨天
 */
export const isYesterday = (date: DateLike, now?: DateLike): boolean => isSameDay(createDate(now).getTime() - TIME_DAY, date);

/**
 * 判断指定的日期是否是在明天
 * @param date 要判断的日期时间表达值
 * @param now 作为今天判断依据的日期，如果留空则使用当前系统时间
 * @returns 如果为 `true` 则表示是明天
 */
export const isTomorrow = (date: DateLike, now?: DateLike): boolean => isSameDay(createDate(now).getTime() + TIME_DAY, date);

/**
 * 判断指定的日期是否合法。
 *
 * @param date 要判断的日期时间表达值。
 * @returns 如果为 `true` 则表示是合法的日期时间表达值。
 */
export const isValidDate = (date: DateLike): boolean => date !== undefined && date !== null && !isNaN(createDate(date).getTime());

/**
 * 格式化日期时间值为字符串，所有可用的格式化参数有：
 * - yyyy，例如：'2018'，表示四位数字表示的年份
 * - yy，例如：'18'，表示两位数字表示的年份
 * - MM，例如：'07'，表示两位数字表示的月份，不足两位在起始用 0 填充
 * - M，例如：'10'，表示一位或两位数字表示的月份
 * - dd，例如：'05'，表示两位数字表示的日期，不足两位在起始用 0 填充
 * - d，例如：'5'，表示一位或两位数字表示的日期
 * - hh，例如：'08'，表示两位数字表示的小时，不足两位在起始用 0 填充
 * - h，例如：'8'，表示一位或两位数字表示的小时
 * - mm，例如：'03'，表示两位数字表示的分钟，不足两位在起始用 0 填充
 * - m，例如：'3'，表示一位或两位数字表示的分钟
 * - ss，例如：'05'，表示两位数字表示的秒数，不足两位在起始用 0 填充
 * - s，例如：'5'，表示一位或两位数字表示的秒数
 * - S，例如：'236'，表示毫秒数
 * - SSS，例如：'036'，表示毫秒数，不足3位在起始用 0 填充
 * @summary 格式化日期时间值为字符串
 * @param date 要格式化的日期时间表达值
 * @param format 格式化字符串
 * @returns 日期时间格式化文本
 */
export const formatDate = (date: DateLike, format: string | DateFormatter = 'yyyy-MM-dd hh:mm', invalidDateValue = ''): string => {
    date = createDate(date);
    if (!isValidDate(date)) {
        return invalidDateValue;
    }

    if (typeof format === 'function') {
        return format(date);
    }

    const dateInfo = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'H+': date.getHours() % 12,
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'S+': date.getMilliseconds(),
    };
    if (/(y+)/i.test(format)) {
        if (format.includes('[yyyy-]')) {
            format = format.replace('[yyyy-]', isSameYear(date) ? '' : 'yyyy-');
        }
        format = format.replace(RegExp.$1, (`${date.getFullYear()}`).substring(4 - RegExp.$1.length));
    }
    Object.keys(dateInfo).forEach((k) => {
        if (new RegExp(`(${k})`).test(format as string)) {
            const str = `${dateInfo[k as keyof typeof dateInfo]}`;
            format = (format as string).replace(RegExp.$1, RegExp.$1.length === 1 ? str : (`00${str}`).substring(str.length));
        }
    });
    return format;
};

/**
 * 格式化日期时间范围
 * @param date1 起始时间
 * @param date2 结束时间
 * @param format 格式化参数
 * @returns 时间范围描述文本
 */
export const formatDateSpan = (date1: DateLike, date2: DateLike, format?: {full?: string; month?: string; day?: string; str?: string;}): string => {
    const finalFormat = {
        full: 'yyyy-M-d', month: 'M-d', day: 'd', str: '{0} ~ {1}', ...format,
    };

    const date1Str = formatDate(date1, isSameYear(date1) ? finalFormat.month : finalFormat.full);
    if (isSameDay(date1, date2)) {
        return date1Str;
    }
    const date2Str = formatDate(date2, isSameYear(date1, date2) ? (isSameMonth(date1, date2) ? finalFormat.day : finalFormat.month) : finalFormat.full);
    return finalFormat.str.replace('{0}', date1Str).replace('{1}', date2Str);
};
