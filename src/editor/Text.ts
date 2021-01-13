import Character from './Character';
import Font      from './Font';


export default class Text
{
  font: Font;

  characters: Character[] = [];

  constructor(font: Font, value: string)
  {
    this.font = font;
  }
}
