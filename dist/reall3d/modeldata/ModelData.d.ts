import { CameraInfo } from '../controls/SetupCameraControls';
import { ModelOptions } from './ModelOptions';
/**
 * spx文件头信息
 */
export declare class SpxHeader {
    Fixed: string;
    Version: number;
    SplatCount: number;
    MinX: number;
    MaxX: number;
    MinY: number;
    MaxY: number;
    MinZ: number;
    MaxZ: number;
    MinTopY: number;
    MaxTopY: number;
    CreateDate: number;
    CreaterId: number;
    ExclusiveId: number;
    ShDegree: number;
    Flag1: number;
    Flag2: number;
    Flag3: number;
    Reserve1: number;
    Reserve2: number;
    Comment: string;
    HashCheck: boolean;
}
/**
 * Splat模型
 */
export declare class SplatModel {
    /** 模型选项 */
    readonly opts: ModelOptions;
    /** 模型文件大小 */
    fileSize: number;
    /** 模型已下载大小 */
    downloadSize: number;
    /** 模型状态 */
    status: ModelStatus;
    /** 模型数据 */
    splatData: Uint8Array;
    /** 模型水印数据 */
    watermarkData: Uint8Array;
    /** 模型数据数量 */
    dataSplatCount: number;
    /** 模型水印数量 */
    watermarkCount: number;
    /** 球谐系数（1级，或1级和2级） */
    Sh12Data: Uint8Array[];
    /** 球谐系数（仅3级） */
    Sh3Data: Uint8Array[];
    /** 一个高斯点数据长度 */
    rowLength: number;
    /** 模型的高斯数量 */
    modelSplatCount: number;
    /** 已下载的高斯数量 */
    downloadSplatCount: number;
    /** 待渲染的高斯数量（大场景时动态计算需要渲染的数量） */
    renderSplatCount: number;
    /** 中断控制器 */
    abortController: AbortController;
    /** spx格式模型的头信息 */
    header: SpxHeader;
    dataShDegree: number;
    meta: MetaData;
    map: Map<string, CutData>;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
    topY: number;
    currentRadius: number;
    notifyFetchStopDone: boolean;
    smallSceneUploadDone: boolean;
    textWatermarkVersion: number;
    lastTextWatermarkVersion: number;
    activePoints: any;
    constructor(opts: ModelOptions, meta?: MetaData);
}
/**
 * 大场景用切割的数据块
 */
export interface CutData {
    /** 块中数据的高斯点数 */
    splatCount?: number;
    /** 块中数据 */
    splatData?: Uint8Array;
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
    minZ?: number;
    maxZ?: number;
    centerX?: number;
    centerY?: number;
    centerZ?: number;
    radius?: number;
    /** 当前待渲染点数（动态计算使用） */
    currentRenderCnt?: number;
    /** 离相机距离（动态计算使用） */
    distance?: number;
}
/**
 * 模型状态
 */
export declare enum ModelStatus {
    /** 就绪 */
    FetchReady = 0,
    /** 请求中 */
    Fetching = 1,
    /** 正常完成 */
    FetchDone = 2,
    /** 请求途中被中断 */
    FetchAborted = 3,
    /** 请求失败 */
    FetchFailed = 4,
    /** 无效的模型格式或数据 */
    Invalid = 5
}
/**
 * 元数据
 */
export interface MetaData {
    /** 名称 */
    name?: string;
    /** 版本 */
    version?: string;
    /** 更新日期（YYYYMMDD） */
    updateDate?: number;
    /** 是否自动旋转 */
    autoRotate?: boolean;
    /** 是否调试模式 */
    debugMode?: boolean;
    /** 是否点云模式 */
    pointcloudMode?: boolean;
    /** 移动端最大渲染数量 */
    maxRenderCountOfMobile?: number;
    /** PC端最大渲染数量 */
    maxRenderCountOfPc?: number;
    /** 移动端最大下载数量 */
    mobileDownloadLimitSplatCount?: number;
    /** PC端最大下载数量 */
    pcDownloadLimitSplatCount?: number;
    /** 米比例尺 */
    meterScale?: number;
    /** 文字水印 */
    watermark?: string;
    /** 相机参数 */
    cameraInfo?: CameraInfo;
    /** 标注 */
    marks?: any[];
    /** 飞翔相机位置点 */
    flyPositions?: number[];
    /** 飞翔相机注视点 */
    flyTargets?: number[];
    /** 自动切割数量 */
    autoCut?: number;
    /** 变换矩阵 */
    transform?: number[];
    /** 模型地址 */
    url?: string;
}
