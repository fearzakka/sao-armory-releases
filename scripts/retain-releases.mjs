import {pathToFileURL} from 'node:url';

const archiveName='SAO-Armory-Windows-x64.zip';
const version=r=>/^v(\d{1,4})\.(\d{1,4})\.(\d{1,4})$/.exec(r?.tag_name||'')?.slice(1).map(Number);
const compare=(a,b)=>{for(let i=0;i<3;i++)if(a[i]!==b[i])return a[i]-b[i];return 0;};
const isApp=r=>version(r)&&r.assets?.some(a=>a.name===archiveName);
export function planRetention(releases,latest){
 if(!isApp(latest)||latest.draft||latest.prerelease)throw Error('Latest must be a published stable app download. Nothing was deleted.');
 const published=releases.filter(r=>isApp(r)&&!r.draft&&!r.prerelease).sort((a,b)=>compare(version(b),version(a)));
 if(published[0]?.id!==latest.id)throw Error('Latest is not the newest app version. Nothing was deleted.');
 const keep=published.slice(0,3),keepIds=new Set(keep.map(r=>r.id));
 // Wait for three public versions before removing anything; snapshots are never app releases.
 const remove=keep.length<3?[]:releases.filter(r=>isApp(r)&&!r.prerelease&&!keepIds.has(r.id)&&compare(version(r),version(latest))<0);
 return {keep,remove};
}

export async function retain({repo,api,download,expectedTag=''}){
 if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo))throw Error('Invalid repository.');
 if(expectedTag&&!/^v\d+\.\d+\.\d+$/.test(expectedTag))return {skipped:'Not an app release'};
 const prefix='/repos/'+repo,latest=await api(prefix+'/releases/latest');
 if(expectedTag&&latest.tag_name!==expectedTag)return {skipped:'A different release is Latest'};
 let releases=[];
 for(let page=1;page<=20;page++){const rows=await api(prefix+'/releases?per_page=100&page='+page);releases.push(...rows);if(rows.length<100)break;if(page===20)throw Error('Too many releases for a bounded cleanup.');}
 const plan=planRetention(releases,latest),asset=latest.assets.find(a=>a.name===archiveName),manifestAsset=latest.assets.find(a=>a.name==='manifest.json'),checksums=latest.assets.find(a=>a.name==='SHA256SUMS.txt');
 if(!/^sha256:[a-f0-9]{64}$/.test(asset.digest||'')||!Number.isSafeInteger(asset.size)||asset.size<1000||!manifestAsset||!checksums)throw Error('Newest download lacks verified release metadata. Nothing was deleted.');
 const expectedBase='https://github.com/'+repo+'/releases/download/'+latest.tag_name+'/';
 for(const a of [asset,manifestAsset,checksums])if(a.browser_download_url!==expectedBase+a.name)throw Error('Unexpected release asset URL.');
 const manifest=JSON.parse(await download(manifestAsset.browser_download_url)),sum=await download(checksums.browser_download_url);
 const expected=asset.digest.slice(7);
 if(manifest.version!==latest.tag_name.slice(1)||manifest.sha256!==expected||manifest.bytes!==asset.size||!sum.split(/\r?\n/).some(line=>line.trim()===expected+'  '+archiveName))throw Error('Newest archive checksum/manifest mismatch. Nothing was deleted.');
 const deleted=[];
 for(const old of plan.remove){
  const current=await api(prefix+'/releases/latest');if(current.id!==latest.id||current.tag_name!==latest.tag_name)throw Error('Latest changed during cleanup. Stopped safely.');
  const check=await api(prefix+'/releases/'+old.id);if(check.tag_name!==old.tag_name||!isApp(check)||!!check.draft!==!!old.draft)throw Error('Release changed during cleanup. Stopped safely.');
  await api(prefix+'/releases/'+old.id,'DELETE');
  // Tags for old app releases are removed too. Snapshot and other tags are untouched.
  await api(prefix+'/git/refs/tags/'+encodeURIComponent(old.tag_name),'DELETE',true);
  deleted.push(old.tag_name);
 }
 return {latest:latest.tag_name,kept:plan.keep.map(r=>r.tag_name),deleted,archiveVerified:true};
}

async function main(){
 const repo=process.env.ARMORY_REPOSITORY,token=process.env.GH_TOKEN;if(!token)throw Error('GitHub token missing.');
 const api=async(route,method='GET',allowMissing=false)=>{const response=await fetch('https://api.github.com'+route,{method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'VOW-release-retention'},redirect:'error',signal:AbortSignal.timeout(20000)});if(allowMissing&&response.status===404)return null;if(!response.ok)throw Error('GitHub '+method+' returned '+response.status);return response.status===204?null:response.json();};
 const download=async url=>{for(let attempt=0;attempt<4;attempt++){const response=await fetch(url+'?retention='+Date.now(),{signal:AbortSignal.timeout(20000)});if(response.ok){const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>65536)throw Error('Release metadata is too large.');return bytes.toString('utf8');}if(attempt===3)throw Error('Release metadata download returned '+response.status);await new Promise(r=>setTimeout(r,2000));}};
 console.log(JSON.stringify(await retain({repo,api,download,expectedTag:process.env.APP_RELEASE_TAG||''}),null,2));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(e.message);process.exitCode=1;});
