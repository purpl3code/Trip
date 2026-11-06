import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createUpdateManifest } from '../scripts/release-manifest.mjs';
test('release metadata matches APK bytes and Android version',()=>{
  const apk=Buffer.from('APK test fixture');
  const m=createUpdateManifest('versionCode 4\nversionName "1.2.0"',apk,'apk-32');
  assert.equal(m.versionCode,4);assert.equal(m.versionName,'1.2.0');
  assert.equal(m.downloadUrl,'https://github.com/purpl3code/Trip/releases/download/apk-32/Trip.apk');
  assert.equal(m.sha256,createHash('sha256').update(apk).digest('hex'));
  assert.notEqual(m.sha256,createHash('sha256').update('altered').digest('hex'));
});
test('release metadata rejects missing versions and invalid tags',()=>{
  assert.throws(()=>createUpdateManifest('versionCode 4',Buffer.from('apk'),'apk-32'));
  assert.throws(()=>createUpdateManifest('versionCode 4\nversionName "1.2.0"',Buffer.from('apk'),'../other'));
});
