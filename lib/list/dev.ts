import 'zui-dev';
import '@zui/icons';
import '@zui/button';
import '@zui/avatar';
import '@zui/checkbox';
import {List, NestedList} from './src/main';

onPageUpdate(() => {
    const remoteNestedList = new NestedList('#remoteNestedList', {
        items: '/lib/list/dev/nested-items.json',
        checkbox: true,
        checkOnClick: 'any',
        selectOnChecked: true,
        defaultNestedShow: {'0:0:1': true},
        activeOnHover: true,
        onCheck: function (changes, checks) {
            console.log('> onCheck', {changes, checks, allChecks: this.getChecks(), list: this});
        },
        onClickItem: (...args) => {
            console.log('>> onClickItem', args);
        },
    });
    console.log('> remoteNestedList', remoteNestedList);

    const remoteNestedList2 = new NestedList('#remoteNestedList2', {
        items: '/lib/list/dev/nested-items-2.json',
        checkbox: true,
        checkOnClick: 'any',
        selectOnChecked: true,
        defaultNestedShow: false,
        activeOnHover: true,
        onCheck: function (changes, checks) {
            console.log('> onCheck', {changes, checks, allChecks: this.getChecks(), list: this});
        },
        onClickItem: (...args) => {
            console.log('>> onClickItem', args);
        },
    });
    console.log('> remoteNestedList2', remoteNestedList2);

    const remoteSimpleList = new List('#remoteSimpleList', {
        checkbox: true,
        checkOnClick: true,
        selectOnChecked: true,
        activeOnHover: true,
        items: '/lib/list/dev/items.json',
    });
    console.log('> remoteSimpleList', remoteSimpleList);

    const items = [
        {
            type: 'heading',
            title: '这是标题',
        },
        {
            type: 'divider',
        },
        {
            title: '研发',
            subtitle: '副标题',
            onClick: () => console.log('click 研发'),
            items: [
                {

                    icon: 'star',
                    title: '大产品',
                    url: '#大产品',
                    items: [
                        {text: '前端', url: '#前端', checked: true},
                        {text: '后端', subtitle: '#后端', checked: true, onClick: () => console.log('click 后端')},
                    ],
                },
                {title: '桌面端'},
                {title: '移动端', checked: true},
                {title: '测试'},
                {title: '运维'},
            ],
        },
        {title: '市场', active: true},
        {title: '技术支持', selected: true},
        {title: '财务'},
        {title: '行政'},
    ];
    const nestedList = new NestedList('#nestedList', {
        items: items,
        checkbox: true,
        checkOnClick: true,
    });
    console.log('> nestedList', nestedList);

    const simpleList = new List('#simpleList', {
        checkbox: true,
        checkOnClick: true,
        items: [
            {text: '文本', onClick: () => console.log('ok')},
            {title: '标题'},
            {type: 'heading', title: 'heading'},
            {type: 'divider'},
            {title: '大标题', subtitle: '副标题'},
            {title: '链接', subtitle: 'https://openzui.com', url: 'https://openzui.com'},
            {title: '超复杂情况', subtitle: '这是副标题', url: 'https://openzui.com', icon: 'star', trailingIcon: 'arrow-right', avatar: {icon: 'flag', className: 'primary'}},
            {title: '超复杂情况', subtitle: '这是副标题', icon: 'star', trailingIcon: 'arrow-right', avatar: {icon: 'flag', className: 'success'}, checked: true, actions: [{icon: 'check'}]},
        ],
    });
    console.log('> simpleList', simpleList);
});
