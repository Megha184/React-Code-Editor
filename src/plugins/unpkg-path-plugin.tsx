import * as esbuild from 'esbuild-wasm';

/* Whatever instance we are creating here we will need to call that instance for 
that key , we can create multiple instances using diff names*/


// (async()=>
// {
//   await fileCache.setItem('color','red');
//   const color = await fileCache.getItem('color');
//   const c = await localforage.getItem('color');
//   console.log(color);
//   console.log(c);
// })() 
export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
  /* onResolve and onLoad has a regular expression which tells
  when to run onResolve and when to run onLoad **/

  // Suppose we want to use onLoad function only on the namespace a given in 
  // onResolve then in onLoad({filter:/.*/,namespace:'a'})

  /* If I give namespace 'b' in onLoad then it will break as the files on 
  onResolve has a namespace a */

    setup(build: esbuild.PluginBuild) {
      //handles root entry file of index.js
      build.onResolve({filter:/(^index\.js$)/},()=>
      {
         return {path:'index.js',namespace:'a'};
      })
      //handles relative paths in module
      build.onResolve({filter:/^\.+\//},(args:any)=>
      {
            return{
          namespace: 'a',
          path: new URL(args.path,'https://www.unpkg.com'+args.resolveDir+'/').href
        };
      })
      //handle main file of a module  (module = require whatever we put in textbox)
      build.onResolve({ filter: /.*/ }, async (args: any) => {
      //always use bracket after return in same line
      /*return
      {

      }  won't work */
    return {namespace:'a',path:`https://unpkg.com/${args.path}`};
    //instead of hard code just return
    // else if(args.path === 'tiny-test-pkg')
    // {
    //   return {path:'https://unpkg.com/tiny-test-pkg@1.0.0/index.js',namespace:'a'}
    // }
     });
     


    },
  };
};
