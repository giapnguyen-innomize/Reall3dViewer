// ================================
// Copyright (c) 2025 reall3d.com
// ================================
export class Events {
    constructor() {
        this.map = new Map();
    }
    on(key, fn = null, multiFn = false) {
        // key不对时，不处理
        if (!key) {
            console.error('Invalid event key', key);
            return null;
        }
        // 无fn时，返回值
        if (!fn)
            return this.map.get(key);
        // 设定为单方法或方法数组（类别冲突时，不处理）
        if (multiFn) {
            // 多处理方法
            let ary = this.map.get(key);
            if (!ary) {
                ary = [];
                this.map.set(key, ary);
                ary.push(fn);
            }
            else if (typeof ary == 'function') {
                console.error('Invalid event type', 'multiFn=true', key);
            }
            else {
                ary.push(fn);
            }
        }
        else {
            // 单处理方法
            let ary = this.map.get(key);
            if (!ary) {
                this.map.set(key, fn);
            }
            else if (typeof ary == 'function') {
                console.warn('Replace event', key);
            }
            else {
                console.error('Invalid event type', 'multiFn=false', key);
            }
        }
        return this.map.get(key);
    }
    fire(key, ...args) {
        const fn = this.map.get(key);
        if (!fn) {
            // this.map.size && console.warn('Undefined event:', key, '(', ...args, ')');
            this.map.size && console.log('Undefined event:', key, '(', ...args, ')');
            return;
        }
        if (typeof fn == 'function') {
            return fn(...args);
        }
        let rs = [];
        fn.forEach(f => rs.push(f(...args)));
        return rs;
    }
    tryFire(key, ...args) {
        return this.map.get(key) ? this.fire(key, ...args) : undefined;
    }
    off(key) {
        this.map.delete(key);
    }
    clear() {
        this.map.clear();
    }
}
export const uiEvent = new Events();
