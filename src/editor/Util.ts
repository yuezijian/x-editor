export default class Util
{
  static nearest(numbers: number[], value: number): number
  {
    let index = 0;

    let distance = Math.abs(value - numbers[0]);

    for (let i = 1; i < numbers.length; i++)
    {
      const d = Math.abs(value - numbers[i]);

      if (d < distance)
      {
        distance = d;
        index    = i;
      }
    }

    return index;
  }
}
