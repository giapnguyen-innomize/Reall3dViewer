// ================================
// Copyright (c) 2025 reall3d.com
// ================================
import { GetGaussianText, HttpQueryGaussianText } from '../../events/EventConstants';
import { HalfChars, SplatDataSize32 } from '../../utils/consts/GlobalConstants';
import { parseWordToTexdata } from '../wasm/WasmParser';
export function setupGaussianText(events) {
    const fire = (key, ...args) => events.fire(key, ...args);
    const on = (key, fn, multiFn) => events.on(key, fn, multiFn);
    const halfSet = new Set(HalfChars.split(''));
    on(GetGaussianText, async (text = '', isY = true, isNgativeY = true) => {
        const words = text.trim().substring(0, 100);
        let dataJson = await fire(HttpQueryGaussianText, words); // 限制最多100字
        let wordsJson = [];
        for (let i = 0; i < dataJson.length; i++) {
            let wnums = [];
            let nums = dataJson[i];
            for (let j = 0; j < nums.length; j++) {
                wnums.push([((nums[j] % 20) - 10) * 0.02, (((nums[j] / 20) | 0) - 10) * 0.02]);
            }
            wordsJson.push(wnums);
        }
        let wsize = [];
        let ary = words.split('');
        for (let i = 0; i < ary.length; i++) {
            wsize[i] = halfSet.has(ary[i]) ? 0.22 : 0.4;
        }
        let cnt = (ary.length / 2) | 0;
        let offset = wsize[cnt] / 2;
        let isEven = !(ary.length % 2); // 是否偶数个
        let wOffset = isEven ? 0 : -offset;
        for (let i = cnt - 1; i >= 0; i--) {
            wOffset -= wsize[i] / 2;
            for (let nums of wordsJson[i])
                nums[0] += wOffset;
            wOffset -= wsize[i] / 2;
        }
        offset = wsize[cnt] / 2;
        wOffset = isEven ? 0 : offset;
        for (let i = wordsJson.length - cnt; i < wordsJson.length; i++) {
            wOffset += wsize[i] / 2;
            for (let nums of wordsJson[i])
                nums[0] += wOffset;
            wOffset += wsize[i] / 2;
        }
        let gsCount = 0;
        for (let wordJson of wordsJson) {
            gsCount += wordJson.length;
        }
        const data = new Uint8Array(gsCount * SplatDataSize32);
        let i = 0;
        for (let wordJson of wordsJson) {
            for (let nums of wordJson) {
                data.set(await parseWordToTexdata(nums[0], nums[1], isY, isNgativeY), SplatDataSize32 * i++);
            }
        }
        return data;
    });
}
