import { GetWorker, WorkerSort, WorkerDispose, GetViewProjectionMatrixArray, GetMaxRenderCount, IsBigSceneMode } from '../events/EventConstants';
import { WkInit, WkIsBigSceneMode, WkMaxRenderCount, WkViewProjection } from '../utils/consts/WkConstants';
export function setupSorter(events) {
    const on = (key, fn, multiFn) => events.on(key, fn, multiFn);
    const fire = (key, ...args) => events.fire(key, ...args);
    const worker = new Worker(new URL('./Sorter.js', import.meta.url), { type: 'module' });
    on(GetWorker, () => worker);
    on(WorkerSort, () => worker.postMessage({ [WkViewProjection]: fire(GetViewProjectionMatrixArray) }));
    on(WorkerDispose, () => worker.terminate());
    (async () => {
        worker.postMessage({ [WkInit]: true, [WkMaxRenderCount]: await fire(GetMaxRenderCount), [WkIsBigSceneMode]: fire(IsBigSceneMode) });
    })();
}
