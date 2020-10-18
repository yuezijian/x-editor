import Font      from './Font';
import Location  from './Location';
import Rectangle from './Rectangle';
import Renderer  from './Renderer';


export default class Caret
{
  anchor: Location = new Location();
  focus:  Location = new Location();

  constructor(renderer: Renderer)
  {
    this.renderer = renderer;
  }

  anchor_capture()
  {
    ;
  }

  anchor_release()
  {
    ;
  }

  draw(font: Font, x: number, baseline: number)
  {
    this.shape.left   = x;
    this.shape.right  = x + 3;
    this.shape.top    = baseline + 4 - font.height;
    this.shape.bottom = baseline + 4;

    this.renderer.draw_rectangle(this.shape, '#000000');
  }

  private shape: Rectangle = new Rectangle();

  private renderer: Renderer;
}
