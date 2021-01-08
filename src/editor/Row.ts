/*

行 概念 —— 如果未来支持竖排文字，比如蒙古文什么的，还会有【列】概念

一个行有唯一的基线，在一行的构建过程中，基线值可能会发生变化，取决于这一行中最高的那个字体

一行中包含多个【文本】的【段】

*/

import Box       from './Box';
import Character from './Character';
import Font      from './Font';
import Renderer  from './Renderer';
import Util      from './Util';


export default class Row
{
  baseline: number;

  characters: Character[];

  linebreak: Character | null = null;

  constructor(box: Box, baseline: number)
  {
    this.parent = box;

    this._x = this.parent.bound.left;

    this.baseline = baseline;

    this.characters = [];
  }

  get length(): number
  {
    return this.characters.length;
  }

  add(character: Character, on_full: (character: Character | null) => void)
  {
    if (character.value === '\n')
    {
      character.parent = this;
      character.x      = this._x;

      this.linebreak = character;

      on_full(null);

      return;
    }

    if (this.full_with(character))
    {
      on_full(character);

      return;
    }

    character.parent = this;
    character.x      = this._x;

    this.characters.push(character);

    this._x += character.width;
  }

  x_by(offset: number)
  {
    let x = 0;

    if (this.length > 0)
    {
      const character = this.characters[offset < this.length ? offset : this.length - 1];

      x = character.x;

      if (offset >= this.length)
      {
        x += character.width;
      }
    }

    return x;
  }

  offset_near(x: number): number
  {
    if (this.characters.length === 0)
    {
      return 0;
    }

    const xs = this.characters.map(character => character.x);

    // 增加一个末尾的数值

    const character = this.characters[this.characters.length - 1];

    xs.push(character.x + character.width)

    return Util.nearest(xs, x);
  }

  draw(renderer: Renderer, font: Font, debug: boolean = false): void
  {
    for (const character of this.characters)
    {
      if (character.select)
      {
        renderer.draw_rectangle(character.bound, '#a8cdf3');
      }

      renderer.draw_text(font, character.value, character.x, character.baseline);
    }

    if (this.linebreak !== null && this.linebreak.select)
    {
      renderer.draw_rectangle(this.linebreak.bound, '#a8cdf3');
    }

    if (debug && this.characters.length !== 0)
    {
      const left  = this.characters[0].x;
      const right = left + this.characters.reduce((width, character) => width + character.width, 0);

      renderer.draw_horizontal(this.baseline, left, right);
      renderer.draw_horizontal(this.baseline - font.height * 0.5, left, right);

      const centers = this.characters.map(character => character.center);

      centers.forEach(x => renderer.draw_vertical(x, this.baseline - font.height, this.baseline));
    }
  }

  private full_with(character: Character): boolean
  {
    return this._x + character.width >= this.parent.bound.right - this.parent.padding - this.parent.padding;
  }

  private parent: Box;

  private _x: number;
}
