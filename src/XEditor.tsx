import React from 'react';

import Editor       from './editor/Editor';
import InputAdapter from './editor/InputAdapter';

const editor = new Editor();

const adapter = new InputAdapter(editor);


function XEditor()
{
  const [size] = React.useState({ width: 640, height: 480 })

  const reference = React.useRef() as React.MutableRefObject<HTMLCanvasElement>;

  const element =

    <div>
      <
        input
        type                = 'text'
        style               = { { opacity: 1 } }
        onInput             = { event => adapter.input(event.nativeEvent as InputEvent) }
        onPaste             = { event => adapter.paste(event.nativeEvent) }
        onCompositionStart  = { event => adapter.composition_start(event.nativeEvent) }
        onCompositionUpdate = { event => adapter.composition_update(event.nativeEvent) }
        onCompositionEnd    = { event => adapter.composition_end(event.nativeEvent) }
        onKeyDown           = { event => adapter.key_down(event.nativeEvent) }
        onKeyUp             = { event => adapter.key_up(event.nativeEvent) }
      />
      <p/>
      <
        canvas
        ref         = { reference }
        style       = { { width: size.width, height: size.height } }
        width       = { size.width  * 2 }
        height      = { size.height * 2 }
        onMouseDown = { event => adapter.mouse_down(event.nativeEvent) }
        onMouseUp   = { event => adapter.mouse_up(event.nativeEvent) }
        onMouseMove = { event => adapter.mouse_move(event.nativeEvent) }
      />
    </div>;

  const setup = () =>
  {
    editor.attach(reference.current);

    editor.insert('12345\n');
    editor.insert('这是一个测试\n');
    editor.insert('abc\n');
    // editor.insert('HTML5 Canvas 电子病历编辑器\n\n需要创建若干测试，以保证在后续开发过程中，已有行为的正确性。\n\n0123456789\nabcdefghijklmnopqrstuvwxyz\nABCDEFGHIJKLMNOPQRSTUVWXYZ\n\n岳子剑');
  };

  React.useEffect(setup, []);

  return element;
}


export default XEditor;
