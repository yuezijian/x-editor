import Box       from './Box';
import Caret     from './Caret';
import Character from './Character';
import Document  from './Document';
import Font      from './Font';
import Location  from './Location';
import Rectangle from './Rectangle';
import Renderer  from './Renderer';
import Text      from './Text';


const PageWidth  = 500;
const PageHeight = 600;


export default class Editor
{
  // private data: string[] = [];
  private data: Character[] = [];

  private document: Document;

  font: Font = new Font('courier', 30);

  padding: number = 40;

  constructor()
  {
    console.log('Editor constructor');

    this.document = new Document();

    const font1 = new Font('courier', 20);
    const font2 = new Font('courier', 30);
    const font3 = new Font('courier', 40);

    const text1 = new Text(font1, '123');
    const text2 = new Text(font2, '测试');
    const text3 = new Text(font3, 'abc');

    this.document.insert(text1);
    this.document.insert(text2);
    this.document.insert(text3);
  }

  attach(canvas: HTMLCanvasElement): void
  {
    this._bound = new Rectangle();

    this._bound.right  = canvas.width;
    this._bound.bottom = canvas.height;

    canvas.style.cursor = 'text';

    this.renderer = new Renderer(canvas);

    this.update();

    this.render();
  }

  insert(text: string): void
  {
    const { begin, end } = this.caret_range();

    const characters = text.split('').map(value => this.create_character(value));

    this.data.splice(begin, end - begin, ...characters);

    this.select = false;

    this.set_document_focus(begin + characters.length);

    this.update();

    this.render();
  }

  erase(): void
  {
    if (this._anchor !== this._focus)
    {
      const { begin, end } = this.caret_range();

      this.data.splice(begin, end - begin);

      this.set_document_focus(begin);

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

        this.set_document_focus(this._focus - 1);

        this.anchor_release();
      }
    }

    this.erase();
  }

  delete_forward(): void
  {
    if (this._anchor === this._focus)
    {
      if (this._focus + 1 <= this.data.length)
      {
        this.anchor_capture();

        this.set_document_focus(this._focus + 1);

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
    for (let i = 0; i < this.pages.length; ++i)
    {
      const page = this.pages[i];

      const location = page.focus(x, y + this.view_y);

      if (location)
      {
        this.caret_to([i, ...location.path], location.offset);

        this.calculate_document_offset_by(this._caret.location);

        break;
      }
    }

    this.render();
  }

  caret_move_left(): void
  {
    this._caret.cache = null;

    if (!this.select && this._anchor !== this._focus)
    {
      const position = this._anchor < this._focus ? this._anchor : this._focus;

      this.set_document_focus(position);

      this.calculate_caret_by_document_focus();
    }
    else
    {
      const location = this.location_by_backward();

      this.caret_to(location.path, location.offset);

      this.calculate_document_offset_by(this._caret.location);
    }

    this.render();
  }

  caret_move_right(): void
  {
    this._caret.cache = null;

    if (!this.select && this._anchor !== this._focus)
    {
      const position = this._anchor > this._focus ? this._anchor : this._focus;

      this.set_document_focus(position);

      this.calculate_caret_by_document_focus();
    }
    else
    {
      const location = this.location_by_forward();

      this.caret_to(location.path, location.offset);

      this.calculate_document_offset_by(this._caret.location);
    }

    this.render();
  }

  caret_move_up(): void
  {
    if (!this.select && this._anchor !== this._focus)
    {
      this._caret.cache = null;

      const position = this._anchor < this._focus ? this._anchor : this._focus;

      this.set_document_focus(position);

      this.calculate_caret_by_document_focus();
    }
    else
    {
      let i_page = this._caret.location.path[0];
      let i_row  = this._caret.location.path[1];

      let offset = this._caret.location.offset;

      const x = this._caret.cache ? this._caret.cache : this.pages[i_page].rows[i_row].x_by(offset);

      this._caret.cache = x;

      if (i_row - 1 < 0)
      {
        if (i_page - 1 < 0)
        {
          offset = 0;
        }
        else
        {
          i_page -= 1;
          i_row   = this.pages[i_page].rows.length - 1;

          offset = this.pages[i_page].rows[i_row].offset_near(x);
        }
      }
      else
      {
        i_row -= 1;

        offset = this.pages[i_page].rows[i_row].offset_near(x);
      }

      this.caret_to([i_page, i_row], offset);

      this.calculate_document_offset_by(this._caret.location);
    }

    this.render();
  }

  caret_move_down(): void
  {
    if (!this.select && this._anchor !== this._focus)
    {
      this._caret.cache = null;

      const position = this._anchor > this._focus ? this._anchor : this._focus;

      this.set_document_focus(position);

      this.calculate_caret_by_document_focus();
    }
    else
    {
      let i_page = this._caret.location.path[0];
      let i_row  = this._caret.location.path[1];

      let offset = this._caret.location.offset;

      const x = this._caret.cache ? this._caret.cache : this.pages[i_page].rows[i_row].x_by(offset);

      this._caret.cache = x;

      if (i_row + 1 >= this.pages[i_page].rows.length)
      {
        if (i_page + 1 >= this.pages.length)
        {
          offset = this.pages[i_page].rows[i_row].length;
        }
        else
        {
          i_page += 1;
          i_row   = 0;

          offset = this.pages[i_page].rows[i_row].offset_near(x);
        }
      }
      else
      {
        i_row += 1;

        offset = this.pages[i_page].rows[i_row].offset_near(x);
      }

      this.caret_to([i_page, i_row], offset);

      this.calculate_document_offset_by(this._caret.location);
    }

    this.render();
  }

  selection(): string
  {
    if (this._anchor === this._focus)
    {
      return '';
    }

    const { begin, end } = this.caret_range();

    const characters = this.data.slice(begin, end);

    return characters.map(character => character.value).join('');
  }

  scroll(value: number): void
  {
    this.view_y += value;

    if (this.view_y < 0)
    {
      this.view_y = 0;
    }

    let y = 0;

    y += this.padding;
    y += PageHeight;
    y += (PageHeight + 20) * (this.pages.length - 1);
    y += this.padding;
    y -= this._bound.height;

    if (y < 0)
    {
      y = 0;
    }

    if (this.view_y > y)
    {
      this.view_y = y;
    }

    this.render();
  }

  seek_to_begin(): void
  {
    this.set_document_focus(0);

    this.calculate_caret_by_document_focus();
  }

  seek_to_end(): void
  {
    this.set_document_focus(this.data.length);

    this.calculate_caret_by_document_focus();
  }

  render(): void
  {
    this.renderer.identity();

    this.renderer.draw_rectangle(this._bound, '#ececec');

    this.renderer.translate(0, -this.view_y);

    for (let i = 0; i < this.pages.length; ++i)
    {
      const page = this.pages[i];

      page.draw(this.renderer);
    }

    const location = this._caret.location;

    const page = this.pages[location.path[0]];

    const row = page.rows[location.path[1]];

    let x = 0;

    if (row.length > 0)
    {
      let offset = location.offset;

      if (location.offset >= row.length)
      {
        offset = row.length - 1;
      }

      const character = row.characters[offset];

      x += character.x;

      if (location.offset >= row.length)
      {
        x += character.width;
      }
    }

    this.renderer.state_push();

    this.renderer.translate(page.origin_x, page.origin_y);

    this.renderer.state_push();

    this.renderer.translate(page.padding, page.padding);

    this._caret.draw(this.renderer, this.font, x, row.baseline);

    this.renderer.state_pop();

    this.renderer.state_pop();
  }

  private create_character(value: string): Character
  {
    const width = this.renderer.measure(this.font, value);

    return new Character(this.font, value, width);
  }

  private set_document_focus(value: number): void
  {
    this._focus = value;

    if (!this.select)
    {
      this._anchor = this._focus;
    }

    // 清除所有选择区域

    for (let i = 0; i < this.data.length; ++i)
    {
      this.data[i].select = false;
    }

    // 选择一段区域

    if (this._anchor !== this._focus)
    {
      const { begin, end } = this.caret_range();

      for (let i = begin; i < end; ++i)
      {
        this.data[i].select = true;
      }
    }
  }

  private location_by_backward(): Location
  {
    let i_page = this._caret.location.path[0];
    let i_row  = this._caret.location.path[1];

    let offset = this._caret.location.offset;

    if (offset - 1 < 0)
    {
      if (i_row - 1 < 0)
      {
        if (i_page - 1 < 0)
        {
          return new Location([0, 0], 0);
        }
        else
        {
          i_page -= 1;

          i_row = this.pages[i_page].rows.length - 1;

          offset = this.pages[i_page].rows[i_row].length;
        }
      }
      else
      {
        i_row -= 1;

        offset = this.pages[i_page].rows[i_row].length;
      }
    }
    else
    {
      offset -= 1;
    }

    return new Location([i_page, i_row], offset);
  }

  private location_by_forward(): Location
  {
    let i_page = this._caret.location.path[0];
    let i_row  = this._caret.location.path[1];

    let offset = this._caret.location.offset;

    if (offset + 1 > this.pages[i_page].rows[i_row].length)
    {
      if (i_row + 1 >= this.pages[i_page].rows.length)
      {
        if (i_page + 1 >= this.pages.length)
        {
          return new Location([i_page, i_row], offset);
        }
        else
        {
          i_page += 1;
          i_row   = 0;

          offset = 0;
        }
      }
      else
      {
        i_row += 1;

        offset = 0;
      }
    }
    else
    {
      offset += 1;
    }

    return new Location([i_page, i_row], offset);
  }

  private calculate_caret_by_document_focus(): void
  {
    // 计算光标位置

    let n = 0;

    for (let i_page = 0; i_page < this.pages.length; ++i_page)
    {
      const page = this.pages[i_page];

      const rows = page.rows;

      for (let i_row = 0; i_row < rows.length; ++i_row)
      {
        const row = rows[i_row];

        const length = row.length;

        n += length;

        if (n >= this._focus)
        {
          const path = [i_page, i_row];

          const offset = length - n + this._focus;

          this.caret_to(path, offset);

          return;
        }

        if (row.linebreak !== null)
        {
          n += 1;
        }
      }
    }
  }

  private calculate_document_offset_by(location: Location): void
  {
    let offset = 0;

    for (let i_page = 0; i_page < location.path[0]; ++i_page)
    {
      const page = this.pages[i_page];

      const rows = page.rows;

      for (let i_row = 0; i_row < rows.length; ++i_row)
      {
        const row = rows[i_row];

        offset += row.length;

        if (row.linebreak !== null)
        {
          offset += 1;
        }
      }
    }

    const page = this.pages[location.path[0]];

    const rows = page.rows;

    for (let i = 0; i < location.path[1]; ++i)
    {
      const row = rows[i];

      offset += row.length;

      if (row.linebreak !== null)
      {
        offset += 1;
      }
    }

    offset += location.offset;

    this.set_document_focus(offset);
  }

  private caret_to(path: number[], focus: number): void
  {
    this._caret.to(path, focus);

    let i_page = this._caret.location.path[0];
    let i_row  = this._caret.location.path[1];

    let y = 0;

    y += this.padding;
    y += (PageHeight + 20) * i_page;
    y += this.pages[i_page].padding;
    y += this.pages[i_page].rows[i_row].baseline;

    if (y < this.view_y + this.font.height + this.font.vertical_space)
    {
      this.view_y = y - this.font.height - this.font.vertical_space;
    }

    if (y > this.view_y + this._bound.height - this.font.vertical_space)
    {
      this.view_y = y - this._bound.height + this.font.vertical_space;
    }

    if (this.view_y < 0)
    {
      this.view_y = 0;
    }
  }

  private caret_range()
  {
    const begin = this._anchor < this._focus ? this._anchor : this._focus;
    const end   = this._anchor > this._focus ? this._anchor : this._focus;

    return { begin, end };
  }

  *characters_in_document()
  {
    let i = 0;

    while (i < 2)
    {
      yield i;

      i++;
    }
  }

  private update(): void
  {
    // 使用文档结构，更新绘制结构

    let index = 0;

    let page = new Box(this, PageWidth, PageHeight);

    page.origin_x = this.padding;
    page.origin_y = this.padding + (page.height + 20) * index;

    index += 1;

    this.pages = [page];

    const new_page_callback = (character: Character | null) =>
    {
      page = new Box(this, PageWidth, PageHeight);

      page.origin_x = this.padding;
      page.origin_y = this.padding + (page.height + 20) * index;

      index += 1;

      if (character)
      {
        page.add(character, new_page_callback);
      }

      this.pages.push(page);
    };

    for (const character of this.data)
    {
      page.add(character, new_page_callback);
    }

    this.calculate_caret_by_document_focus();
  }

  private select: boolean = false;

  private _anchor: number = 0;
  private _focus:  number = 0;

  private pages!: Box[];

  private _bound!: Rectangle;

  private _caret: Caret = new Caret();

  private renderer!: Renderer;

  private view_y: number = 0;
}
