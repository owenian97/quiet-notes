const HOUR=60*60*1000;

export function normalizePriority(value){let number=Number(value);return Number.isInteger(number)&&number>=1&&number<=5?number:null}

export function priorityFromText(title='',body=''){
  let match=`${title} ${body}`.match(/\bp([1-5])\b/i);
  return match?Number(match[1]):null;
}

export function effectivePriority(item,now=Date.now()){
  let assigned=normalizePriority(item?.priority);
  if(assigned===null)return null;
  let edited=Number(item.lastEdited??item.updatedAt??item.createdAt)||now,hours=Math.max(0,(now-edited)/HOUR),steps=hours<48?0:hours<120?1:hours<240?2:hours<408?3:4;
  return Math.min(5,assigned+steps);
}

export function priorityDetails(item,now=Date.now()){
  let priority=effectivePriority(item,now);
  if(priority===null)return null;
  let labels={1:'Now',2:'High',3:'Soon',4:'Low',5:'Someday'};
  return {priority,label:`P${priority} · ${labels[priority]}`};
}

export function filterByPriority(items,filter='ALL',now=Date.now()){
  if(filter==='ALL')return items;
  if(filter==='NONE')return items.filter(item=>item.type!=='VOICE'&&effectivePriority(item,now)===null);
  let wanted=Number(String(filter).replace(/^P/i,''));
  return items.filter(item=>item.type!=='VOICE'&&effectivePriority(item,now)===wanted);
}
