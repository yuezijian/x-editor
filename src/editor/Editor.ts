import Caret     from './Caret';
import Character from './Character';
import Font      from './Font';
import Location  from './Location';
import Rectangle from './Rectangle';
import Renderer  from './Renderer';
import Row       from './Row';
import Util      from './Util';


export default class Editor
{
  constructor()
  {
    console.log('Editor constructor');

    this.document = [];

    this.rows = [];
  }

  attach(canvas: HTMLCanvasElement): void
  {
    console.log(canvas)
    this.bounding = new Rectangle();

    this.bounding.right  = canvas.width;
    this.bounding.bottom = canvas.height;

    canvas.style.cursor = 'text';

    this.font = new Font('courier', 32);

    this.renderer = new Renderer(canvas);

    this.update();
    this.render();
  }

  insert(text: string): void
  {
    const begin = this._anchor < this._focus ? this._anchor : this._focus;
    const end   = this._anchor > this._focus ? this._anchor : this._focus;

    const characters = text.split('').map(value => this.create_character(value));

    this.document.splice(begin, end - begin, ...characters);

    this.set_focus(begin + characters.length);

    this.update();

    this.render();
  }

  erase(): void
  {
    if (this._anchor !== this._focus)
    {
      const begin = this._anchor < this._focus ? this._anchor : this._focus;
      const end   = this._anchor > this._focus ? this._anchor : this._focus;

      this.document.splice(begin, end - begin);

      this.set_focus(begin);

      this.update();

      this.render();
    }
  }

  delete_backward(): void
  {
    if (this._anchor === this._focus)
    {
      if (this._focus - 1 >= 0)
      {
        this.anchor_capture();

        this.set_focus(this._focus - 1);

        this.anchor_release();
      }
    }

    this.erase();
  }

  delete_forward(): void
  {
    if (this._anchor === this._focus)
    {
      if (this._focus + 1 <= this.document.length)
      {
        this.anchor_capture();

        this.set_focus(this._focus + 1);

        this.anchor_release();
      }
    }

    this.erase();
  }

  anchor_capture(): void
  {
    this.select = true;
  }

  anchor_release(): void
  {
    this.select = false;
  }

  focus_by(x: number, y: number): void
  {
    const baselines = this.rows.map(row => row.baseline);
    const midlines = baselines.map(baseline => baseline - this.font.height * 0.5);

    const index = Util.nearest(midlines, y + this.view_y);

    const offset = this.rows[index].offset_near(x);

    this.caret_to(index, offset);

    this.calculate_focus_by(this._caret.location);

    this.render();
  }

  caret_move_left(): void
  {
    if (!this.select && this._anchor !== this._focus)
    {
      const position = this._anchor < this._focus ? this._anchor : this._focus;

      this.set_focus(position);

      this.calculate_caret_by_focus();
    }
    else
    {
      const location = this.location_by_backward();

      this.caret_to(location.index, location.offset);

      this.calculate_focus_by(this._caret.location);
    }

    this.render();
  }

  caret_move_right(): void
  {
    if (!this.select && this._anchor !== this._focus)
    {
      const position = this._anchor > this._focus ? this._anchor : this._focus;

      this.set_focus(position);

      this.calculate_caret_by_focus();
    }
    else
    {
      const location = this.location_by_forward();

      this.caret_to(location.index, location.offset);

      this.calculate_focus_by(this._caret.location);
    }

    this.render();
  }

  caret_move_up(): void
  {
    if (!this.select && this._anchor !== this._focus)
    {
      const position = this._anchor < this._focus ? this._anchor : this._focus;

      this.set_focus(position);

      this.calculate_caret_by_focus();
    }
    else
    {
      let index  = this._caret.location.index;
      let offset = this._caret.location.offset;

      if (index - 1 < 0)
      {
        offset = 0;
      }
      else
      {
        const x = this.rows[index].x_by(offset);

        index -= 1;

        offset = this.rows[index].offset_near(x);
      }

      this.caret_to(index, offset);

      this.calculate_focus_by(this._caret.location);
    }

    this.render();
  }

  caret_move_down(): void
  {
    if (!this.select && this._anchor !== this._focus)
    {
      const position = this._anchor > this._focus ? this._anchor : this._focus;

      this.set_focus(position);

      this.calculate_caret_by_focus();
    }
    else
    {
      let index  = this._caret.location.index;
      let offset = this._caret.location.offset;

      if (index + 1 >= this.rows.length)
      {
        offset = this.rows[index].length;
      }
      else
      {
        const x = this.rows[index].x_by(offset);

        index += 1;

        offset = this.rows[index].offset_near(x);
      }

      this.caret_to(index, offset);

      this.calculate_focus_by(this._caret.location);
    }

    this.render();
  }

  selection(): string
  {
    if (this._anchor === this._focus)
    {
      return '';
    }

    const begin = this._anchor < this._focus ? this._anchor : this._focus;
    const end   = this._anchor > this._focus ? this._anchor : this._focus;

    const characters = this.document.slice(begin, end);

    return characters.map(character => character.value).join('');
  }

  render(): void
  {
    this.renderer.identity();

    this.renderer.draw_rectangle(this.bounding, '#ececec');

    this.renderer.translate(0, -this.view_y);

    for (const row of this.rows)
    {
      row.draw(this.renderer, this.font);
    }

    let x = 0;

    const location = this._caret.location;

    const row = this.rows[location.index];

    if (row.length > 0)
    {
      let offset = location.offset;

      if (location.offset >= row.length)
      {
        offset = row.length - 1;
      }

      const character = row.characters[offset];

      x = character.x;

      if (location.offset >= row.length)
      {
        x += character.width;
      }
    }

    this._caret.draw(this.renderer, this.font, x, row.baseline);
  }

  scroll_up(): void
  {
    this.view_y -= this.font.height * 1.2;

    if (this.view_y < 0)
    {
      this.view_y = 0;
    }

    this.render();
  }

  scroll_down(): void
  {
    this.view_y += this.font.height * 1.2;

    const y = this.rows[this.rows.length - 2].baseline;

    if (this.view_y > y)
    {
      this.view_y = y;
    }

    this.render();
  }

  private create_character(value: string)
  {
    const width = this.renderer.measure(this.font, value);

    return new Character(this.font, value, width);
  }

  private set_focus(value: number)
  {
    this._focus = value;

    if (!this.select)
    {
      this._anchor = this._focus;
    }

    for (let i = 0; i < this.document.length; ++i)
    {
      this.document[i].select = false;
    }

    if (this._anchor !== this._focus)
    {
      const begin = this._anchor < this._focus ? this._anchor : this._focus;
      const end   = this._anchor > this._focus ? this._anchor : this._focus;

      for (let i = begin; i < end; ++i)
      {
        this.document[i].select = true;
      }
    }
  }

  private location_by_backward(): Location
  {
    let index  = this._caret.location.index;
    let offset = this._caret.location.offset;

    if (offset - 1 < 0)
    {
      if (index - 1 < 0)
      {
        return new Location(index, offset);
      }

      index -= 1;

      const row = this.rows[index];

      offset = row.length;
    }
    else
    {
      offset -= 1;
    }

    return new Location(index, offset);
  }

  private location_by_forward(): Location
  {
    let index  = this._caret.location.index;
    let offset = this._caret.location.offset;

    const row = this.rows[index];

    if (offset + 1 > row.length)
    {
      if (index + 1 >= this.rows.length)
      {
        return new Location(index, offset);
      }

      index  += 1;
      offset  = 0;
    }
    else
    {
      offset += 1;
    }

    return new Location(index, offset);
  }

  private calculate_caret_by_focus()
  {
    // 计算光标位置

    let n = 0;

    for (let i = 0; i < this.rows.length; ++i)
    {
      const row = this.rows[i];

      const length = row.length;

      n += length;

      if (n >= this._focus)
      {
        this.caret_to(i, length - n + this._focus);

        break;
      }

      if (row.linebreak !== null)
      {
        n += 1;
      }
    }
  }

  private calculate_focus_by(location: Location)
  {
    let offset = 0;

    for (let i = 0; i < location.index; ++i)
    {
      const row = this.rows[i];

      offset += row.length;

      if (row.linebreak !== null)
      {
        offset += 1;
      }
    }

    offset += location.offset;

    this.set_focus(offset);
  }

  private caret_to(index: number, focus: number): void
  {
    this._caret.to(index, focus);

    const baseline = this.rows[this._caret.location.index].baseline;

    if (baseline - this.view_y < this.font.height * 1.2)
    {
      this.view_y = baseline - this.font.height * 1.2;
    }

    if (baseline - this.view_y > this.bounding.height)
    {
      this.view_y = baseline - this.bounding.height;
    }

    if (this.view_y < 0)
    {
      this.view_y = 0;
    }
  }

  private update()
  {
    // 使用文档结构，更新绘制结构

    let x        = this.bounding.left;
    let baseline = this.font.height + 4;

    let row = new Row(this.font, baseline);

    this.rows = [row];  // 总是存在一个初始行

    for (const character of this.document)
    {
      if (character.value === '\n')
      {
        character.x        = x;
        character.baseline = baseline;

        row.linebreak = character;

        x         = this.bounding.left;
        baseline += this.font.height * 1.2;

        row = new Row(this.font, baseline);

        this.rows.push(row);

        continue;
      }

      if (x + character.width >= this.bounding.right)
      {
        x         = this.bounding.left;
        baseline += this.font.height * 1.2;

        row = new Row(this.font, baseline);

        this.rows.push(row);
      }

      character.x        = x;
      character.baseline = baseline;

      row.characters.push(character);

      x += character.width;
    }

    this.calculate_caret_by_focus();
  }

  private readonly document: Character[];

  private select: boolean = false;

  private _anchor: number = 0;
  private _focus:  number = 0;

  private rows: Row[];

  private bounding!: Rectangle;

  private     font!: Font;

  private _caret: Caret = new Caret();

  private renderer!: Renderer;

  private view_y: number = 0;
}
