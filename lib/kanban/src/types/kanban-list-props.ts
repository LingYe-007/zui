import type {HElementProps, Selector, SizeSetting} from '@zui/core';
import type {MoveableOptions} from '@zui/dnd/src/types';
import type {KanbanProps} from './kanban-props';
import type {KanbanGroup} from '../component';

export interface KanbanListProps extends HElementProps {
    items?: (KanbanProps | KanbanGroup)[];
    moveable?: boolean | MoveableOptions;
    responsive?: Selector | boolean;
    sticky?: boolean;
    height?: SizeSetting | (() => SizeSetting);
    width?: SizeSetting | (() => SizeSetting);
    scrollbarHover?: boolean;
}