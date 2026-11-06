import test from 'node:test';
import assert from 'node:assert/strict';
import {due,sameApp} from './storage-policy.mjs';
test('850 decimal MB of database storage triggers publication, regardless of traffic',()=>{
 const row={queued:1,queuedIcons:0,received:2.07e9,databaseBytes:849999999};
 assert.equal(due(row),false);assert(due({...row,databaseBytes:850000000}));
 assert.equal(due({...row,databaseBytes:900000000,queued:0}),false);
 assert(due({...row,activeJob:'frozen'}));assert.throws(()=>due({}));
});
test('only a complete app bundle for the approved version can be promoted',()=>{
 assert(sameApp('v3.3.35','3.3.35'));assert(sameApp('download-3.3.35-'+'a'.repeat(32),'3.3.35'));
 assert(!sameApp('v3.3.37','3.3.35'));assert(!sameApp('snapshot-'+'a'.repeat(32),'3.3.35'));
});
