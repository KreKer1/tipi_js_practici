import assert from 'node:assert/strict';
import { createApiServer } from '../api/server.mjs';
import { createApiClient, ApiError } from '../src/api-client.js';
import { createTaskApi } from '../src/task-api.js';
const server=createApiServer();
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
try {
  const client=createApiClient({baseUrl:`http://127.0.0.1:${server.address().port}/api`});
  const api=createTaskApi(client);
  const combined=await api.getTasks({completed:true,priority:'high',categoryId:2});
  assert.deepEqual(combined.tasks.map(t=>t.id),[16,25]);
  console.log('OK: собственная комбинация completed=true, priority=high, categoryId=2 → [16,25]');
  await assert.rejects(()=>client.requestJson('/categories/999'),e=>e instanceof ApiError && e.kind==='http' && e.status===404);
  console.log('OK: отсутствующая категория даёт HTTP 404');
  let calls=0;
  const preaborted=createApiClient({baseUrl:'http://example.test/api',fetchFn:async()=>{calls++;return new Response('{}');}});
  const controller=new AbortController();controller.abort('cancel before request');
  await assert.rejects(()=>preaborted.requestJson('/tasks',{signal:controller.signal}),e=>e.kind==='aborted');
  assert.equal(calls,0);
  console.log('OK: заранее отменённый сигнал не запускает fetch');
  const variant=await api.getTasks({completed:true});
  assert.deepEqual(variant.tasks.map(t=>t.id),[1,10,16,25,31]);
  console.log('OK: вариант 18 → 2, completed=true → [1,10,16,25,31]');
  console.log('Собственные проверки: 4/4.');
} finally { await new Promise(resolve=>server.close(resolve)); }
