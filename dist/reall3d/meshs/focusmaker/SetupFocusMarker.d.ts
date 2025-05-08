import { Mesh } from 'three';
import { Events } from '../../events/Events';
export declare class FocusMarkerMesh extends Mesh {
    readonly ignoreIntersect: boolean;
}
export declare function setupFocusMarker(events: Events): void;
