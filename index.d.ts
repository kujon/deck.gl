/// <reference types="react"/>
/// <reference types="geojson" />

// tslint:disable:max-classes-per-file
export type Longitude = number;
export type Latitude = number;
export type Altitude = number;

export type Coordinates =
    [Longitude, Latitude, Altitude] |
    [Longitude, Latitude];

export type XCoordinate = number;
export type YCoordinate = number;
export type ZCoordinate = number;

export type Pixels =
    [XCoordinate, YCoordinate, ZCoordinate] |
    [XCoordinate, YCoordinate];

export type Color3 = [number, number, number];
export type Color4 = [number, number, number, number];
export type Color = Color3 | Color4;

export type Matrix = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];

export type Vector3 = [number, number, number];

// ----------------------------------------

export type ViewportProps = {
    width: number;
    height: number;
    viewMatrix?: Matrix;
    projectionMatrix?: Matrix;
};

export class Viewport {
    constructor(props: ViewportProps);
    equals(viewport: Viewport): boolean;
    project(
        coordinates: Coordinates,
        opts?: { topLeft?: boolean; }
    ): Pixels;
    unproject(
        pixels: Pixels,
        opts?: { topLeft?: boolean; }
    ): Coordinates;
}

// ----------------------------------------

export type LogFunction = (log: { level: number; id: string; numInstances: number; }) => void;

export type AttributeDefinition = {
    size: number;
    accessor: string | string[];
    update: (attribute: { value: any; size?: number; }, options: {}) => void;
    instanced?: boolean;
    noAlloc?: boolean;
    type?: number;
};

export type Attributes = {
    [index: string]: AttributeDefinition;
};

export class AttributeManager {
    static setDefaultLogFunctions(
        opts?: { onLog?: LogFunction; onUpdateStart?: LogFunction; onUpdateEnd?: LogFunction; }
    ): void;
    constructor(opts?: { id?: string });
    add(attributes: Attributes): void;
    addInstanced(attributes: Attributes): void;
    invalidate(name: string): void;
    invalidateAll(): void;
    remove(attributeNames: string[]): void;
}

// ----------------------------------------

export type PickingInfo<T, U> = {
    layer: T;
    index: number;
    object: U;
    x: XCoordinate;
    y: YCoordinate;
    lngLat: [Longitude, Latitude];
};

export type PickingMode =
    'hover' |
    'click';

// ----------------------------------------

export type Uniforms = {
    lightsPosition: number[];
    ambientRatio: number;
    diffuseRatio: number;
    specularRatio: number;
    lightsStrength: number[];
    numberOfLights: number;
};

// ----------------------------------------

export type BaseLayerProps<T, U> = {
    id?: string;
    data: U[];
    visible?: boolean;
    opacity: number;
    pickable?: boolean;
    onHover?: (info: PickingInfo<T, U>) => void | boolean;
    onClick?: (info: PickingInfo<T, U>) => void | boolean;
    projectionMode?: number;
    positionOrigin?: [Longitude, Latitude];
    modelMatrix?: Matrix;
    dataComparator?: (oldData: U[], newData: U[]) => boolean;
    numInstances?: number;
    updateTriggers?: {
        [index: string]: any[]
    };
    getPolygonOffset?: () => [number, number];
};

export type BaseLayerState = {
    attributeManager: AttributeManager;
};

export type BaseLayerContext = {
    gl: WebGLRenderingContext;
    viewport: Viewport;
};

export type BaseLayerUpdateParams<T, U> = {
    props: BaseLayerProps<T, U>;
    oldProps: BaseLayerProps<T, U>;
    context: BaseLayerContext;
    oldContext: BaseLayerContext;
    changeFlags: {
        dataChanged: boolean;
        propChanged: boolean;
        viewportChanged: boolean;
        somethingChanged: boolean;
    };
};

export type PickParams = {
    info: {
        picked: boolean;
        index: number;
        x: XCoordinate;
        y: YCoordinate;
        lngLat: [Longitude, Latitude];
        color: Color;
    }
};

export class BaseLayer<T> {
    context: BaseLayerContext;
    state: BaseLayerState;
    props: BaseLayerProps<this, T>;
    constructor(props: BaseLayerProps<BaseLayer<T>, T>);
    setState(state: BaseLayerState): void;
    initializeState(): void;
    shouldUpdateState(
        updateParams: BaseLayerUpdateParams<this, T>
    ): boolean;
    updateState(
        updateParams: BaseLayerUpdateParams<this, T>
    ): void;
    draw(
        drawParams: {
            uniforms: Uniforms
        }
    ): void;
    getPickingInfo(
        pickParams: PickParams
    ): PickingInfo<this, T> | null;
    finalizeState(): void;
    project(
        coordinates: Coordinates,
        opts?: { topLeft?: boolean; }
    ): Pixels;
    unproject(
        pixels: Pixels,
        opts?: { topLeft?: boolean; }
    ): Coordinates;
    projectFlat(
        coordinates: [Longitude, Latitude],
        scale: number
    ): [XCoordinate, YCoordinate];
    unprojectFlat(
        pixels: [XCoordinate, YCoordinate],
        scale: number
    ): [Longitude, Latitude];
    screenToDevicePixels(pixels: number): number;
    decodePickingColor(color: Color3): number | null;
    encodePickingColor(index: number): Color3;
    nullPickingColor(): Color3;
}

// ----------------------------------------

export type CompositePickParams<T> = PickParams & {
    mode: PickingMode;
    sourceLayer: T
};

export class CompositeLayer<T> extends BaseLayer<T> {
    renderLayers(): null | BaseLayer<T> | Array<BaseLayer<T>>;
    getPickingInfo(
        pickParams: CompositePickParams<T>
    ): PickingInfo<this, T> | null;
}

// ----------------------------------------

export type DeckGLViewportProps =
    {
        viewport: Viewport
    } |
    {
        latitude: Latitude;
        longitude: Longitude;
        zoom: number;
        bearing?: number;
        pitch?: number;
    };

export type DeckGLProps<T> = DeckGLViewportProps & {
    id?: string;
    width: number;
    height: number;
    layers: Array<BaseLayer<T>>;
    style?: React.CSSProperties;
    pickingRadius?: number;
    pixelRatio?: number;
    gl?: WebGLRenderingContext;
    debug?: boolean;
    onWebGLInitialized?: (gl: WebGLRenderingContext) => void;
    onLayerHover: (
        info: PickingInfo<BaseLayer<T>, T>,
        pickedInfos: Array<PickingInfo<BaseLayer<T>, T>>,
        event: MouseEvent
    ) => void;
    onLayerClick: (
        info: PickingInfo<BaseLayer<T>, T>,
        pickedInfos: Array<PickingInfo<BaseLayer<T>, T>>,
        event: MouseEvent
    ) => void;
};

export default class DeckGL<T> extends React.Component<DeckGLProps<T>> {
    queryObject(
        options: {
            x: XCoordinate;
            y: YCoordinate;
            radius?: number;
            layerIds?: string[];
        }
    ): PickingInfo<BaseLayer<T>, T> | null;
    queryVisibleObjects(
        options: {
            x: XCoordinate;
            y: YCoordinate;
            width?: number;
            height?: number;
            layerIds?: string[];
        }
    ): Array<PickingInfo<BaseLayer<T>, T>>;
}

// ----------------------------------------

export class LayerManager {
    constructor(opts: { gl: WebGLRenderingContext });
    setViewport(viewport: Viewport): void;
    updateLayers(
        updateParams: {
            newLayers: Array<BaseLayer<any>>
        }
    ): void;
    pickLayers(
        pickParams: {
            x: XCoordinate;
            y: YCoordinate;
            mode: PickingMode;
        }
    ): void;
}

// ----------------------------------------

export type OrthographicViewportProps = {
    width: number;
    height: number;
    eye?: Vector3;
    lookAt?: Vector3;
    up?: Vector3;
    near?: number;
    far?: number;
    left: XCoordinate;
    top: YCoordinate;
    right?: XCoordinate;
    bottom?: YCoordinate;
};

export class OrthographicViewport extends Viewport {
    constructor(opts: OrthographicViewportProps);
}

// ----------------------------------------

export type PerspectiveViewportProps = {
    width: number;
    height: number;
    eye?: Vector3;
    lookAt?: Vector3;
    up?: Vector3;
    fov?: number;
    near?: number;
    far?: number;
    aspect?: number;
};

export class PerspectiveViewport extends Viewport {
    constructor(opts: PerspectiveViewportProps);
}

// ----------------------------------------

export type WebMercatorViewportProps = {
    width: number;
    height: number;
    latitude?: Latitude;
    longitude?: Longitude;
    zoom?: number;
    pitch?: number;
    bearing?: number;
    altitude?: Altitude;
    farZMultiplier?: number;
};

export class WebMercatorViewport extends Viewport {
    constructor(opts: WebMercatorViewportProps);
    projectFlat(
        coordinates: [Longitude, Latitude],
        scale: number
    ): [XCoordinate, YCoordinate];
    unprojectFlat(
        pixels: [XCoordinate, YCoordinate],
        scale: number
    ): [Longitude, Latitude];
    getDistanceScales(): {
        pixelsPerMeter: Vector3;
        metersPerPixel: Vector3;
        pixelsPerDegree: Vector3;
        degreesPerPixel: Vector3;
    };
    metersToLngLatDelta(
        xyz: Pixels
    ): Coordinates;
    lngLatDeltaToMeters(
        deltaLngLatZ: Coordinates
    ): Pixels;
    addMetersToLngLat(
        lngLatZ: Coordinates,
        xyz: Pixels
    ): Coordinates;
}

// ----------------------------------------

export type DefaultLineDatum = {
    sourcePosition: Coordinates;
    targetPosition: Coordinates;
    color: Color;
};

export type LineLayerProps<T = DefaultLineDatum> = BaseLayerProps<LineLayer<T>, T> & {
    strokeWidth?: number;
    fp64?: boolean;
    getSourcePosition?: (datum: T) => Coordinates;
    getTargetPosition?: (datum: T) => Coordinates;
    getColor?: (datum: T) => Color;
};

export class LineLayer<T = DefaultLineDatum> extends BaseLayer<T> {
    constructor(props: LineLayerProps<T>);
}

// ----------------------------------------

export type DefaultIconDatum = {
    position: Coordinates;
    icon: string;
    size?: number;
    color?: Color;
    angle?: number;
};

export type IconLayerProps<T = DefaultIconDatum> = BaseLayerProps<IconLayer<T>, T> & {
    iconAtlas: string;
    iconMapping: {
        [index: string]: {
            x: XCoordinate;
            y: YCoordinate;
            width: number;
            height: number;
            anchorX?: XCoordinate;
            anchorY?: YCoordinate;
            mask?: boolean;
        }
    };
    sizeScale?: number;
    fp64?: boolean;
    getPosition?: (datum: T) => Coordinates;
    getIcon?: (datum: T) => string;
    getSize?: (datum: T) => number;
    getColor?: (datum: T) => Color;
    getAngle?: (datum: T) => number;
};

export class IconLayer<T = DefaultIconDatum> extends BaseLayer<T> {
    constructor(props: IconLayerProps<T>);
}

// ----------------------------------------

export type DefaultPathDatum = {
    paths: Coordinates[];
    color?: Color;
    width?: number;
};

export type PathLayerProps<T = DefaultPathDatum> = BaseLayerProps<PathLayer<T>, T> & {
    widthScale?: number;
    widthMinPixels?: number;
    widthMaxPixels?: number;
    rounded?: boolean;
    miterLimit?: number;
    fp64?: boolean;
    getPath?: (datum: T, index: number) => Coordinates[];
    getColor?: (datum: T, index: number) => Color;
    getWidth?: (datum: T, index: number) => number;
};

export class PathLayer<T = DefaultPathDatum> extends BaseLayer<T> {
    constructor(props: PathLayerProps<T>);
}

// ----------------------------------------

export type DefaultPointCloudDatum = {
    position: Coordinates;
    normal: number;
    color: Color;
};

export type PointCloudLayerProps<T = DefaultPointCloudDatum> = BaseLayerProps<PointCloudLayer<T>, T> & {
    radiusPixels?: number;
    fp64?: boolean;
    lightSettings?: Uniforms;
    getPosition?: (datum: T) => Coordinates;
    getNormal?: (datum: T) => number;
    getColor?: (datum: T) => Color;
};

export class PointCloudLayer<T = DefaultPointCloudDatum> extends BaseLayer<T> {
    constructor(props: PointCloudLayerProps<T>);
}

// ----------------------------------------

export type DefaultPolygonDatum = {
    polygon: Coordinates[][] | Coordinates[][][];
    fillColor?: Color;
    strokeColor?: Color;
    color?: Color;
    width?: number;
    elevation?: number;
};

export type PolygonLayerProps<T = DefaultPolygonDatum> = BaseLayerProps<PolygonLayer<T>, T> & {
    filled?: boolean;
    stroked?: boolean;
    extruded?: boolean;
    wireframe?: boolean;
    lineWidthScale?: number;
    lineWidthMinPixels?: number;
    lineWidthMaxPixels?: number;
    lineJointRounded?: boolean;
    lineMiterLimit?: number;
    fp64?: boolean;
    lightSettings?: Uniforms;
    getPolygon?: (datum: T) => Coordinates[][] | Coordinates[][][];
    getFillColor?: (datum: T) => Color;
    getColor?: (datum: T) => Color;
    getWidth?: (datum: T) => number;
    getElevation?: (datum: T) => number;
};

export class PolygonLayer<T = DefaultPolygonDatum> extends BaseLayer<T> {
    constructor(props: PolygonLayerProps<T>);
}

// ----------------------------------------

export type DefaultScatterplotDatum = {
    position: Coordinates;
    radius: number;
    color: Color;
};

export type ScatterplotLayerProps<T = DefaultScatterplotDatum> = BaseLayerProps<ScatterplotLayer<T>, T> & {
    radiusScale?: number;
    outline?: boolean;
    strokeWidth?: number;
    radiusMinPixels?: number;
    radiusMaxPixels?: number;
    getPosition?: (datum: T) => Coordinates;
    getRadius?: (datum: T) => number;
    getColor?: (datum: T) => Color;
};

export class ScatterplotLayer<T = DefaultScatterplotDatum> extends BaseLayer<T> {
    constructor(props: ScatterplotLayerProps<T>);
}

// ----------------------------------------

export type DefaultScreenGridDatum = {
    position: Coordinates;
    weight?: number;
};

export type ScreenGridLayerProps<T = DefaultScreenGridDatum> = BaseLayerProps<ScreenGridLayer<T>, T> & {
    cellSizePixels?: number;
    minColor?: Color4;
    maxColor?: Color4;
    getPosition?: (datum: T) => Coordinates;
    getWeight?: (datum: T) => number;
};

export class ScreenGridLayer<T = DefaultScreenGridDatum> extends BaseLayer<T> {
    constructor(props: ScreenGridLayerProps<T>);
}

// ----------------------------------------

export type DefaultArcDatum = {
    sourcePosition: Coordinates;
    targetPosition: Coordinates;
    color: Color;
};

export type ArcLayerProps<T = DefaultArcDatum> = BaseLayerProps<ArcLayer<T>, T> & {
    strokeWidth?: number;
    fp64?: boolean;
    getSourcePosition?: (datum: T) => Coordinates;
    getTargetPosition?: (datum: T) => Coordinates;
    getSourceColor?: (datum: T) => Color;
    getTargetColor?: (datum: T) => Color;
};

export class ArcLayer<T = DefaultArcDatum> extends BaseLayer<T> {
    constructor(props: ArcLayerProps<T>);
}

// ----------------------------------------

export type DefaultGridDatum = {
    position: Coordinates;
};

export type GridLayerProps<T = DefaultGridDatum> = BaseLayerProps<GridLayer<T>, T> & {
    cellSize?: number;
    colorDomain?: [number, number];
    colorRange?: Color3[];
    getColorValue?: (points: Coordinates[]) => number;
    coverage?: number;
    elevationDomain?: [number, number];
    elevationRange?: [number, number];
    elevationScale?: number;
    extruded?: boolean;
    upperPercentile?: number;
    lowerPercentile?: number;
    fp64?: boolean;
    lightSettings?: Uniforms;
    getPosition?: (datum: T) => Coordinates;
};

export class GridLayer<T = DefaultGridDatum> extends BaseLayer<T> {
    constructor(props: GridLayerProps<T>);
}

// ----------------------------------------

export type DefaultHexagonDatum = {
    position: Coordinates;
};

export type HexagonLayerProps<T = DefaultHexagonDatum> = BaseLayerProps<HexagonLayer<T>, T> & {
    radius?: number;
    hexagonAggregator?: (
        props: HexagonLayerProps<T>,
        viewport: Viewport
    ) => {
        hexagons: Array<{ centroid: Coordinates, points: Coordinates[] }>,
        hexagonVertices?: Coordinates[]
    };
    colorDomain?: [number, number];
    colorRange?: Color3[];
    getColorValue?: (points: Coordinates[]) => number;
    coverage?: number;
    elevationDomain?: [number, number];
    elevationRange?: [number, number];
    elevationScale?: number;
    extruded?: boolean;
    upperPercentile?: number;
    lowerPercentile?: number;
    fp64?: boolean;
    lightSettings?: Uniforms;
    getPosition?: (datum: T) => Coordinates;
};

export class HexagonLayer<T = DefaultHexagonDatum> extends BaseLayer<T> {
    constructor(props: HexagonLayerProps<T>);
}

// ----------------------------------------

export type DefaultGeoJsonDatum =
    GeoJSON.Feature<GeoJSON.GeometryObject> |
    GeoJSON.FeatureCollection<GeoJSON.GeometryObject>;

export type GeoJsonLayerProps<T = DefaultGeoJsonDatum> = BaseLayerProps<GeoJsonLayer<T>, T> & {
    filled?: boolean;
    stroked?: boolean;
    extruded?: boolean;
    wireframe?: boolean;
    lineWidthScale?: number;
    lineWidthMinPixels?: number;
    lineWidthMaxPixels?: number;
    lineJointRounded?: boolean;
    lineMiterLimit?: number;
    pointRadiusScale?: number;
    pointRadiusMinPixels?: number;
    pointRadiusMaxPixels?: number;
    fp64?: boolean;
    lightSettings?: Uniforms;
    getLineColor?: (datum: T) => Color;
    getFillColor?: (datum: T) => Color;
    getRadius?: (datum: T) => Color;
    getLineWidth?: (datum: T) => number;
    getElevation?: (datum: T) => number;
};

export class GeoJsonLayer<T = DefaultGeoJsonDatum> extends BaseLayer<T> {
    constructor(props: GeoJsonLayerProps<T>);
}
