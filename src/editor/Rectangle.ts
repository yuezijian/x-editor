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

  x()
  {
    return this.left;
  }

  y()
  {
    return this.top;
  }

  width()
  {
    return this.right - this.left;
  }

  height()
  {
    return this.bottom - this.top;
  }

  // extend_right(value)
  // {
  //   this.right += value;
  // }
  //
  // contain_horizontal(y)
  // {
  //   return this.top  <= y && y <= this.bottom;
  // }
  //
  // contain_vertical(x)
  // {
  //   return this.left <= x && x <= this.right;
  // }
  //
  // contain(x, y)
  // {
  //   return this.contain_horizontal(y) && this.contain_vertical(x);
  // }
}


export default Rectangle;
