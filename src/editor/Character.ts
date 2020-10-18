export default class Character
{
  readonly value: string;

  readonly width: number;

  baseline: number;

  constructor(value: string, width: number, baseline: number = 0)
  {
    this.value    = value;
    this.width    = width;
    this.baseline = baseline;
  }

  set x(value: number)
  {
    this._x = value;

    this._center = this._x + this.width * 0.5;
  }

  get x(): number
  {
    return this._x;
  }

  get center(): number
  {
    return this._center;
  }

  private _x:      number = 0;
  private _center: number = 0;
}
