import Location  from './Location';
import Character from './Character';
import Editor    from './Editor';
import Rectangle from './Rectangle';
import Renderer  from './Renderer';
import Row       from './Row';
import Util      from './Util';


export default class Box
{
  static Width:  number = 400;
  static Height: number = 400;

  origin_x: number = 0;
  origin_y: number = 0;

  bound: Rectangle = new Rectangle();

  padding: number = 0;

  rows: Row[];

  // constructor(editor: Editor, width: number, height: number)
  constructor(editor: Editor)
  {
    this._editor = editor;

    this.bound.left = 0;
    this.bound.top  = 0;

    this.bound.right  = this.bound.left + Box.Width;
    this.bound.bottom = this.bound.top  + Box.Height;

    this._index    = 0;
    this._baseline = this.bound.top + this._editor.font.height;

    let row = new Row(this, this._baseline);

    this.rows = [row];
  }

  get width(): number
  {
    return this.bound.width;
  }

  get height(): number
  {
    return this.bound.height;
  }

  add(character: Character, on_overflow: (character: Character | null) => void): void
  {
    let row = this.rows[this._index];

    const on_new_row = (character: Character | null) =>
    {
      this._baseline += this._editor.font.vertical_space;

      if (this._baseline > this.bound.bottom - this.padding - this.padding)
      {
        on_overflow(character);

        return;
      }

      const row = new Row(this, this._baseline);

      this.rows.push(row);

      this._index += 1;

      if (character)
      {
        row.add(character, on_new_row);
      }
    };

    row.add(character, on_new_row);
  }

  draw(renderer: Renderer): void
  {
    renderer.state_push();

    renderer.translate(this.origin_x, this.origin_y);

    renderer.draw_rectangle(this.bound, '#ffffff');

    renderer.state_push();

    renderer.translate(this.padding, this.padding);

    for (const row of this.rows)
    {
      row.draw(renderer, this._editor.font);
    }

    renderer.state_pop();

    renderer.state_pop();
  }

  focus(vx: number, vy: number): Location | null
  {
    let { x, y } = this.transform(vx, vy);

    if (this.bound.contain(x, y))
    {
      x -= this.padding;
      y -= this.padding;

      const rows = this.rows;

      const baselines = rows.map(row => row.baseline);

      const top    = baselines[0] - this._editor.font.height;
      const bottom = baselines[baselines.length - 1];

      if (y < top)
      {
        return new Location([0], 0);
      }

      if (y > bottom)
      {
        const index  = rows.length - 1;
        const offset = rows[index].length;

        return new Location([index], offset);
      }

      const midlines = baselines.map(baseline => baseline - this._editor.font.height * 0.5);

      const index = Util.nearest(midlines, y);

      const offset = rows[index].offset_near(x);

      return new Location([index], offset);
    }

    return null;
  }

  private transform(vx: number, vy: number)
  {
    const x = vx - this.origin_x;
    const y = vy - this.origin_y;

    return { x, y };
  }

  private _editor: Editor;

  private _index:    number;
  private _baseline: number;
}
