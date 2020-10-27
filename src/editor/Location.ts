export default class Location
{
  path: number[] = [];

  offset: number;

  constructor(path: number[] = [], offset: number = 0)
  {
    this.path   = path;
    this.offset = offset;
  }

  // equal(location: Location): boolean
  // {
  // }

  // static compare(left: Location, right: Location): number
  // {
  //   if (left.index !== right.index)
  //   {
  //     return left.index < right.index ? -1 : 1;
  //   }
  //
  //   if (left.offset !== right.offset)
  //   {
  //     return left.offset < right.offset ? -1 : 1;
  //   }
  //
  //   return 0;
  // }
}
