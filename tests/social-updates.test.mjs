import test from 'node:test';
import assert from 'node:assert/strict';
import { withLike,withFollow,withPostUsers,commitOptimistic,shouldOverlaySocialChange } from '../src/utils/socialUpdates.ts';

const person=(id,extra={})=>({id,username:id,displayName:id,avatar:'',banner:'',bio:'',followersCount:3,followingCount:2,isFollowing:false,...extra});
const post=(user)=>({id:'post',user,comments:[],isLiked:false,likesCount:4});

test('a like and its count change before a delayed save completes',async()=>{
  let value=post(person('author'));
  let finish;
  const delayed=new Promise(resolve=>{finish=resolve;});
  const action=commitOptimistic({
    apply:()=>{value=withLike(value,true);},
    persist:()=>delayed,
    rollback:()=>{value=withLike(value,false);},
  });
  assert.equal(value.isLiked,true);
  assert.equal(value.likesCount,5);
  finish();await action;
  assert.equal(value.likesCount,5);
});
test('failed writes restore a like without erasing other counter changes',async()=>{
  let value=post(person('author'));
  let fail;
  const delayed=new Promise((_,reject)=>{fail=reject;});
  const action=commitOptimistic({
    apply:()=>{value=withLike(value,true);},
    persist:()=>delayed,
    rollback:()=>{value=withLike(value,false);},
  });
  value={...value,likesCount:value.likesCount+1};
  fail(new Error('Offline'));
  await assert.rejects(action,/Offline/);
  assert.equal(value.isLiked,false);
  assert.equal(value.likesCount,5);
});
test('reconciling an already confirmed like does not double its count',()=>{
  const liked=withLike(post(person('author')),true);
  assert.equal(withLike(liked,true),liked);
  assert.equal(withLike({...liked,likesCount:0},false).likesCount,0);
});
test('following updates both profiles, and rollback preserves concurrent follows',async()=>{
  let users=[person('me'),person('alice'),person('bob')];
  const apply=(target,next,delta)=>{users=users.map(user=>withFollow(user,'me',target,next,delta));};
  let fail;
  const action=commitOptimistic({
    apply:()=>apply('alice',true,1),
    persist:()=>new Promise((_,reject)=>{fail=reject;}),
    rollback:()=>apply('alice',false,-1),
  });
  assert.equal(users[1].isFollowing,true);
  assert.equal(users[1].followersCount,4);
  assert.equal(users[0].followingCount,3);
  apply('bob',true,1);
  fail(new Error('Failed'));await assert.rejects(action,/Failed/);
  assert.equal(users[0].followingCount,3);
  assert.equal(users[1].isFollowing,false);
  assert.equal(users[1].followersCount,3);
  assert.equal(users[2].isFollowing,true);
});
test('post and comment authors stay in sync when opening their profiles',()=>{
  const alice=person('alice'),me=person('me'),other=person('other');
  const value={...post(alice),comments:[{id:'a',user:me},{id:'b',user:other}]};
  const updated=withPostUsers(value,user=>withFollow(user,'me','alice',true,1));
  assert.equal(updated.user.isFollowing,true);
  assert.equal(updated.user.followersCount,4);
  assert.equal(updated.comments[0].user.followingCount,3);
  assert.equal(updated.comments[1],value.comments[1]);
  assert.equal(alice.followersCount,3);
});

test('stale refreshes preserve pending or just-confirmed taps, while fresh reads reconcile',()=>{
  assert.equal(shouldOverlaySocialChange({},10),true);
  const confirmed={settledRequest:12};
  assert.equal(shouldOverlaySocialChange(confirmed,11),true);
  assert.equal(shouldOverlaySocialChange(confirmed,12),true);
  assert.equal(shouldOverlaySocialChange(confirmed,13),false);
  const stale=post(person('author'));
  const displayed=withLike(stale,true);
  assert.equal(displayed.isLiked,true);
  assert.equal(displayed.likesCount,5);
  assert.equal(withLike(displayed,true).likesCount,5);
});
