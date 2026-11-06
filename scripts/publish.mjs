import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {pipeline} from 'node:stream/promises';
import {Readable,Transform} from 'node:stream';
import {due,sameApp} from './storage-policy.mjs';
import {parts,stable,manifest,assetUrl} from './snapshot-core.mjs';
const repo=process.env.ARMORY_REPOSITORY,service=process.env.ARMORY_SERVICE,token=process.env.ARMORY_PUBLISHER_TOKEN,gh=process.env.ARMORY_GH||'gh';
if(!/^[\w.-]+\/[\w.-]+$/.test(repo||'')||!/^https:\/\/[\w.-]+\.workers\.dev$/.test(service||'')||!token)throw Error('Publisher configuration is missing.');
const folder=path.resolve('work/publish');fs.mkdirSync(folder,{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const cli=args=>execFileSync(gh,args,{encoding:'utf8',maxBuffer:1024*1024,stdio:['ignore','pipe','pipe'],windowsHide:true});
async function api(route,body){const r=await fetch(service+'/api/publisher/'+route,{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(60000),redirect:'error'});const value=await r.json();if(!r.ok)throw Error(value.error||'Publisher request failed');return value;}
async function bytes(url,limit){if(!assetUrl(url,repo))throw Error('Unexpected release asset URL');const r=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('A published asset is unavailable');const chunks=[];let count=0;for await(const c of r.body){count+=c.length;if(count>limit)throw Error('Published asset exceeds its bound');chunks.push(c);}return Buffer.concat(chunks);}
function getRelease(tag){try{return JSON.parse(cli(['api','repos/'+repo+'/releases/tags/'+tag]));}catch(e){if(String(e.stderr||e.message).includes('404'))return null;throw e;}}
function uploadRelease(tag,title,files){const existing=getRelease(tag);if(existing&&!existing.draft)return existing;if(!existing)cli(['release','create',tag,'--repo',repo,'--title',title,'--notes','Cumulative shared library. Personal saves are excluded.','--draft']);for(let i=0;i<files.length;i+=8)cli(['release','upload',tag,...files.slice(i,i+8),'--repo',repo,'--clobber']);cli(['release','edit',tag,'--repo',repo,'--draft=false','--latest=false']);return getRelease(tag);}
function saveJson(file,data){fs.writeFileSync(file,JSON.stringify(data,null,2));return file;}
const status = await api('status');
if (!due(status)) {
 console.log('Database: '+status.databaseBytes+' bytes; pending discoveries: '+status.queued+'; pictures: '+status.queuedIcons+'. No publication needed.');
 process.exit(0);
}
async function currentApp(){
 const r=await fetch(service+'/api/health',{signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw Error('Approved app version unavailable.');
 const app=(await r.json()).release;
 if(!app||!/^\d+\.\d+\.\d+$/.test(app.version)||!assetUrl(app.url,repo)||!/^([a-f0-9]{64})$/.test(app.sha256)||!Number.isSafeInteger(app.bytes)||app.bytes<1000||app.bytes>1900000000)throw Error('Invalid approved app release.');
 return app;
}
const latest=()=>JSON.parse(cli(['api','repos/'+repo+'/releases/latest']));
async function checkVersion(app){
 const active=await currentApp();
 if(active.sha256!==app.sha256||!sameApp(latest().tag_name,app.version))throw Error('The approved app version changed. Retry with the new version.');
}
async function downloadZip(url,file,expectedSize,expectedHash){
 if(!assetUrl(url,repo))throw Error('Unexpected ZIP URL.');
 const r=await fetch(url,{signal:AbortSignal.timeout(900000)});
 if(!r.ok)throw Error('ZIP download unavailable: '+r.status);
 const digest=crypto.createHash('sha256');let size=0;
 await pipeline(Readable.fromWeb(r.body),new Transform({transform(chunk,enc,done){
  size+=chunk.length;if(size>expectedSize)return done(Error('ZIP exceeds expected size.'));
  digest.update(chunk);done(null,chunk);
 }}),fs.createWriteStream(file));
 if(size!==expectedSize||digest.digest('hex')!==expectedHash)throw Error('Downloaded ZIP checksum mismatch.');
}
const app=await currentApp();await checkVersion(app);
const job=await api('start',{}),tag=job.job,base='https://github.com/'+repo+'/releases/download/'+tag+'/';
const seed=path.join(folder,'seed');fs.mkdirSync(seed,{recursive:true});
let snapshot;
if(getRelease(tag)&&!getRelease(tag).draft){
 snapshot=manifest(JSON.parse(await bytes(base+'manifest.json',131072)),repo);
}else{
 snapshot={schema:1,id:tag,revision:job.cutoff,previous:job.previous?.id||null,createdAt:job.createdAt,parts:[]};
 const files=[];
 for(const key of parts){
  const data=await api('compose',{job:tag,part:key}),raw=Buffer.from(stable(data));
  if(raw.length>8388608)throw Error('A shard exceeds the installed client format. The queue is preserved.');
  const encoded=zlib.gzipSync(raw,{level:9}),digest=sha(encoded),prior=job.previous?.parts.find(p=>p.key===key);
  if(encoded.length>4194304)throw Error('Compressed shard exceeds client capacity.');
  if(prior?.sha256===digest)snapshot.parts.push(prior);
  else{
   const name=key+'.json.gz',file=path.join(folder,name);fs.writeFileSync(file,encoded);files.push(file);
   snapshot.parts.push({key,url:base+name,sha256:digest,bytes:encoded.length});
  }
 }
 manifest(snapshot,repo);files.push(saveJson(path.join(folder,'manifest.json'),snapshot));uploadRelease(tag,'Guild item and merchant data',files);
}
await api('prepare',{job:tag,url:base+'manifest.json'});
// Package the ordered chain. Older clients recognize the first seed and catch up via /sync.
const checkpoints=[];
for(let after=-1;;){
 const page=(await api('checkpoints?after='+after)).checkpoints;
 if(!page.length)break;
 for(const item of page){manifest(item,repo);if(item.revision<=after)throw Error('Invalid checkpoint order');after=item.revision;checkpoints.push(item);}
}
if((checkpoints.at(-1)?.id||null)!==snapshot.previous)throw Error('Checkpoint chain changed while publishing.');
checkpoints.push(snapshot);
for(const [index,checkpoint] of checkpoints.entries()){
 const dir=index===0?seed:path.join(seed,'checkpoints',checkpoint.id);fs.mkdirSync(dir,{recursive:true});
 saveJson(path.join(dir,'manifest.json'),checkpoint);
 let total=0;
 for(const part of checkpoint.parts){
  const data=await bytes(part.url,4194304);
  if(data.length!==part.bytes||sha(data)!==part.sha256)throw Error('Published data changed.');
  total+=zlib.gunzipSync(data,{maxOutputLength:8388608}).length;
  if(total>67108864)throw Error('Checkpoint exceeds client capacity. Queue preserved.');
  fs.writeFileSync(path.join(dir,part.key+'.json.gz'),data);
  if(checkpoint.id===snapshot.id)await api('verify',{job:tag,part:part.key});
 }
}
const name='SAO-Armory-Windows-x64.zip',bundleTag='download-'+app.version+'-'+tag.slice(9),receiptName='library-receipt.json';
const baseZip=path.join(folder,'base.zip'),bundle=path.join(folder,name);
await downloadZip(app.url,baseZip,app.bytes,app.sha256);
execFileSync(process.platform==='win32'?'python':'python3',[path.join(import.meta.dirname,'bundle.py'),baseZip,bundle,seed,app.version],{stdio:'inherit',windowsHide:true});
const hasher=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(bundle))hasher.update(chunk);
const receipt={snapshot:tag,revision:job.cutoff,version:app.version,baseSha256:app.sha256,sha256:hasher.digest('hex'),bytes:fs.statSync(bundle).size};
const receiptFile=saveJson(path.join(folder,receiptName),receipt);
const release=uploadRelease(bundleTag,'Vanguard of War '+app.version+' with guild library',[bundle,receiptFile]);
const asset=release.assets.find(a=>a.name===name),publishedReceipt=JSON.parse(await bytes(release.assets.find(a=>a.name===receiptName)?.browser_download_url,8192));
if(stable(receipt)!==stable(publishedReceipt)||asset?.digest!=='sha256:'+receipt.sha256||asset.size!==receipt.bytes)throw Error('Published bundle identity mismatch.');
await downloadZip(asset.browser_download_url,path.join(folder,'verified.zip'),receipt.bytes,receipt.sha256);
await checkVersion(app);
cli(['release','edit',bundleTag,'--repo',repo,'--latest']);
try{
 await checkVersion(app);
}catch(error){
 const approved=await currentApp();
 if(approved.version!==app.version&&latest().tag_name===bundleTag){
  const stableTag='v'+approved.version,release=getRelease(stableTag);
  if(release&&!release.draft&&!release.prerelease&&release.assets.some(a=>a.browser_download_url===approved.url&&a.digest==='sha256:'+approved.sha256)){
   cli(['release','edit',stableTag,'--repo',repo,'--latest']);
  }
 }
 throw error;
}
if(latest().tag_name!==bundleTag)throw Error('Download page is not pointing at the verified bundle.');
await api('commit',{job:tag,bundle:bundleTag});
console.log('Verified the published Windows download and compacted its discovery queue.');
