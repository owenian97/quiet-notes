import { dueDetails } from './due.js';

export function itemDate(item){let date=new Date(item.createdAt);return Number.isNaN(date.getTime())?'':new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(date)}
export function itemPreview(item){if(item.type==='VOICE'){let count=item.recordings?.length||1;return `${count} recording${count===1?'':'s'}`}let text=String(item.text||'').trim().replace(/\s+/g,' ');if(!text&&item.type==='TASK')text=String(item.checklist?.find(step=>!step.completed)?.text||item.checklist?.[0]?.text||'').trim();return text.slice(0,100)}
export function groupTasks(tasks,now=new Date()){let groups={overdue:[],today:[],upcoming:[],none:[]};for(const task of tasks){let due=dueDetails(task.dueAt,now);groups[due?.status||'none'].push(task)}return groups}
