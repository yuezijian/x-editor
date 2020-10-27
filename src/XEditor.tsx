import React from 'react';

import Editor       from './editor/Editor';
import InputAdapter from './editor/InputAdapter';

const editor = new Editor();

const adapter = new InputAdapter(editor);


function XEditor()
{
  const [size] = React.useState({ width: 1200, height: 550 })

  const input  = React.useRef() as React.MutableRefObject<HTMLInputElement>;
  const canvas = React.useRef() as React.MutableRefObject<HTMLCanvasElement>;

  const element =

    <div style={ { touchAction: 'none' } }>
      <
        canvas
        ref           = { canvas }
        style         = { { width: size.width, height: size.height, touchAction: '' } }
        width         = { size.width  * 2 }
        height        = { size.height * 2 }
        onClick       = { event => adapter.click(event.nativeEvent) }
        onPointerDown = { event => adapter.pointer_down(event.nativeEvent) }
        onPointerUp   = { event => adapter.pointer_up(event.nativeEvent) }
        onPointerMove = { event => adapter.pointer_move(event.nativeEvent) }
        // onWheel     = { event => adapter.wheel(event.nativeEvent) }
      />
      <p/>
      <
        input
        ref                 = { input }
        type                = 'text'
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

    canvas.current.addEventListener('mousewheel', event => adapter.wheel(event as WheelEvent), { passive: false });

    editor.insert('HTML5 Canvas 电子病历编辑器\n\n需要创建若干测试，以保证在后续开发过程中，已有行为的正确性。\n\n');

    editor.insert('0123456789\nabcdefghijklmnopqrstuvwxyz\nABCDEFGHIJKLMNOPQRSTUVWXYZ\n');
    editor.insert('岳子剑\n');
    editor.insert('12345\n');
    editor.insert('这是一个测试\n');
    editor.insert('abc\n');

    editor.insert('\n');

    for (let i = 0; i < 20; ++i)
    {
      editor.insert(`${ i + 1 } 好多行\n`);
    }
  };

  React.useEffect(setup, []);

  return element;
}


export default XEditor;

