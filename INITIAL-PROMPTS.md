# Initial Development Prompts

This document contains the first three prompts used to start this project. The initial planning was done with **Claude 4.5**, and all subsequent development was completed using **Cursor Auto mode**.

---

## Prompt 1: Project Foundation

**Live on:** [typing.kyd.net](https://typing.kyd.net)

```
live on: typing.kyd.net 

You need to create a dot cursor rules file with the absolute bare minimum and it will be basically saying that you are running PHP 5.6 don't do?? Create a index.Php it catches anything within this URL so you can make beautiful URLs. It needs to be refactored it needs to be using libraries to really reduce the overall code length that's first and foremost anything that will reduce code length should be used. This app is a typing app It will be a web based typing app a keyboarding app to see how fast you type the full data storage will be local storage very simple The whole database will be AJSON array. It will be in a separate file so we're talking about three files index.Php which just shows basic CSS which will be included that'll be the second file index.css and main.js 

.json is extensible, autoloads until level1.json->level100.json till js sees one not load.. only do level1.json for now... 

save stats, WPM, easy clear settings.. show words scrolling across on screen as you enter the paragraph.... should start with really fully tech memes to type that are based on tech facts.. like bill gates backstory, microsoft facts, nvidia, google, sergey guitar, anything 

make index45.php and index45.css and index45.js
```

---

## Prompt 2: Share Feature & Documentation

```
There needs to be a share button that pops a really simple modal that uses an existing library for like literally bare minimum but it needs to be able to show a copy link directly to copy the current URL that you're at and then it would be cool if it also shared some sort of dynamic stat page With like the test level you're on and your WPM and ACC just any other important data like the current date on your computer is probably important. There should I feel be a better utilization of the time it took you to run the test as well right now it kind of starts and stops as you're entering words per minute and dealing with accuracy which I think is OK but it could be better 

I think the greatest thing you do right now is that it actually works like the UI looks pretty damn good and it's responsive and listening to what I'm doing and it turns green with where you're at like it's got a really good understanding. You should create a: readme45.md Which simply explains everything in this app as compactly and concisely as humanly possible so that I know how to add edit and debug this in the future what commands to run what it output to expect. Bare minimum.
```

---

## Prompt 3: Accuracy Improvements & Error Handling

```
You should get 100 percent accuracy if you enter the lowercase version of the requested letter it needs to be a little more lenient and if you hit the delete backspace button it needs to shake the card div, or something, indentifying a haptic error simply.. like error("msg") 

which calls @j oe-helper-v1.js.md toast() with error msg
```

---

## About Joe Helper Library

The project uses the **Joe Helper v1.1** JavaScript utility library, which provides:

- **Storage Methods**: `setItem()`, `getItem()`, `removeItem()`, `clear()`
- **Toast Notifications**: `toast(message, type, options)` for user feedback
- **Data Attributes**: Auto-initialized countdown timers, typewriter effects, tooltips
- **Utility Methods**: `copyToClipboard()`, `getUrlParam()`, `formatTime()`, and more

The library is loaded from:
```html
<script src="https://beta.fishwrangler.com/_ai/joe-helper-v1.js"></script>
```

For full documentation, see the [Joe Helper v1.1 documentation](.notepads/j%20oe-helper-v1.js.md).

---

*These prompts represent the initial vision and requirements for the typing speed test application. All implementation was completed using Cursor Auto mode after these initial prompts.*
