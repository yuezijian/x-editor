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

  attach(canvas: HTMLCanvasElement)
  {
    this.bounding = new Rectangle();

    this.bounding.right  = canvas.width;
    this.bounding.bottom = canvas.height;

    canvas.style.cursor = 'text';

    this.font = new Font('courier', 32);

    this.renderer = new Renderer(canvas);

    this.caret = new Caret(this.renderer);

    this.update();
  }

  insert(text: string)
  {
    // 首先更改的是文档数据，然后根据文档数据生成绘制数据

    for (const value of text)
    {
      const width = this.renderer.measure(this.font, value);

      const character = new Character(value, width);

      this.document.splice(this.offset, 0, character);

      this.offset += 1;
    }

    this.update();

    this.render();
  }

  delete_backward()
  {
  }

  delete_forward()
  {
  }

  focus(x: number, y: number)
  {
    // 首先根据 y 找到行

    // 记事本模式没有其他元素，只有单纯的行
    // 所以就仅比较单纯的行中线即可

    const baselines = this.rows.map(row => row.baseline);
    const midlines = baselines.map(baseline => baseline - this.font.height * 0.5);

    const index = Util.nearest(midlines, y);

    const offset = this.rows[index].offset_near(x);

    this.caret.focus.index  = index;
    this.caret.focus.offset = offset;

    this.reset_offset_by(this.caret.focus);

    this.render();
  }

  caret_move_left()
  {
    let index  = this.caret.focus.index;
    let offset = this.caret.focus.offset;

    if (offset - 1 < 0)
    {
      if (index - 1 < 0)
      {
        return;
      }

      index -= 1;

      const row = this.rows[index];

      offset = row.length;
    }
    else
    {
      offset -= 1;
    }

    this.caret.focus.index  = index;
    this.caret.focus.offset = offset;

    this.reset_offset_by(this.caret.focus);

    this.render();
  }

  caret_move_right()
  {
    let index  = this.caret.focus.index;
    let offset = this.caret.focus.offset;

    const row = this.rows[index];

    if (offset + 1 > row.length)
    {
      if (index + 1 >= this.rows.length)
      {
        return;
      }

      index  += 1;
      offset  = 0;
    }
    else
    {
      offset += 1;
    }

    this.caret.focus.index  = index;
    this.caret.focus.offset = offset;

    this.reset_offset_by(this.caret.focus);

    this.render();
  }

  caret_move_up()
  {
    let index  = this.caret.focus.index;
    let offset = this.caret.focus.offset;

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

    this.caret.focus.index  = index;
    this.caret.focus.offset = offset;

    this.reset_offset_by(this.caret.focus);

    this.render();
  }

  caret_move_down()
  {
    let index  = this.caret.focus.index;
    let offset = this.caret.focus.offset;

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

    this.caret.focus.index  = index;
    this.caret.focus.offset = offset;

    this.reset_offset_by(this.caret.focus);

    this.render();
  }

  render()
  {
    this.renderer.draw_rectangle(this.bounding, '#ececec');

    for (const row of this.rows)
    {
      row.draw(this.renderer, this.font);
    }

    const location = this.caret.focus;

    const character = this.rows[location.index].characters[location.offset];

    this.caret.draw(this.font, character.x + character.width, character.baseline);
  }

  private update()
  {
    // 使用文档结构，更新绘制结构

    let x        = 0;
    let baseline = this.font.height;

    let row = new Row(baseline);

    this.rows = [row];  // 总是存在一个初始行

    for (const character of this.document)
    {
      if (x + character.width >= this.bounding.right)
      {
        x         = 0;
        baseline += this.font.height * 1.2;

        row = new Row(baseline);

        this.rows.push(row);
      }

      character.x        = x;
      character.baseline = baseline;

      row.characters.push(character);

      x += character.width;
    }

    this.reset_caret();
  }

  private reset_caret()
  {
    // 计算光标位置

    let n = 0;

    for (let i = 0; i < this.rows.length; ++i)
    {
      const length = this.rows[i].length;

      n += length;

      if (n >= this.offset)
      {
        this.caret.focus.index  = i;
        this.caret.focus.offset = length - n + this.offset;

        break;
      }
    }
  }

  private reset_offset_by(location: Location)
  {
    let offset = 0;

    for (let i = 0; i < location.index; ++i)
    {
      offset += this.rows[i].length;
    }

    offset += location.offset;

    this.offset = offset;
  }

  private readonly document: Character[];

  private offset: number = 0;

  private rows: Row[];

  private bounding!: Rectangle;

  private     font!: Font;

  private renderer!: Renderer;

  private    caret!: Caret;
}
