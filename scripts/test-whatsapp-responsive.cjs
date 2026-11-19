const {firefox}=require("playwright");
const {readFileSync,readdirSync}=require("node:fs");
const ts=require("typescript");
const assert=require("node:assert/strict");

async function run(){
  const browser=await firefox.launch();
  try {
    for (const width of [360,1280]) {
      const page=await browser.newPage({viewport:{width,height:800}});
      await page.route("http://localhost:37689/**",route=>{
        const url=new URL(route.request().url());
        if(url.pathname==="/") return route.fulfill({contentType:"text/html",body:'<meta name="viewport" content="width=device-width"><main id="root"></main>'});
        if(url.pathname.endsWith("/accounts")) return route.fulfill({json:{accounts:[{id:"fixture",label:"QA",state:"Disconnected"}]}});
        if(url.pathname.endsWith("/messages")) return route.fulfill({json:{contacts:[],templates:[],jobs:[],counts:[]}});
        return route.abort();
      });
      await page.goto("http://localhost:37689/");
      for(const file of readdirSync(".next/static/css").filter(f=>f.endsWith(".css")))
        await page.addStyleTag({path:".next/static/css/"+file});
      await page.addScriptTag({path:"node_modules/react/umd/react.production.min.js"});
      await page.addScriptTag({path:"node_modules/react-dom/umd/react-dom.production.min.js"});
      await page.addScriptTag({content:"window.mods={react:React};"});
      for(const name of ["zones","History","Messages","page"]) {
        const src=readFileSync(name==="zones"?"src/lib/whatsapp/zones.ts":"src/app/admin/whatsapp/"+name+".tsx","utf8");
        const js=ts.transpileModule(src,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,
          target:ts.ScriptTarget.ES2022}}).outputText;
        await page.addScriptTag({content:`(()=>{const exports={};const jsx=(type,props,key)=>React.createElement(type,{...props,key});const require=id=>id==="react/jsx-runtime"?{jsx,jsxs:jsx,Fragment:React.Fragment}:mods[id];${js};mods["./${name}"]=exports;})();`});
        if(name==="zones") await page.evaluate(()=>mods["@/lib/whatsapp/zones"]=mods["./zones"]);
      }
      await page.evaluate(()=>ReactDOM.createRoot(document.querySelector("#root")).render(React.createElement(mods["./page"].default)));
      await page.getByText("No matching recent messages.").waitFor();
      await page.getByRole("button",{name:"Queue message"}).waitFor();
      assert.equal(await page.getByRole("button",{name:"Queue message"}).isDisabled(),true);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,"Horizontal overflow at "+width);
      console.log("Fixture dashboard passed at "+width+"px");
      await page.close();
    }
  } finally {await browser.close();}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
