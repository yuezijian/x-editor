// const text =
//   {
//     align:
//       {
//         start: 'start',  // 默认值
//         end:   'end',
//
//         left:   'left',
//         right:  'right',
//         center: 'center',
//       },
//
//     baseline:
//       {
//         alphabetic:  'alphabetic',  // 默认值
//         hanging:     'hanging',
//         ideographic: 'ideographic',
//
//         top:    'top',
//         middle: 'middle',
//         bottom: 'bottom'
//       }
//   };


import Font      from './Font';
import Rectangle from './Rectangle';


class Renderer
{
  constructor(canvas: HTMLCanvasElement)
  {
    this.device = canvas.getContext('2d') as CanvasRenderingContext2D;

    this.device.textBaseline = 'bottom';
  }

  draw_horizontal(y: number, left: number, right: number, color: string = 'red'): void
  {
    this.device.strokeStyle = color;

    this.device.beginPath();

    this.device.moveTo( left, y);
    this.device.lineTo(right, y);

    this.device.stroke();
  }

  draw_vertical(x: number, top: number, bottom: number, color: string = 'red'): void
  {
    this.device.strokeStyle = color;

    this.device.beginPath();

    this.device.moveTo(x, top);
    this.device.lineTo(x, bottom);

    this.device.stroke();
  }

  draw_rectangle(rectangle: Rectangle, color: string): void
  {
    this.device.fillStyle = color;

    this.device.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
  }

  draw_text(font: Font, text: string, x: number, baseline: number, color: string = '#000000'): void
  {
    this.device.fillStyle = color;

    this.device.font = font.css();

    this.device.fillText(text, x, baseline);
  }

  measure(font: Font, text: string): number
  {
    this.device.font = font.css();

    return this.device.measureText(text).width;
  }

  identity()
  {
    this.device.resetTransform();
  }

  translate(x: number, y: number)
  {
    this.device.translate(x, y);
  }

  translate_to(x: number, y: number)
  {
    this.device.setTransform(1, 0, 0, 1, x, y);
  }

  save()
  {
    this.device.save();
  }

  restore()
  {
    this.device.restore();
  }

  private device: CanvasRenderingContext2D;
}


export default Renderer;
