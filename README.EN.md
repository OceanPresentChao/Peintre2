# Peintre2

一个开箱即用的可配置的轻量级Vue3画板组件。支持多图层、多工具、选择变形图形

<p align='center'>
English | <a href="./README.md">简体中文</a>
</p>

## Features

1. multi layers √
2. change color and line width of tool √
3. geometry tool such as line、rectangle、ellipse √
4. draggable layers √
5. grabbing context √
6. undo、redo √
7. save image √
8. selecting and move、resize elements √
9. optional tool bar mode √

## Live Demo

[Demo](https://oceanpresentchao.github.io/Peintre2/)


## Installation

### With npm

```bash
npm i peintre
pnpm add peintre
```

## Usage

```html
import Painter from "peintre"
import 'peintre/dist/style.css'

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