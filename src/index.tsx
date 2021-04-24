import ReactDom from 'react-dom'
import {useState,useEffect,useRef} from 'react'
import * as esbuild from 'esbuild-wasm'
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin'; //second set of brackets if for void function '
import {fetchPlugin} from './plugins/fetch-plugin'


const App =() =>
{
  const [input,setInput] = useState("");
  //const [code,setCode] = useState("");
  const ref = useRef<any>();
  const iframe = useRef<any>();

  // We need to use Service inside onClick so we can do this in two ways
  // Either by use State so it is accessible everywhere or we can use useref
  const startService = async() =>
  {
   ref.current = await esbuild.startService({
   worker:true,
   wasmURL:'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
});

}
  useEffect(()=>
  {
    startService();
  },[]);
  const onClick =async()=>
  { 
    if(!ref.current)  //service is ready or not
    {
      return;
    }
    const result=await ref.current.build({
      entryPoints:['index.js'],
      bundle:true,
      write:false,
      plugins:[unpkgPathPlugin(),fetchPlugin(input)],
      define:{'process.env.NODE_ENV':'"production"',   //we are getting this error 
      //in require('react') so we are doing this we are replacing it with string production indside single quote inside double quote
      global:'window',
    },
    });
    iframe.current.contentWindow.postMessage(result.outputFiles[0].text,'*');
    
    // const result = await ref.current.transform(input,{
    //   loader:'jsx',  //which language we are converting jsx/typescript
    //   target:'es2015'

    // });  
   //setCode(result.code);     //not handle any import or bundling only transpiling

  }
  const html =`
  <html>
   <head></head>
   <body>
   <div id="root"></div>
   <script>
   window.addEventListener('message',(event)=>{
    eval(event.data);
     },false);
  </script>
   </body>
   </html>
  `;
  return <div >
  <h1 style={{textAlign:'center'}}>React Code Editor</h1>
  <textarea  rows={4} cols={10} style={{backgroundColor:'black',color:'white',width:'700px',height:'600px',resize:'none'}} 
  onChange={(e)=>
  {
    setInput(e.target.value);
  }}>
  </textarea>
    <iframe title={"iframe"} style={{marginLeft:"50px",height:"600px",width:"700px"}} ref={iframe} srcDoc = {html} sandbox="allow-scripts"></iframe>
    <div>
      <button style={{width:"150px",height:"50px",backgroundColor:"green",color:"white"}} onClick={onClick}>Submit</button>
    </div>
    <div></div>
      </div>
}
ReactDom.render(<App/>,document.querySelector("#root"));
