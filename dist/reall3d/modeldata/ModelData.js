/**
 * spx文件头信息
 */
export class SpxHeader {
}
/**
 * Splat模型
 */
export class SplatModel {
    constructor(opts, meta = {}) {
        /** 模型文件大小 */
        this.fileSize = 0;
        /** 模型已下载大小 */
        this.downloadSize = 0;
        /** 模型状态 */
        this.status = ModelStatus.FetchReady;
        /** 模型数据 */
        this.splatData = null;
        /** 模型水印数据 */
        this.watermarkData = null;
        /** 模型数据数量 */
        this.dataSplatCount = 0;
        /** 模型水印数量 */
        this.watermarkCount = 0;
        /** 球谐系数（1级，或1级和2级） */
        this.Sh12Data = [];
        /** 球谐系数（仅3级） */
        this.Sh3Data = [];
        /** 一个高斯点数据长度 */
        this.rowLength = 0;
        /** 模型的高斯数量 */
        this.modelSplatCount = -1;
        /** 已下载的高斯数量 */
        this.downloadSplatCount = 0;
        /** 待渲染的高斯数量（大场景时动态计算需要渲染的数量） */
        this.renderSplatCount = 0;
        /** spx格式模型的头信息 */
        this.header = null;
        this.dataShDegree = 0;
        this.minX = Infinity;
        this.maxX = -Infinity;
        this.minY = Infinity;
        this.maxY = -Infinity;
        this.minZ = Infinity;
        this.maxZ = -Infinity;
        this.topY = 0;
        this.currentRadius = 0;
        this.textWatermarkVersion = 0;
        this.lastTextWatermarkVersion = 0;
        this.opts = { ...opts };
        this.meta = meta;
        meta.autoCut && (this.map = new Map());
        if (!opts.format) {
            if (opts.url?.endsWith('.spx')) {
                this.opts.format = 'spx';
            }
            else if (opts.url?.endsWith('.splat')) {
                this.opts.format = 'splat';
            }
            else if (opts.url?.endsWith('.ply')) {
                this.opts.format = 'ply';
            }
            else {
                console.error('unknow format!');
            }
        }
        this.abortController = new AbortController();
    }
}
/**
 * 模型状态
 */
export var ModelStatus;
(function (ModelStatus) {
    /** 就绪 */
    ModelStatus[ModelStatus["FetchReady"] = 0] = "FetchReady";
    /** 请求中 */
    ModelStatus[ModelStatus["Fetching"] = 1] = "Fetching";
    /** 正常完成 */
    ModelStatus[ModelStatus["FetchDone"] = 2] = "FetchDone";
    /** 请求途中被中断 */
    ModelStatus[ModelStatus["FetchAborted"] = 3] = "FetchAborted";
    /** 请求失败 */
    ModelStatus[ModelStatus["FetchFailed"] = 4] = "FetchFailed";
    /** 无效的模型格式或数据 */
    ModelStatus[ModelStatus["Invalid"] = 5] = "Invalid";
})(ModelStatus || (ModelStatus = {}));
