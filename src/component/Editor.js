import React, { useEffect, useRef } from 'react'
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
//hum simple text editor vi use kr sakte he
//lekin jo highlight wala fature wagera...and baki sab feature text editor ke woh sab nai ayenge 
//so we do--hum codemirror ko iss textarea se connect krenge
//ye code mirror us text area ko fulyfeature ediotr ke andar



const Editor = ({ socketRef, roomId, onCodeChange }) => {

  console.log("hii")
  //hum jo vi text type kr rahe he hume usse capture krna he
  //jo hume apne editor ke upar event listenr lagana hoga
  //so hume apne editor ke reference ko store krna hoga
  const editorRef=useRef(null)


  const texteditor=useRef(null)

  useEffect(()=>{

    console.log(texteditor.current)
async function init(){
editorRef.current=  Codemirror.fromTextArea(
  texteditor.current,
    {
        mode: { name: 'javascript', json: true },
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
    }
);

editorRef.current.on('change',(instance,changes)=>{
  console.log(changes)
  const { origin } = changes;
  //origin se humne pta lagta he kis type ki event trigger hui he

  const code = instance.getValue();
  onCodeChange(code)
   if (origin !== 'setValue') {
    socketRef.current.emit("code-change", {
      roomId,
      code,
  });
   }
})


}
init()
},[texteditor])

useEffect(() => {
  if (socketRef.current) {
      socketRef.current.on("code-change", ({ code }) => {
          if (code !== null) {
              editorRef.current.setValue(code);
          }
      });
  }

  //HUM UNSCRIBE VI KR RAHE HE
  return () => {
      socketRef.current.off("code-change");
  };
}, [socketRef.current]);
  
    return <textarea ref={texteditor} id="realtimeEditor"></textarea>;

}

export default Editor