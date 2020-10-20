import React from 'react';

import Editor       from './editor/Editor';
import InputAdapter from './editor/InputAdapter';

const editor = new Editor();

const adapter = new InputAdapter(editor);


function XEditor()
{
  const [size] = React.useState({ width: 640, height: 480 })

  const input  = React.useRef() as React.MutableRefObject<HTMLInputElement>;
  const canvas = React.useRef() as React.MutableRefObject<HTMLCanvasElement>;

  const element =

    <div>
      <
        canvas
        ref         = { canvas }
        style       = { { width: size.width, height: size.height } }
        width       = { size.width  * 2 }
        height      = { size.height * 2 }
        onClick     = { event => adapter.click(event.nativeEvent) }
        onMouseDown = { event => adapter.mouse_down(event.nativeEvent) }
        onMouseUp   = { event => adapter.mouse_up(event.nativeEvent) }
        onMouseMove = { event => adapter.mouse_move(event.nativeEvent) }
      />
      <
        input
        ref                 = { input }
        type                = 'text'
        // value               = ''
        style               = { { opacity: 1 } }
        onInput             = { event => adapter.input(event.nativeEvent as InputEvent) }
        onCopy              = { event => adapter.copy(event.nativeEvent) }
        onCut               = { event => adapter.cut(event.nativeEvent) }
        onPaste             = { event => adapter.paste(event.nativeEvent) }
        onCompositionStart  = { event => adapter.composition_start(event.nativeEvent) }
        onCompositionUpdate = { event => adapter.composition_update(event.nativeEvent) }
        onCompositionEnd    = { event => adapter.composition_end(event.nativeEvent) }
        onKeyDown           = { event => adapter.key_down(event.nativeEvent) }
        onKeyUp             = { event => adapter.key_up(event.nativeEvent) }
        onChange            = { event => adapter.change(event.nativeEvent) }
      />
    </div>
  ;

  const setup = () =>
  {
    adapter.target = input.current;

    editor.attach(canvas.current);

    // editor.insert('12345\n');
    // editor.insert('这是一个测试\n');
    // editor.insert('abc\n');
    editor.insert('HTML5 Canvas 电子病历编辑器\n\n需要创建若干测试，以保证在后续开发过程中，已有行为的正确性。\n\n0123456789\nabcdefghijklmnopqrstuvwxyz\nABCDEFGHIJKLMNOPQRSTUVWXYZ\n\n岳子剑\n');
  };

  React.useEffect(setup, []);

  return element;
}


export default XEditor;

