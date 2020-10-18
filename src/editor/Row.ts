import Character from './Character';
import Font      from './Font';
import Renderer  from './Renderer';
import Util      from './Util';


export default class Row
{
  baseline: number;

  characters: Character[];

  constructor(baseline: number)
  {
    this.baseline = baseline;

    this.characters = [new Character('', 0, baseline)];
  }

  get length(): number
  {
    return this.characters.length - 1;
  }

  offset_near(x: number): number
  {
    const xs = this.characters.map(character => character.x + character.width);

    return Util.nearest(xs, x);
  }

  draw(renderer: Renderer, font: Font, debug: boolean = false)
  {
    for (const character of this.characters)
    {
      renderer.draw_text(font, character.value, character.x, character.baseline);
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
