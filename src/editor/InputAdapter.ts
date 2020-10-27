import Editor from './Editor';


export default class InputAdapter
{
  target!: HTMLInputElement;

  constructor(editor: Editor)
  {
    this._editor = editor;
  }

  input(event: InputEvent)
  {
    if (!this.ime)
    {
      if (event.inputType === 'insertText')
      {
        this._editor.insert(event.data as string);

        event.preventDefault();
      }
    }
  }

  copy(event: ClipboardEvent)
  {
    if (!this.ime)
    {
      const transfer = event.clipboardData as DataTransfer;

      transfer.setData('text/plain', this._editor.selection());

      event.preventDefault();
    }
  }

  cut(event: ClipboardEvent)
  {
    if (!this.ime)
    {
      const transfer = event.clipboardData as DataTransfer;

      const text = this._editor.selection();

      this._editor.erase();

      transfer.setData('text/plain', text);

      event.preventDefault();
    }
  }

  paste(event: ClipboardEvent)
  {
    const transfer = event.clipboardData as DataTransfer;

    this._editor.insert(transfer.getData('text/plain'));

    event.preventDefault();
  }

  composition_start(event: CompositionEvent)
  {
    this.ime = true;
  }

  composition_update(event: CompositionEvent)
  {
  }

  composition_end(event: CompositionEvent)
  {
    this.ime = false;

    this._editor.insert(event.data);
  }

  key_down(event: KeyboardEvent)
  {
    const key = event.key;

    if (key === 'Backspace')
    {
      if (!this.ime)
      {
        this._editor.delete_backward();
      }
    }

    if (key === 'Delete')
    {
      if (!this.ime)
      {
        this._editor.delete_forward();
      }
    }

    if (key === 'Shift')
    {
      this._editor.anchor_capture();
    }

    if (key === 'ArrowLeft')
    {
      if (!this.ime)
      {
        this._editor.caret_move_left();
      }

      return;
    }

    if (key === 'ArrowRight')
    {
      if (!this.ime)
      {
        this._editor.caret_move_right();
      }

      return;
    }

    if (key === 'ArrowUp')
    {
      if (!this.ime)
      {
        this._editor.caret_move_up();
      }

      return;
    }

    if (key === 'ArrowDown')
    {
      if (!this.ime)
      {
        this._editor.caret_move_down();
      }

      return;
    }

    if (key === 'Enter')
    {
      if (!this.ime)
      {
        this._editor.insert('\n');
      }
    }
  }

  key_up(event: KeyboardEvent)
  {
    const key = event.key;

    if (key === 'Shift')
    {
      this._editor.anchor_release();
    }
  }

  change(event: Event)
  {
  }

  click(event: MouseEvent)
  {
    this.target.focus();
  }

  pointer_down(event: PointerEvent)
  {
    this.button = true;

    this._editor.focus_by(event.offsetX * 2, event.offsetY * 2);

    const target = event.target as HTMLCanvasElement;

    target.setPointerCapture(event.pointerId);

    this._editor.anchor_capture();
  }

  pointer_up(event: PointerEvent)
  {
    this.button = false;

    const target = event.target as HTMLCanvasElement;

    target.releasePointerCapture(event.pointerId);

    this._editor.anchor_release();
  }

  pointer_move(event: PointerEvent)
  {
    if (this.button)
    {
      this._editor.focus_by(event.offsetX * 2, event.offsetY * 2);
    }
  }

  wheel(event: WheelEvent)
  {
    event.preventDefault();

    this._editor.scroll(event.deltaY);
  }

  private _editor: Editor;

  private button: boolean = false;

  private ime: boolean = false;
}
