if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let c={};const o=e=>i(e,t),l={module:{uri:t},exports:c,require:o};s[t]=Promise.all(n.map((e=>l[e]||o(e)))).then((e=>(r(...e),c)))}}define(["./workbox-209e5686"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"404.html",revision:"713be67cb9d4b23d4f046172f5b32e0c"},{url:"assets/index-BTTAuE7T.js",revision:null},{url:"assets/index-BtWPUX3K.css",revision:null},{url:"index.html",revision:"c5d3ce1aa671e477166ff4dd693e6b9f"},{url:"registerSW.js",revision:"34926bcf29dfd47503b96625d895c25f"},{url:"service-worker.js",revision:"08eb2182a3270c7a86c0e756b65f03b6"},{url:"manifest.webmanifest",revision:"9c6a22e8fdcf76f6a8dc3e829208efb1"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"))),e.registerRoute(/^https:\/\/api\.chatanywhere\.tech\/.*/i,new e.NetworkFirst({cacheName:"api-cache",plugins:[new e.ExpirationPlugin({maxEntries:50,maxAgeSeconds:86400}),new e.CacheableResponsePlugin({statuses:[0,200]})]}),"GET")}));
