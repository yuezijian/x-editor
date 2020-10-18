export default class Font
{
  family: string;

  height: number;

  constructor(family: string, height: number)
  {
    this.family = family;
    this.height = height;
  }

  css()
  {
    return `${ this.height }px ${ this.family }`;
  }
}
