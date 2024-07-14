# Peintre2

一个开箱即用的可配置的轻量级Vue3画板组件。支持多图层、多工具、选择变形图形

<p align='center'>
 <a href='./README.EN.md'>English</a> |简体中文
</p>

## 特性

1. 多图层 √
2. 可切换画笔颜色、大小 √
3. 图形工具 √
4. 图层拖拽摆放 √
5. 拖拽画布 √
6. 撤销、重做操作 √
7. 保存图形 √
8. 选择、变形图形 √
9. 两种工具栏样式可选 √

## Live Demo

[Demo](https://oceanpresentchao.github.io/Peintre2/)


## Installation

### With npm

```bash
npm i peintre2
```

## Usage

```html
import {Painter} from "peintre2"

<Painter mode="side" :width="800" :height="600" :maxLine="100" :minLine="1"></Painter>

```
## Props

| Attribute  | Description | Type                                          | Default |
| ---------  | ----------- | --------------------------------------------- | ------- |
| width    | canvas width   | number |   800     |
| height    | canvas height   | number |   600     |
| maxLine    | max context line width   | number |   100     |
| minLine    | min context line width   | number |   1     |
| mode    |  mode of tool bar  | 'side' | 'float' |   'side'    |