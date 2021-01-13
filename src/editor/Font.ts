export default class Font
{
  family: string;

  height: number;

  constructor(family: string, height: number)
  {
    this.family = family;
    this.height = height;
  }

  get css(): string
  {
    return `${ this.height }px ${ this.family }`;
  }

  get vertical_space(): number
  {
    return this.height * 1.5;
  }

  equal(font: Font): boolean
  {
    return this.family === font.family && this.height === font.height;
  }
}
