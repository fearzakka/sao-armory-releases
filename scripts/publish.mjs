import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {execFileSync,spawnSync} from 'node:child_process';
import {pipeline} from 'node:stream/promises';
import {Readable,Transform} from 'node:stream';
import {parts,stable,mergePart,manifest,assetUrl} from './snapshot-core.mjs';
const repo=process.env.ARMORY_REPOSITORY,service=process.env.ARMORY_SERVICE,token=process.env.ARMORY_PUBLISHER_TOKEN,gh=process.env.ARMORY_GH||'gh';
if(!/^[\w.-]+\/[\w.-]+$/.test(repo||'')||!/^https:\/\/[\w.-]+\.workers\.dev$/.test(service||'')||!token)throw Error('Publisher configuration is missing.');
const folder=path.resolve('work/publish');fs.mkdirSync(folder,{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const cli=args=>execFileSync(gh,args,{encoding:'utf8',maxBuffer:1024*1024,stdio:['ignore','pipe','pipe'],windowsHide:true});
async function api(route,body){const r=await fetch(service+'/api/publisher/'+route,{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(60000),redirect:'error'});const value=await r.json();if(!r.ok)throw Error(value.error||'Publisher request failed');return value;}
async function bytes(url,limit){if(!assetUrl(url,repo))throw Error('Unexpected release asset URL');const r=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('A published asset is unavailable');const chunks=[];let count=0;for await(const c of r.body){count+=c.length;if(count>limit)throw Error('Published asset exceeds its bound');chunks.push(c);}return Buffer.concat(chunks);}
async function partData(p){const b=await bytes(p.url,4194304);if(b.length!==p.bytes||sha(b)!==p.sha256)throw Error('Previous snapshot checksum mismatch');return JSON.parse(zlib.gunzipSync(b,{maxOutputLength:8388608}));}
function getRelease(tag){try{return JSON.parse(cli(['api','repos/'+repo+'/releases/tags/'+tag]));}catch(e){if(String(e.stderr||e.message).includes('404'))return null;throw e;}}
function uploadRelease(tag,title,files){const existing=getRelease(tag);if(existing&&!existing.draft)return existing;if(!existing)cli(['release','create',tag,'--repo',repo,'--title',title,'--notes','Cumulative shared library. Personal saves are excluded.','--draft']);for(let i=0;i<files.length;i+=8)cli(['release','upload',tag,...files.slice(i,i+8),'--repo',repo,'--clobber']);cli(['release','edit',tag,'--repo',repo,'--draft=false','--latest=false']);return getRelease(tag);}
function saveJson(file,data){fs.writeFileSync(file,JSON.stringify(data,null,2));return file;}
const status=await api('status');let snapshot=status.snapshot;
const due=!snapshot||Date.now()-snapshot.createdAt>=72*3600000;
if(due&&(!snapshot||status.queued||status.queuedIcons)){
 const job=await api('start',{}),tag=job.job,base='https://github.com/'+repo+'/releases/download/'+tag+'/',files=[],next={schema:1,id:tag,revision:job.cutoff,previous:job.previous?.id||null,createdAt:Date.now(),parts:[]};
 for(const key of parts){const old=job.previous?.parts.find(p=>p.key===key),previous=old?await partData(old):null,change=await api('part?job='+tag+'&part='+key),value=mergePart(previous,change.records,change.icons),buffer=zlib.gzipSync(stable(value),{level:9}),digest=sha(buffer);if(buffer.length>4194304)throw Error('A snapshot part reached its capacity. The database has not been cleared.');if(old?.sha256===digest)next.parts.push(old);else{const file=path.join(folder,key+'.json.gz');fs.writeFileSync(file,buffer);files.push(file);next.parts.push({key,url:base+key+'.json.gz',sha256:digest,bytes:buffer.length});}}
 manifest(next,repo);files.push(saveJson(path.join(folder,'manifest.json'),next));uploadRelease(tag,'Shared library '+new Date(next.createdAt).toISOString().slice(0,10),files);
 await api('prepare',{job:tag,url:base+'manifest.json'});for(const key of parts)await api('verify',{job:tag,part:key});await api('commit',{job:tag});snapshot=next;console.log('Snapshot verified and discovery queue compacted.');
}
if(!snapshot){console.log('No shared snapshot is available yet.');process.exit(0);}
manifest(snapshot,repo);
const health=await fetch(service+'/api/health').then(r=>r.json()),app=health.release;if(!app){console.log('Snapshot ready; waiting for the first app release.');process.exit(0);}
let previous,previousSha;try{const r=JSON.parse(cli(['api','repos/'+repo+'/contents/download.json']));previousSha=r.sha;previous=JSON.parse(Buffer.from(r.content,'base64'));}catch(e){if(!String(e.stderr||e.message).includes('404'))throw e;}
if(previous?.version===app.version&&previous.snapshot===snapshot.id){console.log('Download is current.');process.exit(0);}
const bundleTag='download-'+app.version+'-'+snapshot.id.slice(9),existing=getRelease(bundleTag);let release=existing;
if(!existing){
 if(!assetUrl(app.url,repo)||!/^[a-f0-9]{64}$/.test(app.sha256)||app.bytes>1900000000)throw Error('Invalid app release');const archive=path.join(folder,'base.zip'),digest=crypto.createHash('sha256');let count=0;const r=await fetch(app.url,{signal:AbortSignal.timeout(900000)});if(!r.ok)throw Error('App download unavailable');await pipeline(Readable.fromWeb(r.body),new Transform({transform(c,enc,done){count+=c.length;if(count>app.bytes)return done(Error('App download is larger than expected'));digest.update(c);done(null,c);}}),fs.createWriteStream(archive));if(count!==app.bytes||digest.digest('hex')!==app.sha256)throw Error('App checksum mismatch');
 const seed=path.join(folder,'seed');fs.mkdirSync(seed,{recursive:true});saveJson(path.join(seed,'manifest.json'),snapshot);for(const p of snapshot.parts){const b=await bytes(p.url,4194304);if(b.length!==p.bytes||sha(b)!==p.sha256)throw Error('Snapshot changed before packaging');fs.writeFileSync(path.join(seed,p.key+'.json.gz'),b);}
 const bundle=path.join(folder,'SAO-Armory-Windows-x64.zip');execFileSync(process.platform==='win32'?'python':'python3',[path.join(import.meta.dirname,'bundle.py'),archive,bundle,seed,app.version],{stdio:'inherit',windowsHide:true});release=uploadRelease(bundleTag,'SAO Armory '+app.version+' with current library',[bundle]);
}
const asset=release.assets?.find(a=>a.name==='SAO-Armory-Windows-x64.zip');if(!asset||!/^sha256:[a-f0-9]{64}$/.test(asset.digest||'')||!assetUrl(asset.browser_download_url,repo))throw Error('Published download has no verified digest');
const download={version:app.version,url:asset.browser_download_url,bytes:asset.size,sha256:asset.digest.slice(7),snapshot:snapshot.id,catalogueUpdated:snapshot.createdAt,publishedAt:Date.now()};
const update={message:'Refresh Armory download '+app.version,content:Buffer.from(JSON.stringify(download,null,2)+'\n').toString('base64'),...(previousSha?{sha:previousSha}:{})};const body=saveJson(path.join(folder,'download-update.json'),update);cli(['api','repos/'+repo+'/contents/download.json','--method','PUT','--input',body]);console.log('Download page manifest updated.');
