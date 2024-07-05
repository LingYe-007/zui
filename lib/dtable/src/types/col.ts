import type {ClassNameLike} from '@zui/core';
import type {CellRenderCallback} from './cell';

export type ColName = string;

export type ColFlexGrow = number;

export type ColFlex = ColFlexGrow | boolean;

export type ColFixedSide = 'left' | 'right' | false;

export type ColSide = 'left' | 'right' | 'center';

export type ColInfoLike = string | number | ColInfo;

export type ColBorderType = 'left' | 'right' | boolean;

export type ColInfo<S = ColSetting> = {
    name: ColName;
    type: string;
    flex: ColFlexGrow; // 0 will disable flex
    width: number;
    realWidth: number;
    left: number;
    setting: S & {onRenderCell?: CellRenderCallback<S>};
    visible: boolean;
    index: number;
    side: ColSide;
    sideIndex: number;
    order?: number;
    border?: ColBorderType;
};

export type ColSetting<S = {}> = S & {
    name: ColName;
} & Partial<{
    title: string;
    width: number | `${number}%`;
    minWidth: number;
    maxWidth: number;
    order: number;
    flex: ColFlex;
    fixed: ColFixedSide;
    border: ColBorderType;
    align: 'left' | 'center' | 'right';
    data: Record<string, unknown>;
    style: preact.JSX.CSSProperties;
    cellStyle: preact.JSX.CSSProperties;
    cellClass: ClassNameLike;
    className: ClassNameLike;
    type: string;
    hidden: boolean;
    colHover: boolean;
    onRenderCell: CellRenderCallback<ColSetting & S>;
    [prop: `data-${string}`]: string;
    [prop: string]: unknown;
}>;
