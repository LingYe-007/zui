import {IconType, ComponentChildren} from '@zui/core';
import {PickOptions} from '@zui/pick/src/types';

export interface ColorPickerOptions extends PickOptions {
    colors?: string[];
    icon?: IconType;
    syncText?: string;
    syncColor?: string;
    syncBackground?: string;
    syncBorder?: string;
    hint?: string;
    closeBtn?: boolean;
    heading?: ComponentChildren;
}