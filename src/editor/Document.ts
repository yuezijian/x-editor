import Text from './Text';


export default class Document
{
  data: Text[] = [];

  constructor()
  {
    console.log('Document');
  }

  insert(text: Text)
  {
    this.data.push(text);
  }

  // splice(begin: number, end: number, data: Text[]): void
  // {
  //   if (begin === end)
  //   {
  //     // 根据 begin 找到某个 Text 的 某个 Character
  //     // 插入新内容，如果新内容和原对象字体不同，分开原对象，插入新 data 和分开之后的对象
  //     ;
  //   }
  //   else
  //   {
  //     // 根据 begin 找到某个 Text 的 某个 Character，截断
  //   }
  // }
}
