# 按钮组

## 组件模式

```html:example
<div id="btnGroup"></div>
```

```js
const btnGroup = new BtnGroup('#btnGroup', {
    items: [
        {text: '复制', icon: 'icon-copy'},
        {text: '粘贴', icon: 'icon-paste', disabled: true},
        {text: '剪切'},
        {type: 'heading', text: '更多操作', caret: true},
        {text: '导入', icon: 'icon-upload-alt'},
        {text: '导出', icon: 'icon-download-alt'},
        {text: '保存', icon: 'icon-save', onClick: (event) => console.log('> btnGroupItem.clicked', event)},
    ],
    onClickItem: (info) => {
        console.log('> btnGroup.onClickItem', info);
    },
});
console.log('> btnGroup', btnGroup);
```

## btn-group

```html:example: -flex -gap-3
<div class="btn-group">
  <button type="button" class="btn">左</button>
  <button type="button" class="btn">中</button>
  <button type="button" class="btn">右</button>
</div>
```

## btn-group sizes
```html:example: -flex -gap-3
<div class="btn-group size-xl">
  <button type="button" class="btn">左</button>
  <button type="button" class="btn">中</button>
  <button type="button" class="btn">右</button>
</div>
<div class="btn-group size-lg">
  <button type="button" class="btn">左</button>
  <button type="button" class="btn">中</button>
  <button type="button" class="btn">右</button>
</div>
<div class="btn-group">
  <button type="button" class="btn">左</button>
  <button type="button" class="btn">中</button>
  <button type="button" class="btn">右</button>
</div>
<div class="btn-group size-sm">
  <button type="button" class="btn">左</button>
  <button type="button" class="btn">中</button>
  <button type="button" class="btn">右</button>
</div>
<div class="btn-group size-xs">
  <button type="button" class="btn">左</button>
  <button type="button" class="btn">中</button>
  <button type="button" class="btn">右</button>
</div>
```

## btn-group styles

```html:example: -flex -gap-3
<div class="btn-group">
  <button type="button" class="btn primary">Primary</button>
  <button type="button" class="btn primary">左</button>
  <button type="button" class="btn disabled primary">中</button>
  <button type="button" class="btn primary">右</button>
</div>
<div class="btn-group">
  <button type="button" class="btn primary-outline">Outline</button>
  <button type="button" class="btn primary-outline">左</button>
  <button type="button" class="btn primary-outline">中</button>
  <button type="button" class="btn disabled primary-outline">右</button>
</div>
<div class="btn-group">
  <button type="button" class="btn primary-pale disabled">Pale</button>
  <button type="button" class="btn primary-pale">左</button>
  <button type="button" class="btn primary-pale">中</button>
  <button type="button" class="btn primary-pale">右</button>
</div>
<div class="btn-group">
  <button type="button" class="btn text-primary disabled">Text Primary</button>
  <button type="button" class="btn text-primary">左</button>
  <button type="button" class="btn text-primary">中</button>
  <button type="button" class="btn text-primary">右</button>
</div>
<div class="btn-group">
  <button type="button" class="btn bd-primary">Border Primary</button>
  <button type="button" class="btn bd-primary">左</button>
  <button type="button" class="btn bd-primary">中</button>
  <button type="button" class="btn bd-primary disabled">右</button>
</div>
```

## with dropdown

```html:example: -flex -gap-3
<div class="btn-group">
  <button type="button" class="btn">春天</button>
  <button type="button" class="btn" data-toggle="dropdown"  data-target="#dropdownMenu">未来 <span class="caret"></span></button>
  <button type="button" class="btn">夏天</button>
</div>

<div class="btn-group">
  <button type="button" class="btn">操作</button>
  <button type="button" class="btn" data-toggle="dropdown" data-target="#dropdownMenu"><span class="caret"></span></button>
</div>

<div class="btn-group">
  <button type="button" class="btn">操作</button>
  <button type="button" class="btn" data-toggle="dropdown" data-target="#dropdownMenu"><span class="caret"></span></button>
  <button type="button" class="btn" data-toggle="dropdown" data-target="#dropdownMenu"><span class="caret"></span></button>
  <button type="button" class="btn">操作</button>
</div>

<ul class="dropdown-menu" id="dropdownMenu">
  <li><a href="###">编辑</a></li>
  <li><a href="###">删除</a></li>
  <li class="divider"></li>
  <li><a href="###">撤销</a></li>
</ul>
```
