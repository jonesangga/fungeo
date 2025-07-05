// For quick debugging.
export let __ = console.log;
// __ = () => {};

export type Result<T> =
    | { ok: true,  value: T }
    | { ok: false, error: Error };
