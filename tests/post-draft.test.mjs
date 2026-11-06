import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyPostDraft,restorePostDraft,hasPostDraft } from '../src/utils/postDraft.ts';
test('draft restoration preserves text, rating and image files',()=>{
  const file=new File(['image'],'foto.png',{type:'image/png'});
  const value=restorePostDraft({content:'Minha viagem',location:'Café',rating:3,verdict:'Não gostei',files:[file]});
  assert.equal(value.content,'Minha viagem');assert.equal(value.rating,3);assert.equal(value.files[0],file);
  assert.ok(hasPostDraft(value));assert.equal(hasPostDraft(emptyPostDraft()),false);
});
test('corrupt drafts and unsupported attachments cannot break the composer',()=>{
  assert.deepEqual(restorePostDraft(null),emptyPostDraft());
  const result=restorePostDraft({content:42,location:'a'.repeat(200),rating:NaN,files:[{},new File(['x'],'x.txt',{type:'text/plain'})]});
  assert.equal(result.content,'');assert.equal(result.location.length,120);assert.equal(result.rating,5);assert.deepEqual(result.files,[]);
});
