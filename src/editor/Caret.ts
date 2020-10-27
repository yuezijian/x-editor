import Font      from './Font';
import Location  from './Location';
import Rectangle from './Rectangle';
import Renderer  from './Renderer';


export default class Caret
{
  location: Location = new Location();

  cache: number | null = null;

  to(path: number[], offset: number)
  {
    this.location.path   = path;
    this.location.offset = offset;
  }

  draw(renderer: Renderer, font: Font, x: number, baseline: number)
  {
    this.shape.left   = x;
    this.shape.right  = x + 3;
    this.shape.top    = baseline - font.height - 2;
    this.shape.bottom = baseline;

    renderer.draw_rectangle(this.shape, '#000000');
  }

  private shape: Rectangle = new Rectangle();
}
