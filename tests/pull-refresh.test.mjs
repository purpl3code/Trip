import test from 'node:test';
import assert from 'node:assert/strict';
import { pullDistance, REFRESH_THRESHOLD, MAX_PULL_DISTANCE } from '../src/utils/pullRefresh.ts';

test('pull refresh arms only after a deliberate downward pull at the top',()=>{
  assert.ok(pullDistance(10,10,12,160,0) >= REFRESH_THRESHOLD);
  assert.ok(pullDistance(10,10,10,40,0) < REFRESH_THRESHOLD);
  assert.equal(pullDistance(0,0,0,500,0),MAX_PULL_DISTANCE);
});
test('ordinary scrolling, sideways gestures and multitouch do not refresh',()=>{
  assert.equal(pullDistance(0,100,0,40,0),0);
  assert.equal(pullDistance(0,0,0,200,120),0);
  assert.equal(pullDistance(0,0,160,100,0),0);
  assert.equal(pullDistance(0,0,0,200,0,2),0);
});
