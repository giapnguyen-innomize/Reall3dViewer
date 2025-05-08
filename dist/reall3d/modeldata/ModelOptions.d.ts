/**
 * 高斯模型选项
 */
export interface ModelOptions {
    /**
     *  模型地址
     */
    url: string;
    /**
     *  模型格式（ply | splat | spx），默认自动识别
     */
    format?: 'ply' | 'splat' | 'spx';
    /**
     *  是否重新下载
     */
    fetchReload?: boolean;
    /**
     *  限制高斯点数
     */
    downloadLimitSplatCount?: number;
}
