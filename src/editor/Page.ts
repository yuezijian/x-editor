import Location  from './Location';
import Character from './Character';
import Editor    from './Editor';
import Rectangle from './Rectangle';
import Renderer  from './Renderer';
import Row       from './Row';
import Util      from './Util';


export default class Page
{
  static Width:  number = 900;
  static Height: number = 1000;

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
    this._baseline = this.bounding.top + this._editor.font.height + 4;

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

  add(character: Character, full: (character: Character | null) => void)
  {
    let row = this.rows[this._index];

    if (character.value === '\n')
    {
      character.x        = this._x;
      character.baseline = this._baseline;

      row.linebreak = character;

      this._x         = this.bounding.left;
      this._baseline += this._editor.font.height * 1.2;

      if (this._baseline > this.bounding.bottom - this.padding - this.padding)
      {
        full(null);

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
      this._baseline += this._editor.font.height * 1.2;

      if (this._baseline > this.bounding.bottom - this.padding - this.padding)
      {
        full(character);

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
    const { x, y } = this._transform(vx, vy);

    if (this.bounding.contain(x, y))
    {
      const rows = this.rows;

      const baselines = rows.map(row => row.baseline);
      const midlines = baselines.map(baseline => baseline - this._editor.font.height * 0.5);

      const index = Util.nearest(midlines, y);

      const offset = rows[index].offset_near(x);

      return new Location([index], offset);
    }

    return null;
  }

  private _transform(vx: number, vy: number)
  {
    const x = vx - this.origin_x - this.padding;
    const y = vy - this.origin_y - this.padding;

    return { x, y };
  }

  private _editor: Editor;

  private _index:    number;
  private _x:        number;
  private _baseline: number;
}
