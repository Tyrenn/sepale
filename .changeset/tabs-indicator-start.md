---
"@sepale/components": patch
---

The tab indicator no longer jerks when the selection changes. It travelled from the place it was measured at before the change, but a new selection can move the tabs (a heavier weight widens the chosen tab and its neighbours shift): it now first stands, without transition, under the tab it leaves as that tab is laid out now, then travels as the family says. Positions are read to the subpixel (`getBoundingClientRect`) and written on the indicator itself, and on mount the indicator appears in place instead of sliding in from the corner. The family still owns the motion: `--tabs-x/y/w/h` and whatever transition it puts on `.tabs-indicator`.
