// ================================
// Copyright (c) 2025 reall3d.com
// ================================
import { SplatDataSize20, SplatDataSize32, MobileDownloadLimitSplatCount, PcDownloadLimitSplatCount, isMobile, SpxHeaderSize, SpxOpenFormat0, SpxExclusiveFormatReall3d, } from '../../utils/consts/GlobalConstants';
import { parseSpxBlockData, parseSpxHeader } from '../wasm/WasmParser';
import { ModelStatus } from '../ModelData';
import { unGzip } from '../../utils/CommonUtils';
/** Specify the Recognizable Formats Here */
const ExclusiveFormats = [SpxOpenFormat0, SpxExclusiveFormatReall3d];
export async function loadSpx(model) {
    try {
        model.status = ModelStatus.Fetching;
        const signal = model.abortController.signal;
        const cache = model.opts.fetchReload ? 'reload' : 'default';
        const req = await fetch(model.opts.url, { mode: 'cors', credentials: 'omit', cache, signal });
        if (req.status != 200) {
            console.warn(`fetch error: ${req.status}`);
            model.status === ModelStatus.Fetching && (model.status = ModelStatus.FetchFailed);
            return;
        }
        const reader = req.body.getReader();
        const contentLength = parseInt(req.headers.get('content-length') || '0');
        const dataSize = contentLength - SpxHeaderSize;
        if (dataSize < SplatDataSize20) {
            console.warn('data empty', model.opts.url);
            model.status === ModelStatus.Fetching && (model.status = ModelStatus.Invalid);
            return;
        }
        model.fileSize = contentLength;
        // let rowLength: number;
        let headChunks = [];
        let headChunk = new Uint8Array(SpxHeaderSize);
        let perValue = new Uint8Array(SplatDataSize32);
        let perByteLen = 0;
        let readBlockSize = false;
        let blockSize = 0;
        let fetchedBlockSize = 0;
        let blockValues;
        let isGzip = false;
        while (true) {
            let { done, value } = await reader.read();
            if (done)
                break;
            model.downloadSize += value.byteLength;
            if (headChunks) {
                headChunks.push(value);
                let size = 0;
                for (let i = 0; i < headChunks.length; i++) {
                    size += headChunks[i].byteLength;
                }
                if (size < SpxHeaderSize) {
                    continue;
                }
                let cnt = 0;
                for (let i = 0; i < headChunks.length; i++) {
                    if (cnt + headChunks[i].byteLength < SpxHeaderSize) {
                        headChunk.set(headChunks[i], cnt);
                        cnt += headChunks[i].byteLength;
                    }
                    else {
                        headChunk.set(headChunks[i].slice(0, SpxHeaderSize - cnt), cnt);
                        value = new Uint8Array(headChunks[i].slice(SpxHeaderSize - cnt));
                    }
                }
                // 解析头数据
                const header = await parseSpxHeader(headChunk);
                if (!header) {
                    model.abortController.abort();
                    model.status === ModelStatus.Fetching && (model.status = ModelStatus.Invalid);
                    console.error(`invalid spx format`);
                    continue;
                }
                model.header = header;
                model.modelSplatCount = header.SplatCount;
                model.dataShDegree = header.ShDegree;
                headChunks = null;
                headChunk = null;
                // 文件头检查校验
                if (!ExclusiveFormats.includes(header.ExclusiveId)) {
                    // 属于无法识别的格式时停止处理，或者进一步结合CreaterId判断是否能识别，避免后续出现数据解析错误
                    model.abortController.abort();
                    model.status = ModelStatus.Invalid;
                    console.error(`Unrecognized format, creater id =`, header.CreaterId, ', exclusive id =', header.ExclusiveId, header.Comment);
                    continue;
                }
            }
            // 读取块大小
            if (!readBlockSize) {
                if (perByteLen + value.byteLength < 4) {
                    perValue.set(value, perByteLen);
                    perByteLen += value.byteLength;
                    continue;
                }
                const ui8s = new Uint8Array(perByteLen + value.byteLength);
                ui8s.set(perValue.slice(0, perByteLen), 0);
                ui8s.set(value, perByteLen);
                value = ui8s.slice(4);
                perByteLen = 0;
                readBlockSize = true;
                blockValues = [];
                fetchedBlockSize = 0;
                const i32s = new Int32Array(ui8s.slice(0, 4).buffer);
                isGzip = i32s[0] < 0; // 负数代表压缩
                blockSize = Math.abs(i32s[0]); // 绝对值代表块大小
            }
            // 块数据不足时，暂存
            let totalSize = fetchedBlockSize + value.byteLength;
            blockValues.push(value);
            if (totalSize < blockSize) {
                fetchedBlockSize += value.byteLength;
                continue;
            }
            // 解析块数据
            while (totalSize >= blockSize) {
                let ui8sBlock = new Uint8Array(blockSize);
                let offset = 0;
                for (let i = 0; i < blockValues.length; i++) {
                    if (offset + blockValues[i].byteLength < blockSize) {
                        ui8sBlock.set(blockValues[i], offset);
                        offset += blockValues[i].byteLength;
                    }
                    else {
                        ui8sBlock.set(blockValues[i].slice(0, blockSize - offset), offset);
                        value = new Uint8Array(blockValues[i].slice(blockSize - offset)); // 剩余部分，可能足够长包含多块
                    }
                }
                // 解析块数据
                isGzip && (ui8sBlock = await unGzip(ui8sBlock));
                const spxBlock = await parseSpxBlockData(ui8sBlock);
                if (!spxBlock.success) {
                    console.error('spx block data parser failed. block format:', spxBlock.blockFormat);
                    model.abortController.abort();
                    model.status = ModelStatus.Invalid;
                    break;
                }
                if (spxBlock.isSplat) {
                    model.downloadSplatCount += spxBlock.datas.byteLength / 32;
                    setBlockSplatData(model, spxBlock.datas);
                }
                else if (spxBlock.isSh) {
                    spxBlock.isSh3 ? model.Sh3Data.push(spxBlock.datas) : model.Sh12Data.push(spxBlock.datas);
                }
                if (value.byteLength < 4) {
                    // 剩余不足以读取下一个块长度，缓存起来待继续下载
                    perValue.set(value, 0);
                    perByteLen = value.byteLength;
                    readBlockSize = false; // 下回应读取块大小
                    break;
                }
                else {
                    // 读取块大小，并整理供继续解析（剩余数据要么还足够多个块，要么不足得继续下载）
                    const i32s = new Int32Array(value.slice(0, 4).buffer);
                    blockSize = Math.abs(i32s[0]);
                    isGzip = i32s[0] < 0;
                    value = value.slice(4);
                    totalSize = value.byteLength;
                    blockValues = [value];
                    fetchedBlockSize = value.byteLength;
                }
            }
            // 超过限制时终止下载
            const pcDownloadLimitCount = model.meta.pcDownloadLimitSplatCount || PcDownloadLimitSplatCount;
            const mobileDownloadLimitCount = model.meta.mobileDownloadLimitSplatCount || MobileDownloadLimitSplatCount;
            const downloadLimitSplatCount = isMobile ? mobileDownloadLimitCount : pcDownloadLimitCount;
            const isSmallSceneLimit = !model.meta?.autoCut && model.downloadSplatCount >= model.opts.downloadLimitSplatCount;
            const isLargeSceneLimit = model.meta?.autoCut && model.downloadSplatCount >= downloadLimitSplatCount;
            (isSmallSceneLimit || isLargeSceneLimit) && model.abortController.abort();
        }
    }
    catch (e) {
        if (e.name === 'AbortError') {
            console.log('Fetch Abort', model.opts.url);
            model.status === ModelStatus.Fetching && (model.status = ModelStatus.FetchAborted);
        }
        else {
            console.error(e);
            model.status === ModelStatus.Fetching && (model.status = ModelStatus.FetchFailed);
            model.abortController.abort();
        }
    }
    finally {
        model.status === ModelStatus.Fetching && (model.status = ModelStatus.FetchDone);
    }
}
function setBlockSplatData(model, data) {
    let isCut = !!model.meta.autoCut;
    let dataCnt = data.byteLength / 32;
    const stepCnt = 4096;
    if (!isCut) {
        const maxSplatDataCnt = Math.min(model.opts.downloadLimitSplatCount, model.modelSplatCount);
        !model.splatData && (model.splatData = new Uint8Array(maxSplatDataCnt * SplatDataSize32));
        !model.watermarkData && (model.watermarkData = new Uint8Array(0));
        if (model.dataSplatCount + dataCnt > maxSplatDataCnt) {
            dataCnt = maxSplatDataCnt - model.dataSplatCount; // 丢弃超出限制的部分
        }
        // 计算当前半径
        const f32s = new Float32Array(data.buffer);
        const ui32s = new Uint32Array(data.buffer);
        for (let i = 0, x = 0, y = 0, z = 0; i < dataCnt; i++) {
            x = f32s[i * 8];
            y = f32s[i * 8 + 1];
            z = f32s[i * 8 + 2];
            model.minX = Math.min(model.minX, x);
            model.maxX = Math.max(model.maxX, x);
            model.minY = Math.min(model.minY, y);
            model.maxY = Math.max(model.maxY, y);
            model.minZ = Math.min(model.minZ, z);
            model.maxZ = Math.max(model.maxZ, z);
            if (ui32s[i * 8 + 3] >> 16) {
                if (model.watermarkCount * SplatDataSize32 === model.watermarkData.byteLength) {
                    const watermarkData = new Uint8Array((model.watermarkCount + stepCnt) * SplatDataSize32);
                    watermarkData.set(model.watermarkData, 0);
                    model.watermarkData = watermarkData;
                }
                model.watermarkData.set(data.slice(i * 32, i * 32 + 32), model.watermarkCount++ * SplatDataSize32);
            }
            else {
                model.splatData.set(data.slice(i * 32, i * 32 + 32), model.dataSplatCount++ * SplatDataSize32);
            }
        }
        const topY = model.header.MinTopY || 0;
        model.currentRadius = Math.sqrt(model.maxX * model.maxX + topY * topY + model.maxZ * model.maxZ); // 当前模型数据范围离高点的最大半径
        return;
    }
    // 以下大场景需切割
    let autoCut = Math.min(Math.max(model.meta.autoCut, 2), 50); // 按推荐参数切，检查纠正在2~50区间（4~2500块）
    !model.watermarkData && (model.watermarkData = new Uint8Array(0));
    const f32s = new Float32Array(data.buffer);
    const ui32s = new Uint32Array(data.buffer);
    for (let i = 0, count = Math.floor(data.byteLength / SplatDataSize32), x = 0, y = 0, z = 0, key = ''; i < count; i++) {
        if (ui32s[i * 8 + 3] >> 16) {
            if (model.watermarkCount * SplatDataSize32 === model.watermarkData.byteLength) {
                const watermarkData = new Uint8Array((model.watermarkCount + stepCnt) * SplatDataSize32);
                watermarkData.set(model.watermarkData, 0);
                model.watermarkData = watermarkData;
            }
            model.watermarkData.set(data.slice(i * 32, i * 32 + 32), model.watermarkCount++ * SplatDataSize32);
            continue;
        }
        x = f32s[i * 8];
        y = f32s[i * 8 + 1];
        z = f32s[i * 8 + 2];
        let kx = Math.min(autoCut - 1, Math.floor((Math.max(0, x - model.header.MinX) / (model.header.MaxX - model.header.MinX)) * autoCut));
        let kz = Math.min(autoCut - 1, Math.floor((Math.max(0, z - model.header.MinZ) / (model.header.MaxZ - model.header.MinZ)) * autoCut));
        key = `${kx}-${kz}`;
        let cut = model.map.get(key);
        if (!cut) {
            cut = {};
            cut.minX = x;
            cut.maxX = x;
            cut.minY = y;
            cut.maxY = y;
            cut.minZ = z;
            cut.maxZ = z;
            cut.centerX = x;
            cut.centerY = y;
            cut.centerZ = z;
            cut.radius = 0;
            cut.splatData = new Uint8Array(stepCnt * SplatDataSize32);
            cut.splatData.set(data.slice(i * SplatDataSize32, i * SplatDataSize32 + SplatDataSize32), 0);
            cut.splatCount = 1;
            model.map.set(key, cut);
        }
        else {
            // 检查扩容
            if (cut.splatData.byteLength / SplatDataSize32 == cut.splatCount) {
                const splatData = new Uint8Array(cut.splatData.byteLength + stepCnt * SplatDataSize32);
                splatData.set(cut.splatData, 0);
                cut.splatData = splatData;
            }
            cut.minX = Math.min(cut.minX, x);
            cut.maxX = Math.max(cut.maxX, x);
            cut.minY = Math.min(cut.minY, y);
            cut.maxY = Math.max(cut.maxY, y);
            cut.minZ = Math.min(cut.minZ, z);
            cut.maxZ = Math.max(cut.maxZ, z);
            cut.centerX = (cut.maxX + cut.minX) / 2;
            cut.centerY = (cut.maxY + cut.minY) / 2;
            cut.centerZ = (cut.maxZ + cut.minZ) / 2;
            const sizeX = cut.maxX - cut.minX;
            const sizeY = cut.maxY - cut.minY;
            const sizeZ = cut.maxZ - cut.minZ;
            cut.radius = Math.sqrt(sizeX * sizeX + sizeY * sizeY + sizeZ * sizeZ) / 2;
            cut.splatData.set(data.slice(i * SplatDataSize32, i * SplatDataSize32 + SplatDataSize32), cut.splatCount++ * SplatDataSize32);
        }
        model.dataSplatCount++;
    }
}
