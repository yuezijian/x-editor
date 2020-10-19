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

  delete_backward()
  {
    if (this._anchor !== this._focus)
    {
      const begin = this._anchor < this._focus ? this._anchor : this._focus;
      const end   = this._anchor > this._focus ? this._anchor : this._focus;

      this.set_focus(begin);

      this.document.splice(begin, end - begin);
    }
    else
    {
      if (this._focus - 1 >= 0)
      {
        this.set_focus(this._focus - 1);

        this.document.splice(this._focus, 1);
      }
    }

    this.update();

    this.render();
  }

  delete_forward()
  {
    if (this._anchor !== this._focus)
    {
      const begin = this._anchor < this._focus ? this._anchor : this._focus;
      const end   = this._anchor > this._focus ? this._anchor : this._focus;

      this.set_focus(begin);

      this.document.splice(begin, end - begin);
    }
    else
    {
      if (this._focus + 1 <= this.document.length)
      {
        this.document.splice(this._focus, 1);
      }
    }

    this.update();

    this.render();
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
    const location = this.location_by_backward();

    this.caret.to(location.index, location.offset);

    this.calculate_focus_by(this.caret.location);

    this.render();
  }

  caret_move_right()
  {
    const location = this.location_by_forward();

    this.caret.to(location.index, location.offset);

    this.calculate_focus_by(this.caret.location);

    this.render();
  }

  caret_move_up()
  {
    let index  = this.caret.location.index;
    let offset = this.caret.location.offset;

    const character = this.rows[index].characters[offset];

    if (index - 1 < 0)
    {
      offset = 0;
    }
    else
    {
      index -= 1;

      const x = character.x + character.width;

      offset = this.rows[index].offset_near(x);
    }

    this.caret.to(index, offset);

    this.calculate_focus_by(this.caret.location);

    this.render();
  }

  caret_move_down()
  {
    let index  = this.caret.location.index;
    let offset = this.caret.location.offset;

    const character = this.rows[index].characters[offset];

    if (index + 1 >= this.rows.length)
    {
      offset = this.rows[index].length;
    }
    else
    {
      index += 1;

      const x = character.x + character.width;

      offset = this.rows[index].offset_near(x);
    }

    this.caret.to(index, offset);

    this.calculate_focus_by(this.caret.location);

    this.render();
  }

  render()
  {
    this.renderer.draw_rectangle(this.bounding, '#ececec');

    for (const row of this.rows)
    {
      row.draw(this.renderer, this.font);
    }

    const location = this.caret.location;

    const character = this.rows[location.index].characters[location.offset];

    this.caret.draw(this.renderer, this.font, character.x + character.width, character.baseline);
  }

  private create_character(value: string)
  {
    const metrics = this.renderer.measure(this.font, value);

    return new Character(this.font, value, metrics);
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
      const length = this.rows[i].length;

      n += length;

      if (n >= this._focus)
      {
        this.caret.to(i, length - n + this._focus);

        break;
      }
    }
  }

  private calculate_focus_by(location: Location)
  {
    let offset = 0;

    for (let i = 0; i < location.index; ++i)
    {
      offset += this.rows[i].length;
    }

    offset += location.offset;

    this.set_focus(offset);
  }

  private update()
  {
    // 使用文档结构，更新绘制结构

    let x        = 0;
    let baseline = this.font.height + 4;

    let metrics = this.renderer.measure(this.font, '');

    let initial = new Character(this.font, '', metrics, baseline);

    let row = new Row(this.font, baseline, initial);

    this.rows = [row];  // 总是存在一个初始行

    for (const character of this.document)
    {
      if (x + character.width >= this.bounding.right)
      {
        x         = 0;
        baseline += this.font.height * 1.2;

        let metrics = this.renderer.measure(this.font, '');

        let initial = new Character(this.font, '', metrics, baseline);

        row = new Row(this.font, baseline, initial);

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
