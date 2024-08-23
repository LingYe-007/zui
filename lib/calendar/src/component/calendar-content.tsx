import {HElement} from '@zui/core';
import '@zui/label';
import {CalendarEventDom} from './calendar-event';
import {Draggable} from '@zui/dnd';

import type {CalendarProps,  CalendarEvent, CalendarContentState, EventState} from '../types';
import type {Attributes, RenderableProps, VNode} from 'preact';
import {i18n} from '@zui/core';
import '../i18n';

export class CalendarContent<P extends CalendarProps = CalendarProps> extends HElement<P, CalendarContentState> {
    constructor(props: P) {
        super(props);
        this.state = {'isExtended':false, 'dateList': this.generateCalendarPageByDate(props.date), 'eventMap': this.generateCalendarEvents(), 'eventSetMap': this.generateCalendarSetEvents()};
    }

    // 获取年、月、日
    getYearMonthDay(date:Date) {
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1, // 月份从0开始，需要加1
            day: date.getDate(),
        };
    }

    generateCalendarEvents() {
        const map = new Map<string, CalendarEvent[]>();
        this.props.calendarEvents?.forEach((item) => {
            if (item.date !== undefined) {
                const dateKey = new Date(item.date).toISOString().split('T')[0]; // 将日期转换为 'YYYY-MM-DD' 格式
                if (!map.has(dateKey)) {
                    map.set(dateKey, [item]);
                } else {
                    const currentEvents = map.get(dateKey);
                    if (currentEvents) {
                        map.set(dateKey, currentEvents.concat(item));
                    } else {
                        map.set(dateKey, [item]);
                    }
                }
            }
        });
        return map;
    }

    componentDidMount() {
        const {onEventDragStart, onEventDragEnd, onEventDrop, onEventDragEnter, onEventDragLeave} = this.props;
        new Draggable('#calendar-body', {
            target:'[target="true"]',
            onDragStart: (event, dragElement) => {
                console.log('onDragStart', event, dragElement); 
                if (onEventDragStart) onEventDragStart(event, dragElement);
            },
            onDragEnd: (event, dragElement) => {
                console.log('onDragEnd', {event, dragElement});
                if (onEventDragEnd) onEventDragEnd(event, dragElement);
            },
            onDragEnter: (event, dragElement, dropElement) => {
                console.log('onDragEnter', {event, dragElement, dropElement});
                if (onEventDragEnter) onEventDragEnter(event, dragElement, dropElement);
            },
            onDragLeave: (event, dragElement, dropElement) => {
                console.log('onDragLeave', {event, dragElement, dropElement});
                if (onEventDragLeave) onEventDragLeave(event, dragElement, dropElement);
            },
            onDrop: (event, dragElement, dropElement) => {
                console.log('onDrop', {event, dragElement, dropElement});
                if (dragElement && dropElement) {
                    const prevDate = new Date( dragElement.dataset.date || '');
                    const changeDate: Date = new Date( dropElement.dataset.date || '');
                    const index: number = Number(dragElement.dataset.index);
                    const prevDateEvents = prevDate && this.state.eventMap.get(prevDate?.toISOString().split('T')[0]);
                    const currentDateEvents = this.state.eventMap.get(changeDate?.toISOString().split('T')[0]) ? this.state.eventMap.get(changeDate?.toISOString().split('T')[0]) : [];
                    if (prevDateEvents) {
                        const emptyAry: CalendarEvent[] = [];
                        const eventToMove = index !== undefined && index >= 0 && index < prevDateEvents.length ? [prevDateEvents[index]] : emptyAry;
                        eventToMove[0].date = new Date(changeDate.getFullYear(), changeDate.getMonth(), changeDate.getDate(), prevDate.getHours(), prevDate.getMinutes(), prevDate.getSeconds());
                        if (eventToMove && Array.isArray(currentDateEvents)) {
                            currentDateEvents.push(...eventToMove);
                            const newEventMap = new Map(this.state.eventMap);
                            newEventMap.set(changeDate?.toISOString().split('T')[0], currentDateEvents);
                            if (index !== undefined && index >= 0 && index < prevDateEvents.length) {
                                prevDateEvents.splice(index, 1);
                                if (prevDateEvents.length === 0) {
                                    newEventMap.delete(prevDate?.toISOString().split('T')[0]);
                                } else {
                                    newEventMap.set(prevDate?.toISOString().split('T')[0], [...prevDateEvents]);
                                }
                            }
                            console.log('newEventMap', newEventMap);   
                            this.setState({eventMap: newEventMap});
                        }
                    }
                }
                if (onEventDrop) onEventDrop(event, dragElement, dropElement);
            },
        });
    }

    componentDidUpdate(prevProps: P) {
        if (prevProps.date.getFullYear() !== this.props.date.getFullYear() || prevProps.date.getMonth() !== this.props.date.getMonth()  || prevProps.date.getDate() !== this.props.date.getDate()) {
            this.setState({'dateList':  this.generateCalendarPageByDate(this.props.date)});
        }
    }  

    generateCalendarPageByDate(date: Date): EventState[][] {
        const year = date.getFullYear();
        const month = date.getMonth();
    
        // 获取该月第一天的日期对象
        const firstDayOfMonth = new Date(year, month, 1);
        let firstDayOfWeek = firstDayOfMonth.getDay() - 1;
        if (firstDayOfWeek === -1) {
            firstDayOfWeek = 6;
        }
    
        // 初始化日期格子
        const page: EventState[][] = [];
        const currentDate = new Date(firstDayOfMonth);
    
        // 填充前导空白天数
        let week: EventState[] = new Array(firstDayOfWeek).fill({date: null});
    
        // 填充该月的日期
        for (let i = 0; i < 6; i++) {
            for (let j = week.length; j < 7; j++) {
                week.push({date: new Date(currentDate)});
                currentDate.setDate(currentDate.getDate() + 1);
            }
            page.push(week);
            week = [];
        }
        const firstWeek = page[0];
    
        // 填充第一周的前导日期
        for (let i = firstDayOfWeek; i >= 0; i--) {
            const prevDate = new Date(firstDayOfMonth);
            prevDate.setDate(prevDate.getDate() - (firstDayOfWeek - i));
            firstWeek[i] = {date: prevDate};
        }

        return page;
    }

    //生成事件集与事件的对应关系
    generateCalendarSetEvents(): Map<string, CalendarEvent[]> {
        const map = new Map<string, CalendarEvent[]>();
        this.props.calendarEvents?.forEach((item) => {
            if (item.calendarEventGroup !== undefined) {
                this.props.calendarEventGroups?.forEach(element => {
                    if (element.id === item.calendarEventGroup) {
                        map.set(element.id, map.get(element.id)?.concat(item) || [item]);
                    }
                });
            }
        });
        return map;
    }

    render(props: RenderableProps<P>): VNode<Attributes> {
        const headerList: string[] = i18n.getLang('weekNames') || [];
        const monthFormat = i18n.getLang('monthFormat');
        const {maxVisibleEvents, onEventClick} = props;
        // 处理事件map
        const tdStyle = {position:'relative', verticalAlign:'top'};

        return (<div className="calendar">
            <table className="calendar-table">
                <thead className="calendar-content-header">
                    <tr >
                        {
                            headerList?.map((item, index) => {
                                return <th key={index} className="calendar-header-part">{item}</th>;
                            })
                        }
                    </tr>
                </thead>
                <tbody id="calendar-body">
                    {this.state.dateList?.map((line) => {
                        return (<tr>{   line.map((item) => {
                            return <td style={tdStyle} data-date = {new Date(item.date)}  key={`${item.date.getMonth() + 1}-${item.date.getDate()}`} target='true' className={'calendar-td' + ' ' + (props.date.getFullYear() === item.date.getFullYear() && item.date.getMonth() + 1 === props.date.getMonth() + 1 ? 'active' : '') + (new Date().getFullYear() === item.date.getFullYear() && item.date.getMonth() + 1 === new Date().getMonth() + 1 && item.date.getDate() === new Date().getDate() ? '-today' : '')} >
                                <div className={'calendar-body-part'}>
                                    <div className='calendar-body-header'>
                                        {item.date.getDate() == 1 ? <label className='label gray calendar-body-header-month'>{item.date.getMonth() + 1}{monthFormat}</label> : ''}
                                        <div className='calendar-body-header-day'>{item.date.getDate()}</div>
                                    </div>
                                    {this.state.eventMap ? (
                                        <CalendarEventDom
                                            isExtended={this.state.isExtended}
                                            maxVisibleEvents={maxVisibleEvents}
                                            eventSetMap = {this.state.eventSetMap}
                                            onEventClick={onEventClick}
                                            calendarEventGroups = {this.props.calendarEventGroups}
                                            calendarEvents={this.state.eventMap.get(item.date.toISOString().split('T')[0]) || []}
                                        ></CalendarEventDom>) : null}
                                        
                                </div>
                                <div className={'calendar-body-bottom'}>{item.date && !this.state.isExtended && maxVisibleEvents && maxVisibleEvents < (this.state.eventMap.get(item.date.toISOString().split('T')[0]) ?.length || 0) && (<span class="calendar-body-bottom label ghost" onClick={() => {this.setState({'isExtended':true});}} ><span class="chevron-down"></span></span>)}{this.state.isExtended && maxVisibleEvents && maxVisibleEvents < (this.state.eventMap.get(item.date.toISOString().split('T')[0]) ?.length || 0) && (<span class="calendar-body-bottom label ghost" onClick={() => {this.setState({'isExtended':false});}} ><span class="chevron-up"></span></span>)}</div></td>;
                        })}
                        </tr>);
                    })}
                </tbody>
            </table></div>);
    }
}