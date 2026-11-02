import test from 'node:test';
import assert from 'node:assert/strict';
import {planRetention,retain} from './retain-releases.mjs';
const repo='owner/armory',hash='a'.repeat(64);
function app(tag,id,extra={}){const url='https://github.com/'+repo+'/releases/download/'+tag+'/';return {tag_name:tag,id,draft:false,prerelease:false,assets:[{name:'SAO-Armory-Windows-x64.zip',digest:'sha256:'+hash,size:5000,browser_download_url:url+'SAO-Armory-Windows-x64.zip'},{name:'manifest.json',browser_download_url:url+'manifest.json'},{name:'SHA256SUMS.txt',browser_download_url:url+'SHA256SUMS.txt'}],...extra};}
test('keeps latest plus two previous public versions, removes older apps and stale drafts only',()=>{
 const latest=app('v3.3.5',5),rows=[app('v3.0.1',1),app('v3.1.0',2,{draft:true}),app('v3.2.0',3),app('v3.3.3',4),latest,app('v4.0.0',6,{draft:true}),app('v3.3.6',7,{prerelease:true}),app('data-2026',8),app('v2.0.0',9,{assets:[{name:'manifest.json'}]})];
 const plan=planRetention(rows,latest);assert.deepEqual(plan.keep.map(r=>r.tag_name),['v3.3.5','v3.3.3','v3.2.0']);assert.deepEqual(plan.remove.map(r=>r.tag_name),['v3.0.1','v3.1.0']);
});
test('retains all versions until three public app releases exist and rejects incorrect Latest',()=>{const a=app('v3.2.0',1),b=app('v3.3.5',2);assert.deepEqual(planRetention([a,b],b).remove,[]);assert.throws(()=>planRetention([a,b],a),/newest/);});
function fixture({bad=false,changed=false}={}){const latest=app('v3.3.5',4),rows=[app('v3.0.1',1),app('v3.1.0',2),app('v3.2.0',3),latest],deleted=[];let latestReads=0;return {deleted,repo,api:async(p,method='GET')=>{if(method==='DELETE'){deleted.push(p);return null;}if(p.endsWith('/latest'))return changed&&++latestReads>1?app('v4.0.0',9):latest;if(p.includes('?'))return rows;return rows.find(r=>p.endsWith('/'+r.id));},download:async url=>url.includes('manifest.json')?JSON.stringify({version:'3.3.5',bytes:5000,sha256:bad?'bad':hash}):hash+'  SAO-Armory-Windows-x64.zip\n'};}
test('checks newest archive metadata before deleting both release and tag',async()=>{const f=fixture(),result=await retain(f);assert.deepEqual(result.kept,['v3.3.5','v3.2.0','v3.1.0']);assert.deepEqual(result.deleted,['v3.0.1']);assert.equal(f.deleted.length,2);});
test('invalid newest download or a changed Latest prevents destructive cleanup',async()=>{for(const options of [{bad:true},{changed:true}]){const f=fixture(options);await assert.rejects(retain(f),/mismatch|changed/);assert.equal(f.deleted.length,0);}});
test('non-app events and outdated publication events never trigger pruning',async()=>{for(const expectedTag of ['data-2026','v3.2.0']){const f=fixture();assert((await retain({...f,expectedTag})).skipped);assert.equal(f.deleted.length,0);}});
