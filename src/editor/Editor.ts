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
  caret: Caret = new Caret();

  constructor()
  {
    console.log('Editor constructor');

    this.document = [];

    this.rows = [];
  }

  attach(canvas: HTMLCanvasElement)
  {
    this.bounding = new Rectangle();

    this.bounding.right  = canvas.width;
    this.bounding.bottom = canvas.height;

    canvas.style.cursor = 'text';

    this.font = new Font('courier', 32);

    this.renderer = new Renderer(canvas);

    this.update();
    this.render();
  }

  insert(text: string)
  {
    const begin = this._anchor < this._focus ? this._anchor : this._focus;
    const end   = this._anchor > this._focus ? this._anchor : this._focus;

    const characters = text.split('').map(value => this.create_character(value));

    this.document.splice(begin, end - begin, ...characters);

    this.set_focus(begin + characters.length);

    this.update();

    this.render();
  }

  erase()
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

  delete_backward()
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

  delete_forward()
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

  anchor_capture()
  {
    this.select = true;
  }

  anchor_release()
  {
    this.select = false;
  }

  focus_by(x: number, y: number)
  {
    // 首先根据 y 找到行

    // 记事本模式没有其他元素，只有单纯的行
    // 所以就仅比较单纯的行中线即可

    const baselines = this.rows.map(row => row.baseline);
    const midlines = baselines.map(baseline => baseline - this.font.height * 0.5);

    const index = Util.nearest(midlines, y);

    const offset = this.rows[index].offset_near(x);

    this.caret.to(index, offset);

    this.calculate_focus_by(this.caret.location);

    this.render();
  }

  caret_move_left()
  {
    if (!this.select && this._anchor !== this._focus)
    {
      const position = this._anchor < this._focus ? this._anchor : this._focus;

      this.set_focus(position);

      this.calculate_caret();
    }
    else
    {
      const location = this.location_by_backward();

      this.caret.to(location.index, location.offset);

      this.calculate_focus_by(this.caret.location);
    }

    this.render();
  }

  caret_move_right()
  {
    if (!this.select && this._anchor !== this._focus)
    {
      const position = this._anchor > this._focus ? this._anchor : this._focus;

      this.set_focus(position);

      this.calculate_caret();
    }
    else
    {
      const location = this.location_by_forward();

      this.caret.to(location.index, location.offset);

      this.calculate_focus_by(this.caret.location);
    }

    this.render();
  }

  caret_move_up()
  {
    if (!this.select && this._anchor !== this._focus)
    {
      const position = this._anchor < this._focus ? this._anchor : this._focus;

      this.set_focus(position);

      this.calculate_caret();
    }
    else
    {
      let index  = this.caret.location.index;
      let offset = this.caret.location.offset;

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

      this.caret.to(index, offset);

      this.calculate_focus_by(this.caret.location);
    }

    this.render();
  }

  caret_move_down()
  {
    if (!this.select && this._anchor !== this._focus)
    {
      const position = this._anchor > this._focus ? this._anchor : this._focus;

      this.set_focus(position);

      this.calculate_caret();
    }
    else
    {
      let index  = this.caret.location.index;
      let offset = this.caret.location.offset;

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

      this.caret.to(index, offset);

      this.calculate_focus_by(this.caret.location);
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

  render()
  {
    this.renderer.draw_rectangle(this.bounding, '#ececec');

    for (const row of this.rows)
    {
      row.draw(this.renderer, this.font);
    }

    let x = 0;

    const location = this.caret.location;

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

    this.caret.draw(this.renderer, this.font, x, row.baseline);
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
    let index  = this.caret.location.index;
    let offset = this.caret.location.offset;

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
    let index  = this.caret.location.index;
    let offset = this.caret.location.offset;

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

  private calculate_caret()
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
        this.caret.to(i, length - n + this._focus);

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

  private update()
  {
    // 使用文档结构，更新绘制结构

    let x        = 0;
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

        x         = 0;
        baseline += this.font.height * 1.2;

        row = new Row(this.font, baseline);

        this.rows.push(row);

        continue;
      }

      if (x + character.width >= this.bounding.right)
      {
        x         = 0;
        baseline += this.font.height * 1.2;

        row = new Row(this.font, baseline);

        this.rows.push(row);
      }

      character.x        = x;
      character.baseline = baseline;

      row.characters.push(character);

      x += character.width;
    }

    this.calculate_caret();
  }

  private readonly document: Character[];

  private select: boolean = false;

  private _anchor: number = 0;
  private _focus:  number = 0;

  private rows: Row[];

  private bounding!: Rectangle;

  private     font!: Font;

  private renderer!: Renderer;
}
