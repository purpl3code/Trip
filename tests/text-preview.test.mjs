import test from 'node:test';
import assert from 'node:assert/strict';
import { fitWholeWords } from '../src/utils/textPreview.ts';

test('preview stops at a complete word rather than a character limit',()=>{
  assert.equal(fitWholeWords('Um lugar maravilhoso para visitar',value=>value.length<=16),'Um lugar');
  assert.equal(fitWholeWords('Um lugar maravilhoso para visitar',value=>value.length<=20),'Um lugar maravilhoso');
});
test('preview preserves accents, emoji and paragraph boundaries',()=>{
  const text='Café delicioso!\nUma viagem inesquecível 🧭';
  assert.equal(fitWholeWords(text,value=>value.length<=22),'Café delicioso!\nUma');
  assert.equal(fitWholeWords(text,()=>true),text);
});
test('a word that cannot fit is omitted intact',()=>{
  assert.equal(fitWholeWords('extraordinariamente',value=>value.length<=5),'');
  assert.equal(fitWholeWords('',()=>true),'');
});
