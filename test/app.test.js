import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createServer } from '../server.js';

function request(port, path='/') { return new Promise((resolve,reject)=>{const req=http.get({hostname:'127.0.0.1',port,path},res=>{let body='';res.on('data',x=>body+=x);res.on('end',()=>resolve({status:res.statusCode,body,headers:res.headers}))});req.on('error',reject)}) }

test('serves the iPhone app and health check',async()=>{const server=createServer();await new Promise(ok=>server.listen(0,'127.0.0.1',ok));try{const port=server.address().port,home=await request(port),health=await request(port,'/health');assert.equal(home.status,200);assert.match(home.body,/Saved privately on this iPhone/);assert.deepEqual(JSON.parse(health.body),{ok:true,version:8})}finally{await new Promise(ok=>server.close(ok))}});
test('has distinct idea, task, and voice capture',async()=>{const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');assert.match(html,/New Idea/);assert.match(html,/New Task/);assert.match(html,/Voice Memo/);assert.match(html,/voiceCount/);assert.match(html,/Home/)});
test('stores locally and exports through the share sheet',async()=>{const js=await readFile(new URL('../public/app.js',import.meta.url),'utf8');assert.match(js,/localStorage/);assert.match(js,/indexedDB/);assert.match(js,/navigator\.share/);assert.doesNotMatch(js,/\/local\//)});
test('uses separate numbered filenames',async()=>{const js=await readFile(new URL('../public/app.js',import.meta.url),'utf8');assert.match(js,/Idea/);assert.match(js,/Task/);assert.match(js,/Voice/);assert.match(js,/padStart\(2,'0'\)/)});
test('is installable and offline capable',async()=>{const manifest=JSON.parse(await readFile(new URL('../public/manifest.webmanifest',import.meta.url),'utf8')),sw=await readFile(new URL('../public/service-worker.js',import.meta.url),'utf8');assert.equal(manifest.display,'standalone');assert.match(sw,/quiet-notes-iphone-v8/)});
