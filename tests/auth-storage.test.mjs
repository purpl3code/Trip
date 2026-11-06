import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthStorage } from '../src/utils/authStorage.ts';

function store() {
  const values = new Map();
  return { getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key) };
}
test('remembered and session logins use the selected store without leaving duplicate tokens',()=>{
  const local=store(),session=store();
  const auth=createAuthStorage(()=>local,()=>session);
  auth.storage.setItem('token','persistent');
  assert.equal(local.getItem('token'),'persistent');
  auth.setKeepLogged(false);
  auth.storage.setItem('token','temporary');
  assert.equal(local.getItem('token'),null);
  assert.equal(session.getItem('token'),'temporary');
  assert.equal(auth.storage.getItem('token'),'temporary');
  auth.setKeepLogged(true);
  auth.storage.setItem('token','new');
  assert.equal(session.getItem('token'),null);
  auth.storage.removeItem('token');
  assert.equal(auth.storage.getItem('token'),null);
});
test('restricted storage still allows an in-memory session and sign-out clears it',()=>{
  const blocked=()=>{throw new Error('Storage blocked');};
  const auth=createAuthStorage(blocked,blocked);
  auth.setKeepLogged(false);
  assert.equal(auth.getKeepLogged(),false);
  auth.storage.setItem('token','memory');
  assert.equal(auth.storage.getItem('token'),'memory');
  auth.storage.removeItem('token');
  assert.equal(auth.storage.getItem('token'),null);
});

test('a failed preference write cannot turn an unchecked remember option back on',()=>{
  const local=store(),session=store();
  local.setItem('trip_keep_logged','true');
  const fullLocal={...local,setItem(){throw new Error('Quota exceeded');}};
  const auth=createAuthStorage(()=>fullLocal,()=>session);
  auth.setKeepLogged(false);
  auth.storage.setItem('token','session-only');
  assert.equal(auth.getKeepLogged(),false);
  assert.equal(local.getItem('token'),null);
  assert.equal(session.getItem('token'),'session-only');
});
