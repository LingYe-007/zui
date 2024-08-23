import {CalendarEvent} from './calendar-event-props';
export interface CalendarState {
    date: Date;
}

export interface CalendarContentState {
    isExtended: boolean;
    dateList:{date:Date} [][];
    eventMap: Map<string, CalendarEvent[]>;
    eventSetMap?: Map<string, CalendarEvent[]>;
}

export interface EventState {
    date: Date;
}