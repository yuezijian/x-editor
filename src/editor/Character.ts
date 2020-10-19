import Font      from './Font';
import Rectangle from './Rectangle';


export default class Character
{
  readonly font: Font;

  readonly value: string;

  bounding: Rectangle = new Rectangle();

  select: boolean = false;

  constructor(font: Font, value: string, metrics: TextMetrics, baseline: number = 0)
  {
    this.font = font;

    this.value = value;

    this._metrics = metrics;

    this._baseline = baseline;
  }

  set x(value: number)
  {
    this._x = value;

    this.reset_bounding();

    this._center = this._x + this.width * 0.5;
  }

  get x(): number
  {
    return this._x;
  }

  get width(): number
  {
    return this._metrics.width;
  }

  set baseline(value: number)
  {
    this._baseline = value;

    this.reset_bounding();
  }

  get baseline(): number
  {
    return this._baseline;
  }

  get center(): number
  {
    return this._center;
  }

  private reset_bounding()
  {
    this.bounding.left  = this._x;
    this.bounding.right = this._x + this.width;

    this.bounding.top    = this._baseline - this.font.height - 4;
    this.bounding.bottom = this._baseline + 2;
  }

  private _x:        number = 0;
  private _baseline: number;

  private _center: number = 0;

  private _metrics: TextMetrics;
}
