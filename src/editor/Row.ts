import Character from './Character';
import Font      from './Font';
import Renderer  from './Renderer';
import Util      from './Util';


export default class Row
{
  baseline: number;

  characters: Character[];

  linebreak: Character | null = null;

  constructor(font: Font, baseline: number)
  {
    this.baseline = baseline;

    this.characters = [];
  }

  get length(): number
  {
    return this.characters.length;
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

  draw(renderer: Renderer, font: Font, debug: boolean = false)
  {
    for (const character of this.characters)
    {
      if (character.select)
      {
        renderer.draw_rectangle(character.bounding, '#a8cdf3');
      }

      renderer.draw_text(font, character.value, character.x, character.baseline);
    }

    if (this.linebreak !== null && this.linebreak.select)
    {
      renderer.draw_rectangle(this.linebreak.bounding, '#a8cdf3');
    }

    if (debug)
    {
      const left  = this.characters[0].x;
      const right = left + this.characters.reduce((width, character) => width + character.width, 0);

      renderer.draw_horizontal(this.baseline, left, right);
      renderer.draw_horizontal(this.baseline - font.height * 0.5, left, right);

      const centers = this.characters.map(character => character.center);

      centers.forEach(x => renderer.draw_vertical(x, this.baseline - font.height, this.baseline));
    }
  }
}
