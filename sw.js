if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let t={};const c=e=>s(e,o),d={module:{uri:o},exports:t,require:c};i[o]=Promise.all(n.map((e=>d[e]||c(e)))).then((e=>(r(...e),t)))}}define(["./workbox-209e5686"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"404.html",revision:"713be67cb9d4b23d4f046172f5b32e0c"},{url:"assets/index-BcIR7uv5.css",revision:null},{url:"assets/index-C207GSG2.js",revision:null},{url:"icons/icon.svg",revision:"aee1456df591700d6ae23f145b70e76c"},{url:"index.html",revision:"8713b2e3ca3092b3b3e98ed60cf2869c"},{url:"manifest.json",revision:"12c511a588845274851e52b700b9680c"},{url:"registerSW.js",revision:"34926bcf29dfd47503b96625d895c25f"},{url:"service-worker.js",revision:"d65050fcc05812aad757ffbf2392fef7"},{url:"vite.svg",revision:"8e3a10e157f75ada21ab742c022d5430"},{url:"icons/icon.svg",revision:"aee1456df591700d6ae23f145b70e76c"},{url:"manifest.webmanifest",revision:"fb9d88b55c68108b8ae7344443a31aad"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"))),e.registerRoute(/^https:\/\/freakingryan\.github\.io\/linguago-pwa\/.*/i,new e.NetworkFirst({cacheName:"site-cache",networkTimeoutSeconds:5,plugins:[new e.ExpirationPlugin({maxEntries:100,maxAgeSeconds:259200}),new e.CacheableResponsePlugin({statuses:[0,200]})]}),"GET")}));
//# sourceMappingURL=sw.js.map
