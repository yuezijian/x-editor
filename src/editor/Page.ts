import Location  from './Location';
import Character from './Character';
import Editor    from './Editor';
import Rectangle from './Rectangle';
import Renderer  from './Renderer';
import Row       from './Row';
import Util      from './Util';


export default class Page
{
  static Width:  number = 1200;
  static Height: number = 1600;

  origin_x: number = 0;
  origin_y: number = 0;

  bounding: Rectangle = new Rectangle();

  padding: number = 40;

  rows: Row[];

  // constructor(editor: Editor, width: number, height: number)
  constructor(editor: Editor)
  {
    this._editor = editor;

    this.bounding.left = 0;
    this.bounding.top  = 0;

    this.bounding.right  = this.bounding.left + Page.Width;
    this.bounding.bottom = this.bounding.top  + Page.Height;

    this._index    = 0;
    this._x        = this.bounding.left;
    this._baseline = this.bounding.top + this._editor.font.height;

    let row = new Row(this._baseline);

    this.rows = [row];
  }

  get width(): number
  {
    return this.bounding.width;
  }

  get height(): number
  {
    return this.bounding.height;
  }

  add(character: Character, on_overflow: (character: Character | null) => void)
  {
    let row = this.rows[this._index];

    if (character.value === '\n')
    {
      character.x        = this._x;
      character.baseline = this._baseline;

      row.linebreak = character;

      this._x         = this.bounding.left;
      this._baseline += this._editor.font.vertical_space;

      if (this._baseline > this.bounding.bottom - this.padding - this.padding)
      {
        on_overflow(null);

        return;
      }

      row = new Row(this._baseline);

      this.rows.push(row);

      this._index += 1;

      return;
    }

    if (this._x + character.width >= this.bounding.right - this.padding - this.padding)
    {
      this._x         = this.bounding.left;
      this._baseline += this._editor.font.vertical_space  ;

      if (this._baseline > this.bounding.bottom - this.padding - this.padding)
      {
        on_overflow(character);

        return;
      }

      row = new Row(this._baseline);

      this.rows.push(row);

      this._index += 1;
    }

    character.x        = this._x;
    character.baseline = this._baseline;

    row.characters.push(character);

    this._x += character.width;
  }

  draw(renderer: Renderer)
  {
    renderer.save();

    renderer.translate(this.origin_x, this.origin_y);

    renderer.draw_rectangle(this.bounding, '#ffffff');

    renderer.save();

    renderer.translate(this.padding, this.padding);

    for (const row of this.rows)
    {
      row.draw(renderer, this._editor.font);
    }

    renderer.restore();

    renderer.restore();
  }

  focus(vx: number, vy: number): Location | null
  {
    let { x, y } = this.transform(vx, vy);

    if (this.bounding.contain(x, y))
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
  private _x:        number;
  private _baseline: number;
}
