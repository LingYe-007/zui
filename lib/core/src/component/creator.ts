import {$, Cash} from '../cash';
import {takeData} from '../helpers/data';
import {getZData} from '../helpers/z';
import {Component} from './component';

import type {ComponentOptions} from './types';

export type ComponentClass = typeof Component;

export type ComponentCreateOptions = ComponentOptions & {
    $update?: boolean;
};

export function getComponent(name: string): ComponentClass | undefined {
    return Component.map.get(name.toLowerCase());
}

export function create(name: string, element: HTMLElement, options: ComponentCreateOptions = {}) {
    const TheComponentClass = getComponent(name);
    if (!TheComponentClass) {
        return null;
    }
    if (!TheComponentClass.MULTI_INSTANCE) {
        const component = TheComponentClass.get(element);
        if (component) {
            if (options.$update) {
                delete options.$update;
                component.render(options);
            } else {
                console.warn(`[ZUI] cannot create component "${name}" on element which already has a component instance.`, {element, options});
            }
            return component;
        }
    }
    return new TheComponentClass(element, options);
}

function createInAnimationFrame(name: string, element: HTMLElement, options: ComponentCreateOptions = {}) {
    requestAnimationFrame(() => create(name, element, options));
}

export function registerComponent(component: ComponentClass, name?: string) {
    Component.register(component, name);
}

export function initGlobalComponents() {
    const {zui} = window as unknown as {zui: Record<string, ComponentClass>};
    if (zui) {
        Object.keys(zui).forEach((n) => {
            const TheComponentClass = zui[n];
            if (!TheComponentClass.NAME || !TheComponentClass.ZUI) {
                return;
            }
            registerComponent(TheComponentClass);
        });
    }
}

export function defineFn(name?: string) {
    if (name) {
        getComponent(name)?.defineFn();
    } else {
        initGlobalComponents();
        Component.map.forEach((TheComponentClass) => {
            TheComponentClass.defineFn();
        });
    }
}

/* Declare types. */
declare module 'cash-dom' {
    interface Cash {
        zuiInit(this: Cash, options?: {update?: boolean}): Cash;
        zui(this: Cash, name?: string, key?: string | number | true): ComponentClass | ComponentClass[] | Record<string, ComponentClass> | undefined;
        zuiCall(this: Cash, method: string, args?: unknown[]): Cash;
    }
}

/**
 * Create zui component instance from elements which match [zui-create], [data-zui], [data-zui] is deprecated, use [zui-create] instead.
 * 为匹配 [zui-create], [data-zui] 的元素创建 zui 组件实例，[data-zui] 被弃用，优先使用 [zui-create]。
 *
 * @param element - The element to create zui components. 要创建 zui 组件的元素。
 * @param options - The options. 选项。
 *
 * @example
 * ```html
 * <div zui-create="list" zui-create-list='{"items": [{"text": "item1"}, {"text": "item2"}]}'></div>
 * <menu zui-create zui-create-list='{$replace: true, items: [{text: "item1"}, {text: "item2"}], onClickItem: (item) => console.log("click item", item)}'></menu>
 * <menu zui-create="list,sortable" zui-create-list='{$replace: true, items: [{"text": "item1"}, {"text": "item2"}]}' zui-create-sortable="{dragShadow: false}">Create multiple components</menu>
 *
 * <div data-zui="list" data-items='[{"text": "item1"}, {"text": "item2"}]'>Deprecated usage</div>
 * ```
 */
function initCreators(element: HTMLElement, options: {update?: boolean} = {}): void {
    const $element = $(element);
    let createNames = $element.attr('zui-create');
    const $update = options.update;
    const defaultCreateOptions = {
        $update,
        $optionsFromDataset: false,
    };
    if (typeof createNames === 'string') {
        createNames = createNames.trim();
        const names = createNames.length ? createNames.split(',').map((name) => name.trim()) : [];
        const createOptionsMap = getZData(element, {prefix: 'zui-create-', evalValue: true})!;
        const createOptionsNames = Object.keys(createOptionsMap);
        if (!createOptionsNames.length && names.length === 1) {
            createInAnimationFrame(names[0], element, {
                ...defaultCreateOptions,
                ...$element.dataset(),
            });
        } else {
            const initedNames = new Set<string>();
            [...names, ...createOptionsNames].forEach(name => {
                if (initedNames.has(name)) {
                    return;
                }
                const createOptions = createOptionsMap[name] as ComponentCreateOptions | undefined;
                createInAnimationFrame(name, element, {
                    ...defaultCreateOptions,
                    ...createOptions,
                });
                delete createOptionsMap[name];
                initedNames.add(name);
            });
        }
    } else {
        const initOptions = $element.dataset();
        const name = initOptions?.zui as string;
        if (!name) {
            return;
        }
        console.warn('[ZUI] create component instance with [data-zui] is deprecated, use [zui-create] instead.', {element, options});
        delete initOptions!.zui;
        createInAnimationFrame(name, element, {
            ...defaultCreateOptions,
            ...initOptions,
        });
    }
}

/** Define the $.fn.zuiInit method. */
$.fn.zuiInit = function (this: Cash, options?: {update?: boolean}) {
    this.find('[zui-create],[data-zui]').each(function () {
        initCreators(this, options);
    });
    this.find('[zui-init]').each(function () {
        const $element = $(this);
        if ($element.z('zuiInited')) {
            return;
        }
        $.runJS($element.z('zuiInited', true).attr('zui-init') as string, ['$element', $element]);
    });
    this.find('.hide-before-init').removeClass('invisible hidden opacity-0');
    this.find('.scroll-into-view').scrollIntoView();
    this.find('[data-on="inited"]').each((_, ele) => {
        const $ele = $(ele);
        if (!$ele.zui()) {
            $ele.trigger('inited');
        }
    });
    return this;
};

/** Define the $.fn.zui method. */
$.fn.zui = function (this: Cash, name?: string | true, key?: string | number | true) {
    const element = this[0];
    if (!element) {
        return;
    }
    if (typeof name !== 'string') {
        const data = takeData(element, undefined, true) as Record<string, Component>;
        const result: Record<string, Component> = {};
        let lastComponent: Component | undefined;
        Object.keys(data).forEach((dataKey) => {
            if (dataKey.startsWith('zui.')) {
                const component = data[dataKey] as Component;
                result[dataKey] = component;
                if (!lastComponent || lastComponent.gid < component.gid) {
                    lastComponent = result[dataKey];
                }
            }
        });
        return name === true ? result : lastComponent;
    }
    const TheComponentClass = getComponent(name);
    if (!TheComponentClass) {
        return $(element).data(`zui.${name}`);
    }
    if (key === true) {
        return TheComponentClass.getAll(element);
    }
    return TheComponentClass.query(element, key);
};

$.fn.zuiCall = function (this: Cash, componentMethod: string, args: unknown[] = []) {
    this.each(function () {
        const parts = componentMethod.split('.');
        const name = parts.length > 1 ? parts[0] : undefined;
        const method = parts[parts.length > 1 ? 1 : 0];
        const component = $(this).zui(name) as (Component | undefined);
        const methodFunc = component?.[method as keyof Component];
        if (typeof methodFunc === 'function') {
            (methodFunc as ((...args: unknown[]) => void)).apply(component, args);
        }
    });
    return this;
};

/** Auto call creator on elements match [data-zui]. */
$(() => {
    $('body').zuiInit({update: true});
});
