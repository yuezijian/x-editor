export default class Location
{
  index:  number;
  offset: number;

  constructor(index: number = 0, offset: number = 0)
  {
    this.index  = index;
    this.offset = offset;
  }

  equal(location: Location): boolean
  {
    return this.index === location.index && this.offset === location.offset;
  }

  static compare(left: Location, right: Location): number
  {
    if (left.index !== right.index)
    {
      return left.index < right.index ? -1 : 1;
    }

    if (left.offset !== right.offset)
    {
      return left.offset < right.offset ? -1 : 1;
    }

    return 0;
  }
}
