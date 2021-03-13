import React from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-csharp';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/snippets/csharp';
import 'ace-builds/src-noconflict/snippets/python';
import 'ace-builds/src-noconflict/snippets/java';
import 'ace-builds/src-noconflict/snippets/c_cpp';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/theme-xcode';

export default function CodeEditor({ language, code, onCodeChange, width }) {
  return (
    <>
      <AceEditor
        placeholder="Write your code here..."
        mode={language.toLowerCase()}
        theme="xcode"
        name="blah2"
        onChange={onCodeChange}
        fontSize={14}
        showPrintMargin
        showGutter
        highlightActiveLine
        value={code}
        width={width}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
        }}
       />
    </>
  );
}
