import {ComponentChildren} from 'preact';
import {$} from '@zui/core';
import type {ActionBasicProps, ActionMenuItemKey, ActionNestedItemProps, ActionMenuNestedItemOptions, ActionMenuNestedOptions, ActionMenuNestedState, ActionMenuOptions} from '../types';
import {ActionMenu} from './action-menu';
import {ActionNestedItem} from './action-nested-item';

export class ActionMenuNested<T extends ActionBasicProps = ActionMenuNestedItemOptions, P extends ActionMenuNestedOptions<T> = ActionMenuNestedOptions<T>> extends ActionMenu<T, P, ActionMenuNestedState> {
    static ItemComponents = {
        item: ActionNestedItem,
    };

    #keys = new Set<ActionMenuItemKey>();

    #controlled: boolean;

    constructor(props: P) {
        super(props);
        this.#controlled = props.nestedShow === undefined; // Controlled menu use state to store nested
        if (this.#controlled) {
            this.state = {nestedShow: props.defaultNestedShow ?? {}};
        }
    }

    get nestedTrigger() {
        return this.props.nestedTrigger;
    }

    beforeRender(): Omit<P, 'items'> & {items: T[]} {
        const allProps = super.beforeRender();
        const {nestedShow, nestedTrigger, defaultNestedShow, controlledMenu, indent, ...props} = allProps;
        if (typeof props.items === 'function') {
            props.items = props.items(this);
        }
        if (!controlledMenu && indent) {
            props.style = Object.assign({
                [`--${this.name}-indent`]: `${indent}px`,
            }, props.style);
        }
        return props as Omit<P, 'items'> & {items: T[]};
    }

    getNestedMenuProps(items: ActionMenuNestedItemOptions[]): ActionMenuNestedOptions {
        const {name, controlledMenu, nestedShow, beforeDestroy, beforeRender, itemRender, onClickItem, afterRender, commonItemProps, level} = this.props;
        return {
            items: items,
            name: name,
            nestedShow: this.#controlled ? this.state.nestedShow : nestedShow,
            nestedTrigger: this.nestedTrigger,
            controlledMenu: (controlledMenu || this) as ActionMenuNested,
            commonItemProps: commonItemProps,
            onClickItem: onClickItem as ActionMenuOptions['onClickItem'],
            afterRender: afterRender as ActionMenuOptions['afterRender'],
            beforeRender: beforeRender as ActionMenuOptions['beforeRender'],
            beforeDestroy: beforeDestroy as ActionMenuOptions['beforeDestroy'],
            itemRender: itemRender as ActionMenuOptions['itemRender'],
            level: (level || 0) + 1,
        };
    }

    renderNestedMenu(item: ActionNestedItemProps) {
        let {items} = item;
        if (!items) {
            return;
        }
        if (typeof items === 'function') {
            items = items(item, this as ActionMenuNested);
        }
        if (!items.length) {
            return;
        }
        const NestedMenuComponent = (this.constructor as typeof ActionMenuNested);
        const props = this.getNestedMenuProps(items);

        return (
            <NestedMenuComponent {...props} data-level={props.level} />
        );
    }

    isNestedItem(item: T): boolean {
        return (!item.type || item.type === 'item') && !!(item as ActionNestedItemProps).items;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    renderToggleIcon(_show: boolean, _item: ActionNestedItemProps): ComponentChildren | void {
    }

    getItemRenderProps(props: Omit<P, 'items'> & {items: T[]}, item: T, index: number): T {
        const itemProps = super.getItemRenderProps(props, item, index);
        (itemProps as ActionNestedItemProps).level = (props.level || 0);
        if (!this.isNestedItem(itemProps)) {
            return itemProps;
        }
        const key = itemProps.key ?? (itemProps as {id?: string}).id ?? `${(props.level || 0)}:${index}`;
        this.#keys.add(key);
        const show = this.isExpanded(key);
        if (show) {
            itemProps.rootChildren = [
                itemProps.rootChildren,
                this.renderNestedMenu(item),
            ];
        }
        if (this.nestedTrigger === 'hover') {
            itemProps.rootAttrs = {
                ...itemProps.rootAttrs,
                onMouseEnter: this.#toggleMenuByEvent.bind(this, key, true),
                onMouseLeave: this.#toggleMenuByEvent.bind(this, key, false),
            };
        } else if (this.nestedTrigger === 'click') {
            const {onClick} = itemProps;
            itemProps.onClick = (event) => {
                this.#toggleMenuByEvent(key, undefined, event);
                (onClick as (event: MouseEvent) => void)?.(event);
            };
        }
        const toggleIcon = this.renderToggleIcon(show, itemProps);
        if (toggleIcon) {
            itemProps.children = [itemProps.children, toggleIcon];
        }
        (itemProps as ActionNestedItemProps).show = show;
        itemProps.rootClass = [itemProps.rootClass, 'has-nested-menu', show ? 'show' : ''];
        return itemProps;
    }

    isExpanded(key: ActionMenuItemKey) {
        const nestedShow = this.#controlled ? this.state.nestedShow : this.props.nestedShow;
        if (nestedShow && typeof nestedShow === 'object') {
            return nestedShow[key];
        }
        return !!nestedShow;
    }

    toggle(key: ActionMenuItemKey, toggle?: boolean): boolean {
        const {controlledMenu} = this.props;
        if (controlledMenu) {
            return controlledMenu.toggle(key, toggle);
        }
        if (!this.#controlled) {
            return false;
        }
        let {nestedShow: nestedShowState = {}} = this.state;
        if (typeof nestedShowState === 'boolean') {
            if (nestedShowState === true) {
                nestedShowState = [...this.#keys.values()].reduce<Record<ActionMenuItemKey, boolean>>((map, k) => {
                    map[k] = true;
                    return map;
                }, {});
            } else {
                nestedShowState = {};
            }
        }
        if (toggle === undefined) {
            toggle = !nestedShowState[key];
        } else if (!!nestedShowState[key] === !!toggle) {
            return false;
        }
        if (toggle) {
            nestedShowState[key] = toggle;
        } else {
            delete nestedShowState[key];
        }
        this.setState({nestedShow: {...nestedShowState}});
        return true;
    }

    expand(key: ActionMenuItemKey) {
        return this.toggle(key, true);
    }

    collapse(key: ActionMenuItemKey) {
        return this.toggle(key, false);
    }

    expandAll() {
        if (!this.#controlled) {
            return;
        }
        this.setState({nestedShow: true});
    }

    collapseAll() {
        if (!this.#controlled) {
            return;
        }
        this.setState({nestedShow: false});
    }

    #toggleMenuByEvent = (key: ActionMenuItemKey, toggle: boolean | undefined, event: MouseEvent) => {
        if ($(event.target as HTMLElement).closest('.not-nested-toggle').length) {
            return;
        }
        this.toggle(key, toggle);
        event.preventDefault();
    };
}
