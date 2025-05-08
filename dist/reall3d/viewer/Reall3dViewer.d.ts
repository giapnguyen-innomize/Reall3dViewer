import { ModelOptions } from '../modeldata/ModelOptions';
import { Reall3dViewerOptions } from './Reall3dViewerOptions';
/**
 * 高斯渲染器
 */
export declare class Reall3dViewer {
    private disposed;
    private splatMesh;
    private events;
    private updateTime;
    needUpdate: boolean;
    constructor(opts?: Reall3dViewerOptions);
    private init;
    /**
     * 允许拖拽本地文件进行渲染
     */
    private enableDropLocalFile;
    /**
     * 刷新
     */
    update(): void;
    fire(n: number, p1?: any, p2?: any): void;
    /**
     * 设定或者获取最新配置项
     * @param opts 配置项
     * @returns 最新配置项
     */
    options(opts?: Reall3dViewerOptions): Reall3dViewerOptions;
    /**
     * 重置
     */
    reset(opts?: Reall3dViewerOptions): void;
    /**
     * 光圈过渡切换显示
     * @returns
     */
    switchDeiplayMode(): void;
    /**
     * 添加场景
     * @param sceneUrl 场景地址
     */
    addScene(sceneUrl: string): Promise<void>;
    /**
     * 添加要渲染的高斯模型（小场景模式）
     * @param urlOpts 高斯模型链接或元数据文件链接或选项
     */
    addModel(urlOpts: string | ModelOptions): Promise<void>;
    /**
     * 根据需要暴露的接口
     */
    private initGsApi;
    /**
     * 销毁渲染器不再使用
     */
    dispose(): void;
}
