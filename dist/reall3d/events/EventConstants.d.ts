/** 帧率循环调用 */
export declare const RunLoopByFrame: number;
/** 定时循环调用 */
export declare const RunLoopByTime: number;
/** 提交元数据到服务器 */
export declare const HttpPostMetaData: number;
/** 取文本高斯数据 */
export declare const HttpQueryGaussianText: number;
/** 计算平面中心点 */
export declare const ComputePlansCenter: number;
/** 计算多个平面的面积 */
export declare const ComputePlansArea: number;
/** 按数据重新计算多个平面的面积 */
export declare const ReComputePlansArea: number;
/** 计算三角面的面积 */
export declare const ComputePoint3Area: number;
/** 取得相关对象 */
export declare const GetWorker: number;
/** 取得相关对象 */
export declare const GetCanvas: number;
/** 取得相关对象 */
export declare const GetCamera: number;
/** 取得相关对象 */
export declare const GetControls: number;
/** 取得当前相机参数信息 */
export declare const GetCameraInfo: number;
/** 设定相机视点 */
export declare const CameraSetLookAt: number;
/** 取相机视点 */
export declare const GetCameraLookAt: number;
/** 取相机上向量 */
export declare const GetCameraLookUp: number;
/** 取相机位置 */
export declare const GetCameraPosition: number;
/** 取相机Fov */
export declare const GetCameraFov: number;
/** 控制器更新 */
export declare const ControlsUpdate: number;
/** 控制器更新旋转轴 */
export declare const ControlsUpdateRotateAxis: number;
/** 取视图投影矩阵数组 */
export declare const GetViewProjectionMatrixArray: number;
/** 取视图投影矩阵 */
export declare const GetViewProjectionMatrix: number;
/** 排序 */
export declare const WorkerSort: number;
/** 销毁 */
export declare const WorkerDispose: number;
/** 销毁 */
export declare const EventListenerDispose: number;
/** 编码 base64 */
export declare const EncodeBase64: number;
/** 解码 base64 */
export declare const DecodeBase64: number;
/** 开始自动旋转 */
export declare const StartAutoRotate: number;
/** 停止自动旋转 */
export declare const StopAutoRotate: number;
/** 加载模型开始 */
export declare const LoaderModelStart: number;
/** 渲染信息 */
export declare const Information: number;
/** 当前时点限制渲染的的高斯点数(包含了附加的动态文字水印数) */
export declare const GetMaxRenderCount: number;
/** 渲染帧率 */
export declare const ComputeFps: number;
/** Splat全局变量 */
export declare const CreateSplatUniforms: number;
/** Splat几何体 */
export declare const CreateSplatGeometry: number;
/** Splat材质 */
export declare const CreateSplatMaterial: number;
/** Splat网格 */
export declare const CreateSplatMesh: number;
/** 取Splat几何体 */
export declare const GetSplatGeometry: number;
/** 取Splat材质 */
export declare const GetSplatMaterial: number;
/** Splat更新焦距 */
export declare const SplatUpdateFocal: number;
/** Splat更新视口 */
export declare const SplatUpdateViewport: number;
/** Splat更新索引缓冲数据 */
export declare const SplatUpdateSplatIndex: number;
/** Splat更新纹理 */
export declare const SplatUpdateTexture: number;
/** Splat更新使用中索引 */
export declare const SplatUpdateUsingIndex: number;
/** Splat更新点云模式 */
export declare const SplatUpdatePointMode: number;
/** Splat更新场景模式 */
export declare const SplatUpdateBigSceneMode: number;
/** Splat更新亮度系数 */
export declare const SplatUpdateLightFactor: number;
/** Splat更新中心高点 */
export declare const SplatUpdateTopY: number;
/** Splat更新可见半径 */
export declare const SplatUpdateCurrentVisibleRadius: number;
/** Splat更新光圈半径 */
export declare const SplatUpdateCurrentLightRadius: number;
/** Splat更新标记点 */
export declare const SplatUpdateMarkPoint: number;
/** Splat更新系统时间 */
export declare const SplatUpdatePerformanceNow: number;
/** Splat更新水印显示与否 */
export declare const SplatUpdateShowWaterMark: number;
/** Splat更新调试效果 */
export declare const SplatUpdateDebugEffect: number;
/** Splat更新球谐系数级别 */
export declare const SplatUpdateShDegree: number;
/** Splat几何体销毁 */
export declare const SplatGeometryDispose: number;
/** Splat材质销毁 */
export declare const SplatMaterialDispose: number;
/** 默认渲染帧率计数器更新 */
export declare const CountFpsDefault: number;
/** 默认渲染帧率 */
export declare const GetFpsDefault: number;
/** 真实渲染帧率计数器更新 */
export declare const CountFpsReal: number;
/** 真实渲染帧率 */
export declare const GetFpsReal: number;
/** 销毁 */
export declare const ViewerUtilsDispose: number;
/** 销毁 */
export declare const CommonUtilsDispose: number;
/** 取得渲染器选项 */
export declare const GetOptions: number;
/** 画布尺寸 */
export declare const GetCanvasSize: number;
/** 取渲染器 */
export declare const GetRenderer: number;
/** 取场景 */
export declare const GetScene: number;
/** 渲染器销毁 */
export declare const ViewerDispose: number;
/** 是否相机视角发生变化需要渲染 */
export declare const IsCameraChangedNeedUpdate: number;
/** 是否相机视角发生变化需要重新加载数据 */
export declare const IsCameraChangedNeedLoadData: number;
/** 是否大场景模式 */
export declare const IsBigSceneMode: number;
/** 是否点云模式 */
export declare const IsPointcloudMode: number;
/** 是否调试模式 */
export declare const IsDebugMode: number;
/** 添加模型 */
export declare const SplatTexdataManagerAddModel: number;
/** 数据是否有变化（大场景用） */
export declare const SplatTexdataManagerDataChanged: number;
/** 销毁 */
export declare const SplatTexdataManagerDispose: number;
/** 销毁 */
export declare const SplatMeshDispose: number;
/** 切换显示模式（通常仅小场景使用） */
export declare const SplatMeshSwitchDisplayMode: number;
/** 小场景渐进加载（圆圈扩大） */
export declare const SplatMeshCycleZoom: number;
/** 转字符串 */
export declare const Vector3ToString: number;
/** 模型文件下载开始 */
export declare const OnFetchStart: number;
/** 模型文件下载中 */
export declare const OnFetching: number;
/** 模型文件下载结束 */
export declare const OnFetchStop: number;
/** 是否加载中（小场景适用） */
export declare const IsFetching: number;
/** 数据上传就绪的渲染数（小场景适用） */
export declare const OnTextureReadySplatCount: number;
/** 数据是否已下载结束并准备就绪（小场景适用） */
export declare const IsSmallSceneRenderDataReady: number;
/** 是否可以更新纹理 */
export declare const CanUpdateTexture: number;
/** 检查执行键盘按键动作处理 */
export declare const KeyActionCheckAndExecute: number;
/** 视线轴旋转 */
export declare const RotateAt: number;
/** 视线轴左旋 */
export declare const RotateLeft: number;
/** 视线轴右旋 */
export declare const RotateRight: number;
/** 取活动点数据 */
export declare const GetSplatActivePoints: number;
/** 射线拾取点 */
export declare const RaycasterRayIntersectPoints: number;
/** 射线与点的距离 */
export declare const RaycasterRayDistanceToPoint: number;
/** 调整视点为拾取点 */
export declare const SelectPointAndLookAt: number;
/** 标注选点 */
export declare const SelectMarkPoint: number;
/** 清除标注选点 */
export declare const ClearMarkPoint: number;
/** 创建焦点标记网格 */
export declare const CreateFocusMarkerMesh: number;
/** 取焦点标记材质 */
export declare const GetFocusMarkerMaterial: number;
/** 刷新焦点标记网格 */
export declare const FocusMarkerMeshUpdate: number;
/** 焦点标记材质设定透明度 */
export declare const FocusMarkerMaterialSetOpacity: number;
/** 焦点标记自动消失 */
export declare const FocusMarkerMeshAutoDisappear: number;
/** 焦点标记销毁 */
export declare const FocusMarkerMeshDispose: number;
/** 控制平面 */
export declare const GetControlPlane: number;
/** 控制平面显示控制 */
export declare const ControlPlaneSwitchVisible: number;
/** 控制平面刷新 */
export declare const ControlPlaneUpdate: number;
/** 控制平面是否可见 */
export declare const IsControlPlaneVisible: number;
/** 渲染前处理 */
export declare const OnViewerBeforeUpdate: number;
/** 渲染处理 */
export declare const OnViewerUpdate: number;
/** 渲染后处理 */
export declare const OnViewerAfterUpdate: number;
/** 设定水印文字 */
export declare const OnSetWaterMark: number;
/** 取当前缓存的水印文字 */
export declare const GetCachedWaterMark: number;
/** 通知渲染器需要刷新 */
export declare const NotifyViewerNeedUpdate: number;
/** 通知渲染器需要刷新 */
export declare const ViewerNeedUpdate: number;
/** 更新渲染器选项的点云模式 */
export declare const ViewerSetPointcloudMode: number;
/** 渲染器检查是否需要刷新 */
export declare const ViewerCheckNeedUpdate: number;
/** 渲染器设定Splat点云模式 */
export declare const SplatSetPointcloudMode: number;
/** 渲染器切换Splat显示模式 */
export declare const SplatSwitchDisplayMode: number;
/** 取标注包裹元素 */
export declare const GetMarkWarpElement: number;
/** 取CSS3DRenderer */
export declare const GetCSS3DRenderer: number;
/** 销毁 */
export declare const CSS3DRendererDispose: number;
/** 添加标注弱引用缓存 */
export declare const AddMarkToWeakRef: number;
/** 从弱引用缓存取标注对象 */
export declare const GetMarkFromWeakRef: number;
/** 删除标注弱引用缓存 */
export declare const DeleteMarkWeakRef: number;
/** 按数据更新指定名称的标注 */
export declare const UpdateMarkByName: number;
/** 按米比例尺更新全部标注 */
export declare const UpdateAllMarkByMeterScale: number;
/** 按名称取标注数据 */
export declare const GetMarkDataByName: number;
/** 标注点 */
export declare const MarkPoint: number;
/** 标注线 */
export declare const MarkLine: number;
/** 标注面 */
export declare const MarkPlan: number;
/** 标注距离 */
export declare const MarkDistance: number;
/** 标注面积 */
export declare const MarkArea: number;
/** 标注结束 */
export declare const MarkFinish: number;
/** 标注更新可见状态 */
export declare const MarkUpdateVisible: number;
/** 标注数据保存 */
export declare const MetaMarkSaveData: number;
/** 保存小场景相机信息 */
export declare const MetaSaveSmallSceneCameraInfo: number;
/** 标注数据删除 */
export declare const MetaMarkRemoveData: number;
/** 保存水印 */
export declare const MetaSaveWatermark: number;
/** 加载小场景元数据(相机初始化，标注待激活显示) */
export declare const LoadSmallSceneMetaData: number;
/** 遍历销毁并清空Object3D的子对象 */
export declare const TraverseDisposeAndClear: number;
/** 取消当前正在进行的标注 */
export declare const CancelCurrentMark: number;
/** 取高斯文本 */
export declare const GetGaussianText: number;
/** 设定高斯文本 */
export declare const SetGaussianText: number;
/** 取相机飞行轨迹 */
export declare const GetFlyPositions: number;
/** 取相机飞行轨迹（数组形式，用于存盘） */
export declare const GetFlyPositionArray: number;
/** 取相机飞行视点轨迹（数组形式，用于存盘） */
export declare const GetFlyTargetArray: number;
/** 添加相机飞行轨迹点 */
export declare const AddFlyPosition: number;
/** 保存相机飞行轨迹点 */
export declare const FlySavePositions: number;
/** 清空相机飞行轨迹点 */
export declare const ClearFlyPosition: number;
/** 设定相机飞行轨迹 */
export declare const OnSetFlyPositions: number;
/** 设定相机飞行视点轨迹 */
export declare const OnSetFlyTargets: number;
/** 相机飞行控制 */
export declare const Flying: number;
/** 相机飞行控制(仅一次) */
export declare const FlyOnce: number;
/** 允许相机飞行控制 */
export declare const FlyEnable: number;
/** 禁止相机飞行控制 */
export declare const FlyDisable: number;
/** 取SplatMesh实例 */
export declare const GetSplatMesh: number;
/** 打印信息（开发调试用） */
export declare const PrintInfo: number;
/** 上传纹理 */
export declare const UploadSplatTexture: number;
/** 上传纹理完成 */
export declare const UploadSplatTextureDone: number;
/** 球谐系数纹理高度 */
export declare const GetShTexheight: number;
/** Splat更新球谐系数纹理(1,2级) */
export declare const SplatUpdateSh12Texture: number;
/** Splat更新球谐系数纹理(3级) */
export declare const SplatUpdateSh3Texture: number;
/** 模型数据的球谐系数级别 */
export declare const GetModelShDegree: number;
/** 当前以多少球谐系数级别在显示 */
export declare const GetCurrentDisplayShDegree: number;
/** 取相机方向 */
export declare const GetCameraDirection: number;
