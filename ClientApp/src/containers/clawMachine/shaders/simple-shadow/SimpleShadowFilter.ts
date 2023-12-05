import { vertex } from "../default";
import fragment from "./simpleshadow";
import { Filter, settings, ObservablePoint, utils } from "@pixi/core";
import type {
  CLEAR_MODES,
  FilterSystem,
  RenderTexture,
  IPointData,
} from "@pixi/core";

interface SimpleShadowFilterOptions {
  offset: IPointData;
  color: number;
  alpha: number;
  shadowOnly: boolean;
  resolution: number;
}

/**
 * Simple shadow filter with no blur.<br>
 * @class
 * @extends PIXI.Filter
 * @see {@link https://github.com/pixijs/filters/blob/main/filters/drop-shadow/src/DropShadowFilter.ts}
 */
class SimpleShadowFilter extends Filter {
  /** Default constructor options. */
  public static readonly defaults: SimpleShadowFilterOptions = {
    offset: { x: 4, y: 4 },
    color: 0x000000,
    alpha: 0.5,
    shadowOnly: false,
    resolution: settings.FILTER_RESOLUTION || 1,
  };

  /** Hide the contents, only show the shadow. */
  public shadowOnly: boolean;

  private _offset: ObservablePoint;
  private _tintFilter: Filter;
  protected _resolution: number = settings.FILTER_RESOLUTION || 1;

  /**
   * @param {object} [options] - Filter options
   * @param {number} [options.offset={x: 4, y: 4}] - Offset of the shadow
   * @param {number} [options.color=0x000000] - Color of the shadow
   * @param {number} [options.alpha=0.5] - Alpha of the shadow
   * @param {boolean} [options.shadowOnly=false] - Whether render shadow only
   * @param {number} [options.resolution=PIXI.settings.FILTER_RESOLUTION] - The resolution of the Blur filter.
   */
  constructor(options?: Partial<SimpleShadowFilterOptions>) {
    super();

    const opt: SimpleShadowFilterOptions = options
      ? { ...SimpleShadowFilter.defaults, ...options }
      : SimpleShadowFilter.defaults;

    const { resolution } = opt;

    this._offset = new ObservablePoint(this._updatePadding, this);
    this._tintFilter = new Filter(vertex, fragment);
    this._tintFilter.uniforms.color = new Float32Array(4);
    this._tintFilter.uniforms.shift = this._offset;
    this._tintFilter.resolution = resolution;

    this.resolution = resolution;

    const { shadowOnly, offset, alpha, color } = opt;

    this.shadowOnly = shadowOnly;
    this.offset = offset;
    this.alpha = alpha;
    this.color = color;
  }

  apply(
    filterManager: FilterSystem,
    input: RenderTexture,
    output: RenderTexture,
    clear: CLEAR_MODES
  ): void {
    const target = filterManager.getFilterTexture();

    this._tintFilter.apply(filterManager, input, output, clear);

    if (!this.shadowOnly) {
      filterManager.applyFilter(this, input, output, 0);
    }

    filterManager.returnFilterTexture(target);
  }

  /**
   * Recalculate the proper padding amount.
   * @private
   */
  private _updatePadding() {
    const offsetPadding = Math.max(
      Math.abs(this._offset.x),
      Math.abs(this._offset.y)
    );

    this.padding = offsetPadding;
  }

  /**
   * Set the offset position of the drop-shadow relative to the original image.
   * @type {PIXI.IPointData}
   * @default {x: 4, y: 4}
   */
  public set offset(value: IPointData) {
    this._offset.copyFrom(value);
    this._updatePadding();
  }
  public get offset(): ObservablePoint {
    return this._offset;
  }

  /**
   * The resolution of the filter.
   * @default PIXI.settings.FILTER_RESOLUTION
   */
  get resolution(): number {
    return this._resolution;
  }
  set resolution(value: number) {
    this._resolution = value;

    if (this._tintFilter) {
      this._tintFilter.resolution = value;
    }
  }

  /**
   * The alpha of the shadow
   * @default 1
   */
  get alpha(): number {
    return this._tintFilter.uniforms.alpha;
  }
  set alpha(value: number) {
    this._tintFilter.uniforms.alpha = value;
  }

  /**
   * The color of the shadow.
   * @default 0x000000
   */
  get color(): number {
    return utils.rgb2hex(this._tintFilter.uniforms.color);
  }
  set color(value: number) {
    utils.hex2rgb(value, this._tintFilter.uniforms.color);
  }
}

export { SimpleShadowFilter };
export type { SimpleShadowFilterOptions };
