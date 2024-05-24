import type {CustomContentType} from '@zui/core';
import type {KanbanColOptions} from './kanban-col-options';
import type {KanbanItemInfo} from './kanban-item-info';
import type {KanbanItemsMap} from './kanban-items-map';
import type {KanbanLaneOptions} from './kanban-lane-options';

export interface KanbanBodyProps {
    cols: KanbanColOptions[];
    lanes: KanbanLaneOptions[];
    items: KanbanItemsMap;
    hideLaneName?: boolean;
    itemRender?: (info: KanbanItemInfo) => CustomContentType;
    getLaneCol?: (lane: KanbanLaneOptions, col: KanbanColOptions) => KanbanColOptions | void;
}
