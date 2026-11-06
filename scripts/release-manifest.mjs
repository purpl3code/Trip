import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
export function createUpdateManifest(gradle, apk, tag) {
  const versionCode = Number(gradle.match(/versionCode\s+(\d+)/)?.[1]);
  const versionName = gradle.match(/versionName\s+"([^"]+)"/)?.[1];
  if (!versionCode || !versionName || !/^apk-\d+$/.test(tag)) throw new Error('Invalid release metadata');
  return { applicationId:'com.purpl3code.trip', versionCode, versionName,
    downloadUrl:`https://github.com/purpl3code/Trip/releases/download/${tag}/Trip.apk`,
    sha256:createHash('sha256').update(apk).digest('hex'),
    releaseNotes:'Trip 2.0: Liquid Glass nos dois temas, navegação flutuante, rascunhos com fotos salvos no aparelho e melhorias de estabilidade, acessibilidade e atualização dos relatos.' };
}
if (process.argv[1]?.endsWith('release-manifest.mjs')) {
  const gradle = await readFile('android/app/build.gradle','utf8');
  const apk = await readFile('android/app/build/outputs/apk/release/app-release.apk');
  await writeFile('update.json',JSON.stringify(createUpdateManifest(gradle,apk,process.env.RELEASE_TAG),null,2)+'\n');
}
