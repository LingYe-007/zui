import {Component, $, Cash} from '@zui/core';
import {DraggableOptions, DraggableState} from '../types';

const DROPPABLE_SELECTOR = '[droppable="true"]';

export class Draggable extends Component<DraggableOptions> {
    static NAME = 'Draggable';

    static DEFAULT: Partial<DraggableOptions> = {
        selector: '[draggable="true"]',
        dropEffect: 'move',
        hasDraggingClass: 'has-dragging',
        draggingClass: 'is-dragging',
        droppableClass: 'is-droppable',
        droppingClass: 'is-dropping',
    };

    protected _state: DraggableState = {dragging: null, dropping: null};

    protected _$targets?: Cash;

    protected declare _needClean: boolean;

    protected declare _$dragContainer: Cash;

    protected declare _$dropContainer: Cash;

    get state() {
        return this._state;
    }

    get dragElement() {
        return this._state.dragging;
    }

    get dropElement() {
        return this._state.dropping;
    }

    async afterInit() {
        const {namespace} = this;
        const {dragContainer, dropContainer, onDrag} = this.options;
        this._$dragContainer = dragContainer ? $(dragContainer) : this.$element;
        this._$dropContainer = dropContainer ? $(dropContainer) : this._$dragContainer;

        this._$dragContainer.on('mousedown' + namespace, this._handleMouseDown)
            .on('dragstart' + namespace, this._handleDragStart)
            .on('dragend' + namespace, this._handleDragEnd);
        if (onDrag) {
            this._$dragContainer.on('drag' + namespace, this._handleDrag);
        }
        this._$dropContainer.on('dragover' + namespace, this._handleDragOver)
            .on('dragenter' + namespace, this._handleDragEnter)
            .on('dragleave' + namespace, this._handleDragLeave)
            .on('drop' + namespace, this._handleDrop);
        $(document).on(`mouseup${this.namespace}`, this._clean.bind(this));
    }

    destroy(): void {
        this._clean();
        $(document).off(this.namespace);
        this._$dragContainer.off(this.namespace);
        this._$dropContainer.off(this.namespace);
        super.destroy();
    }

    protected _setState(newState: Partial<DraggableState>) {
        const oldState = this._state;
        const {dragging = oldState.dragging, dropping = oldState.dropping} = newState;
        if (dragging === oldState.dragging && dropping === oldState.dropping) {
            return;
        }

        this._state = {dragging, dropping};
        this.options.onChange?.call(this, this._state, oldState);
    }

    protected _handleMouseDown = (event: MouseEvent) => {
        const {selector, handle, beforeDrag} = this.options;
        const $clickTarget = $(event.target as HTMLElement);
        const $dragElement = $clickTarget.closest(selector);

        const dragElement = $dragElement[0];
        if (!dragElement || (handle && !$clickTarget.closest(handle).length)) {
            return;
        }

        if (beforeDrag && beforeDrag.call(this, event, dragElement) === false) {
            return;
        }

        $dragElement.attr('draggable', 'true');
        this._setState({dragging: dragElement});
    };

    protected _handleDragStart = (event: DragEvent) => {
        const {dragElement} = this;
        if (!dragElement) {
            event.preventDefault();
            return;
        }
        const {options} = this;
        const {onDragStart} = options;
        if (onDragStart && onDragStart.call(this, event, dragElement) === false) {
            this._clean();
            return;
        }

        const {$element} = this;
        const {target, selector, draggingClass, droppableClass, hasDraggingClass, canDrop} = options;
        if (draggingClass) {
            this.$element.find(draggingClass).removeClass(draggingClass);
            $(dragElement).addClass(draggingClass);
        }

        let $targets = (typeof target === 'function' ? $(target.call(this, dragElement)) : $element.find(target || selector || DROPPABLE_SELECTOR));
        if (canDrop) {
            $targets = $targets.filter((_, ele) => {
                return canDrop.call(this, event, dragElement!, ele) !== false;
            });
        }
        if (!$targets.length) {
            this._clean();
            return;
        }
        if (droppableClass) {
            $element.find(droppableClass).removeClass(droppableClass);
            $targets.addClass(droppableClass);
        }
        if (hasDraggingClass) {
            $element.addClass(hasDraggingClass);
        }
        $element.find(DROPPABLE_SELECTOR).removeAttr('droppable');
        $targets.attr('droppable', 'true');
        this._$targets = $targets;

    };

    protected _setDragEffect(event: DragEvent) {
        const {dropEffect} = this.options;
        if (dropEffect) {
            event.dataTransfer!.dropEffect = dropEffect;
        }
    }

    protected _handleDrag = (event: DragEvent) => {
        const {dragElement} = this;
        if (!dragElement) {
            return;
        }
        this._setDragEffect(event);
        this.options.onDrag?.call(this, event, dragElement);
    };

    protected _handleDragEnd = (event: DragEvent) => {
        const {dragElement} = this;
        if (dragElement) {
            this.options.onDragEnd?.call(this, event, dragElement);
        }
        this._clean();
    };

    protected _handleDragEnter = (event: DragEvent) => {
        this._handleDragOver(event);
    };

    protected _handleDragOver = (event: DragEvent) => {
        const {dragElement} = this;
        const $target = $(event.target as HTMLElement);
        const dropElement = $target.closest(DROPPABLE_SELECTOR)[0];
        if (!dragElement || !dropElement) {
            return;
        }
        const oldDropElement = this.state.dropping;
        event.preventDefault();
        this._setDragEffect(event);
        if (oldDropElement !== dropElement) {
            const {droppingClass} = this.options;
            if (droppingClass) {
                if (oldDropElement) {
                    this._leaveDropElement(event, oldDropElement);
                }
                $(dropElement).addClass(droppingClass);
            }
            this._setState({dropping: dropElement});
            this.options.onDragEnter?.call(this, event, dragElement, dropElement);
        }
        this.options.onDragOver?.call(this, event, dragElement, dropElement);
    };

    protected _leaveDropElement(event: DragEvent, dropElement: HTMLElement) {
        const {droppingClass} = this.options;
        if (droppingClass) {
            $(dropElement).removeClass(droppingClass);
        }
        this.options.onDragLeave?.call(this, event, this.dragElement!, dropElement);
    }

    protected _handleDragLeave = (event: DragEvent) => {
        const {dragElement} = this;
        const dropElement = $(event.target as HTMLElement).filter(DROPPABLE_SELECTOR)[0];
        if (!dragElement || !dropElement) {
            return;
        }
        event.preventDefault();
        this._leaveDropElement(event, dropElement);
        this._setState({dropping: null});
    };

    protected _handleDrop = (event: DragEvent) => {
        const dropTarget = $(event.target as HTMLElement).closest(DROPPABLE_SELECTOR)[0];
        if (dropTarget) {
            event.preventDefault();
            this.options.onDrop?.call(this, event, this.dragElement!, dropTarget);
        }

        this._needClean = true;
        setTimeout(() => {
            if (this._needClean) {
                this._clean();
            }
        }, 50);
    };

    protected _clean() {
        this._needClean = true;

        const {draggingClass, droppableClass, droppingClass, hasDraggingClass} = this.options;
        if (hasDraggingClass) {
            this.$element.removeClass(hasDraggingClass);
        }
        const {dragElement} = this;
        if (dragElement) {
            const $dragElement = $(dragElement);
            if (draggingClass) {
                $dragElement.removeClass(draggingClass);
            }
        }
        this._setState({dropping: null, dragging: null});

        const $targets = this._$targets;
        if ($targets) {
            if (droppableClass) {
                $targets.removeClass(droppableClass);
            }
            if (droppingClass) {
                $targets.removeClass(droppingClass);
            }
            this._$targets = undefined;
        }
    }
}
