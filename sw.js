if(!self.define){let e,i={};const s=(s,r)=>(s=new URL(s+".js",r).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(r,n)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(i[t])return;let o={};const l=e=>s(e,t),d={module:{uri:t},exports:o,require:l};i[t]=Promise.all(r.map((e=>d[e]||l(e)))).then((e=>(n(...e),o)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"404.html",revision:"713be67cb9d4b23d4f046172f5b32e0c"},{url:"assets/index-Cwjh4CpZ.css",revision:null},{url:"assets/index-DH3vdDFI.js",revision:null},{url:"index.html",revision:"bdee0d51e16180e1158a3a0870b843b2"},{url:"registerSW.js",revision:"34926bcf29dfd47503b96625d895c25f"},{url:"service-worker.js",revision:"08eb2182a3270c7a86c0e756b65f03b6"},{url:"manifest.webmanifest",revision:"9c6a22e8fdcf76f6a8dc3e829208efb1"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
