import Editor from './Editor';


export default class InputAdapter
{
  constructor(editor: Editor)
  {
    this.editor = editor;
  }

  input(event: InputEvent)
  {
    if (!this.ime)
    {
      if (event.inputType === 'insertText')
      {
        this.editor.insert(event.data as string);
      }
    }
  }

  paste(event: ClipboardEvent)
  {
    const transfer = event.clipboardData as DataTransfer;

    this.editor.insert(transfer.getData('text'));
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

    this.editor.insert(event.data);
  }

  key_down(event: KeyboardEvent)
  {
    const key = event.key;

    if (key === 'Backspace')
    {
      if (!this.ime)
      {
        this.editor.delete_backward();
      }
    }

    if (key === 'Delete')
    {
      if (!this.ime)
      {
        this.editor.delete_forward();
      }
    }

    if (key === 'Shift')
    {
      this.editor.anchor_capture();
    }

    if (key === 'ArrowLeft')
    {
      if (!this.ime)
      {
        this.editor.caret_move_left();
      }

      return;
    }

    if (key === 'ArrowRight')
    {
      if (!this.ime)
      {
        this.editor.caret_move_right();
      }

      return;
    }

    if (key === 'ArrowUp')
    {
      if (!this.ime)
      {
        this.editor.caret_move_up();
      }

      return;
    }

    if (key === 'ArrowDown')
    {
      if (!this.ime)
      {
        this.editor.caret_move_down();
      }

      return;
    }

    if (key === 'Enter')
    {
      if (!this.ime)
      {
        this.editor.insert('\n');
      }
    }
  }

  key_up(event: KeyboardEvent)
  {
    const key = event.key;

    if (key === 'Shift')
    {
      this.editor.anchor_release();
    }
  }

  mouse_down(event: MouseEvent)
  {
    this.button = true;

    this.editor.focus_by(event.offsetX * 2, event.offsetY * 2);

    this.editor.anchor_capture();
  }

  mouse_up(event: MouseEvent)
  {
    this.button = false;

    this.editor.anchor_release();
  }

  mouse_move(event: MouseEvent)
  {
    if (this.button)
    {
      this.editor.focus_by(event.offsetX * 2, event.offsetY * 2);
    }
  }

  private editor: Editor;

  private button: boolean = false;

  private ime: boolean = false;
}
