---
"@sepale/components": minor
"@sepale/style": minor
---

DatePicker is now the native field only: the family's Input as a real `<input type="date">` (`datetime-local`, `time`), typed in, with the browser's own picker; its `range`, `format`, `placeholder` and `calendar` props are gone (a range or the family's calendar: Calendar). Every family sizes a date or time field to its content and its picker button. Calendar's field (`inline={false}`) opens in a Dropdown, and Dropdown opens its box as a popover, in the top layer: no ancestor's `z-index`, `overflow` or `transform` covers, crops or moves it any more.
