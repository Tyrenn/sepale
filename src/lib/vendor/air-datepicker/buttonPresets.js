// @ts-nocheck — vendored code, typed by index.d.ts; not ours to check.
// air-datepicker 3.6.0 (MIT, Timofey Marochkin) — see LICENSE.md and README.md.
export default {
    today: {
        content: dp => dp.locale.today,
        onClick: dp => dp.setViewDate(new Date()),
    },
    clear: {
        content: dp => dp.locale.clear,
        onClick: dp => dp.clear()
    }
};
