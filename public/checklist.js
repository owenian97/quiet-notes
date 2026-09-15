export function normalizeChecklist(value){return Array.isArray(value)?value.filter(item=>item&&typeof item.id==='string').map(item=>({id:item.id,text:String(item.text||''),completed:Boolean(item.completed),createdAt:Number(item.createdAt)||Date.now()})):[]}
export function addChecklistItem(items,text,id=crypto.randomUUID(),createdAt=Date.now()){let clean=String(text||'').trim().replace(/\s+/g,' ');return clean?[...items,{id,text:clean,completed:false,createdAt}]:items}
export function editChecklistItem(items,id,text){return items.map(item=>item.id===id?{...item,text:String(text)}:item)}
export function toggleChecklistItem(items,id,completed){return items.map(item=>item.id===id?{...item,completed:Boolean(completed)}:item)}
export function removeChecklistItem(items,id){return items.filter(item=>item.id!==id)}
export function moveChecklistItem(items,id,direction){let index=items.findIndex(item=>item.id===id),target=index+direction;if(index<0||target<0||target>=items.length)return items;let result=[...items],[item]=result.splice(index,1);result.splice(target,0,item);return result}
export function checklistProgress(items=[]){let total=items.length,completed=items.filter(item=>item.completed).length;return {completed,total,label:`${completed} of ${total} steps completed`,compact:`${completed}/${total} steps`}}
