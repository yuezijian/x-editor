import Font      from './Font';
import Rectangle from './Rectangle';
import Row       from './Row';


export default class Character
{
  parent: Row | null = null;

  readonly font: Font;

  readonly value: string;

  readonly width: number;

  bound: Rectangle = new Rectangle();

  select: boolean = false;

  constructor(font: Font, value: string, width: number)
  {
    this.font = font;

    this.value = value;

    this.width = width;
  }

  set x(value: number)
  {
    this._x = value;

    this.update_bound();

    this._center = this._x + this.width * 0.5;
  }

  get x(): number
  {
    return this._x;
  }

  get baseline(): number
  {
    return this.parent!.baseline;
  }

  get center(): number
  {
    return this._center;
  }

  private update_bound()
  {
    this.bound.left  = this._x;
    this.bound.right = this._x + this.width;

    this.bound.top    = this.parent!.baseline - this.font.height - 4;
    this.bound.bottom = this.parent!.baseline + 2;
  }

  private _x:      number = 0;
  private _center: number = 0;
}
