import {Component, createRef} from 'preact';
import {$} from '@zui/core';
import {KanbanLink} from './kanban-link';

import type {ComponentChild, RenderableProps} from 'preact';
import type {KanbanLinkOptions, KanbanLinksProps, KanbanLinksState} from '../types';

export class KanbanLinks extends Component<KanbanLinksProps, KanbanLinksState> {
    protected _ref = createRef<HTMLDivElement>();

    protected declare _kanban: HTMLElement;

    protected _idSet = new Set<string>();

    protected _raf?: number;

    state: KanbanLinksState = {layout: {}};

    componentDidMount(): void {
        const kanbanElement = this._ref.current?.closest('.kanban') as HTMLElement;
        $(kanbanElement).on('laneColResize.kanban', () => {
            this._tryUpdateLayout();
        });
        this._kanban = kanbanElement;
        this._tryUpdateLayout();
    }

    componentWillUnmount(): void {
        const kanbanElement = this._ref.current?.closest('.kanban');
        if (kanbanElement) {
            $(kanbanElement).off('.kanban');
        }
        if (this._raf) {
            cancelAnimationFrame(this._raf);
        }
    }

    componentDidUpdate(previousProps: Readonly<KanbanLinksProps>): void {
        if (previousProps.links !== this.props.links || previousProps.filters !== this.props.filters) {
            this._tryUpdateLayout();
        }
    }

    _tryUpdateLayout() {
        if (this._raf) {
            cancelAnimationFrame(this._raf);
        }
        this._raf = requestAnimationFrame(() => {
            this._updateLayout();
            this._raf = 0;
        });
    }

    _updateLayout() {
        const idSet = [...this._idSet];
        const $kanban = $(this._kanban).find('.kanban-body');
        const {top: offsetTop, left: offsetLeft} = this._kanban.getBoundingClientRect();
        const layout: KanbanLinksState['layout'] = {};
        idSet.forEach(id => {
            const element = $kanban.find(`.kanban-item[z-key="${id}"]`).children()[0];
            if (element) {
                const {top, left, bottom, right} = element.getBoundingClientRect();
                layout[id] = {top: top - offsetTop, left: left - offsetLeft, bottom: bottom - offsetTop, right: right - offsetLeft};
            }
        });
        this.setState({layout});
    }

    _renderLink(link: KanbanLinkOptions) {
        const {layout} = this.state;
        const {from, to} = link;
        const fromReact = layout[from];
        const toRect = layout[to];
        this._idSet.add(from);
        this._idSet.add(to);
        if (!fromReact || !toRect) {
            return null;
        }
        return (
            <KanbanLink key={`${from}-${to}`} {...link} fromRect={fromReact} toRect={toRect} onDelete={this.props.onDeleteLink} />
        );
    }

    _renderLinks(props: RenderableProps<KanbanLinksProps>) {
        const {links, filters} = props;
        const excludeSet = new Set(filters);
        return links.reduce((list, link) => {
            if (filters && (!excludeSet.has(link.from) && !excludeSet.has(link.to) && !excludeSet.has(`${link.from}-${link.to}`))) {
                return list;
            }
            const result = this._renderLink(link);
            if (result) {
                list.push(result);
            }
            return list;
        }, [] as ComponentChild[]);
    }

    render(props: RenderableProps<KanbanLinksProps>) {
        this._idSet.clear();
        return (
            <div className="kanban-links" ref={this._ref}>
                {this._renderLinks(props)}
            </div>
        );
    }
}
