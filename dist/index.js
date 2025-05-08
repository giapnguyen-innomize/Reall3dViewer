export * from './reall3d/viewer/Reall3dViewer';
export function initDevMode(infoOnly = false) {
    document.querySelectorAll('.prd-mode').forEach(dom => dom['style'].removeProperty('display'));
    let spans = document.querySelectorAll('#gsviewer .operation span');
    let jsHeapSizeLimit = (performance['memory'] || { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 }).jsHeapSizeLimit;
    !jsHeapSizeLimit && document.querySelectorAll('.tr-memory').forEach(dom => dom.classList.toggle('hidden'));
    navigator.userAgent.includes('Mobi') && document.querySelectorAll('.tr-pc-only').forEach(dom => dom.classList.toggle('hidden'));
    document.querySelectorAll('.dev-panel').forEach(dom => dom['style'].removeProperty('display'));
    !infoOnly &&
        Array.from(spans).forEach(span => {
            span.addEventListener('click', function (e) {
                let target = e.target;
                // fnClick(target.className);
            });
        });
    infoOnly && document.querySelectorAll('.operation').forEach(dom => (dom['style'].display = 'none'));
    const gstext = document.querySelector('.gstext');
    if (gstext) {
        gstext.addEventListener('keyup', function (e) {
            window['$api']?.setWaterMark(gstext.value, false);
        });
    }
}
