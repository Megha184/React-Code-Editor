import * as esbuild from 'esbuild-wasm'
import axios from 'axios'
import localforage from 'localforage'

export const fetchPlugin = (inputCode:string)=>
{
    return{
    name:'fetch-plugin',
    setup(build:esbuild.PluginBuild)
    {
        const fileCache = localforage.createInstance({
       name:'filecache'
    });
    
        build.onLoad({filter:/(^index\.js$)/},()=>
        {
            return{
            loader:'jsx',
            contents:inputCode,
            };
        }); 
    build.onLoad({filter:/.*/},async(args:any)=>
    {
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
         if(cachedResult)
              return cachedResult;
    })
    build.onLoad({ filter: /.*/ }, async (args: any) => {
       
      //what axios returns from a api
      const{data,request} = await axios.get(args.path);

      //store response if not been visited otherwise return from cache
      
     
      const result:esbuild.OnLoadResult={
        loader:'jsx', 
        contents:data,
        resolveDir:new URL('./',request.responseURL).pathname,   //gives /nested-test-pkg/src/
      }
      await fileCache.setItem(args.path,result);
      return result;
    });
    build.onLoad({filter:/.css$/},async(args:any)=>
    {
      //what axios returns from a api
      const{data,request} = await axios.get(args.path);

      //store response if not been visited otherwise return from cache
      
      const escaped = data.replace(/\n/g,'').replace(/"/g,'\\"').replace(/'/g,"\\'");
      const contents =
      `const style = document.createElement('style');
      style.innerText = '${escaped};
      document.head.appendChild(style);
      `;
      const result:esbuild.OnLoadResult={
        loader:'jsx', 
        contents,
        resolveDir:new URL('./',request.responseURL).pathname,   //gives /nested-test-pkg/src/
      }
      await fileCache.setItem(args.path,result);
      return result;

      }); 


    
/* import message from 'tiny-test-pkg' does not work as esbuild has no idea 
how to fetch this package  */

     
/* we can write this is es build as well like import React,{useState} from 'react **/

        /* I am trying to import package  from unpkg tiny testpkg
        } else {
          return {
            loader: 'jsx',
            contents: 'export default "hi there!"',
          }; 
       } **/
      
       /* Here typescript doesn't understand the result getItem will return
      so to remove this error const cachedResult = await fileCache.getItem(args.path); we use
      <> */
     
    }
}
}