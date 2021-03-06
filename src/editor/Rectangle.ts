class Rectangle
{
  left:   number = 0;
  top:    number = 0;
  right:  number = 0;
  bottom: number = 0;

  constructor(left: number = 0, top: number = 0, right: number = 0, bottom: number = 0)
  {
    this.left   = left;
    this.top    = top;
    this.right  = right;
    this.bottom = bottom;
  }

  get x(): number
  {
    return this.left;
  }

  get y(): number
  {
    return this.top;
  }

  get width(): number
  {
    return this.right - this.left;
  }

  get height(): number
  {
    return this.bottom - this.top;
  }

  center(): number
  {
    return this.left + this.width * 0.5;
  }

  contain_horizontal(y: number)
  {
    return this.top  <= y && y <= this.bottom;
  }

  contain_vertical(x: number)
  {
    return this.left <= x && x <= this.right;
  }

  contain(x: number, y: number)
  {
    return this.contain_horizontal(y) && this.contain_vertical(x);
  }
}


export default Rectangle;
