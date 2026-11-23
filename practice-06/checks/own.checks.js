import assert from 'node:assert/strict';
import { createAppController } from '../src/app-controller.js';
const task={id:4,title:'Тест',priority:'high',categoryId:1,completed:false};
const categories=[{id:1,name:'Учёба'}];
const view={states:[],notices:[],setListState(...x){this.states.push(x);},notify(...x){this.notices.push(x);},
  setTasks(){},setCategories(){},setTotal(){},setFormTask(){},showFormErrors(){},setMutationPending(){}};
let resolveMutation,calls=0;
const api={
  async loadInitialData(){return {tasks:[task],categories,meta:{total:1}};},
  async getTasks(){return {tasks:[task],meta:{total:1}};},
  createTask(){calls++;return new Promise(resolve=>{resolveMutation=resolve;});},
  async updateTask(){},async setTaskCompleted(){},async deleteTask(){},async resetDemoData(){},
};
const controller=createAppController({api,view});
await controller.start();
const draft={title:'Новая',priority:'low',categoryId:'1'};
const pending=controller.submit(draft);
await controller.submit(draft);
assert.equal(calls,1);
resolveMutation(task);await pending;
console.log('OK: повторный submit во время мутации не создаёт второй запрос');
const count=view.notices.length;
const later=controller.submit(draft);
controller.destroy();resolveMutation(task);await later;
assert.equal(view.notices.length,count);
console.log('OK: завершение мутации после destroy не меняет представление');
await controller.refresh();
assert.equal(view.states.at(-1)[0],'ready');
console.log('OK: refresh после destroy не запускает загрузку');
console.log('Собственные проверки: 3/3.');
