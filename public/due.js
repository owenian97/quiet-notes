function validDate(value){if(value===null||value===undefined||value==='')return null;const date=new Date(value);return Number.isNaN(date.getTime())?null:date}
function sameLocalDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}

export function dueDetails(value,now=new Date()){
  const date=validDate(value);
  if(!date)return null;
  const day=new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric'}).format(date);
  const time=new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit'}).format(date);
  return {label:`Due ${day} · ${time}`,status:date<now?'overdue':sameLocalDay(date,now)?'today':'upcoming'};
}

export function dueInputValue(value){
  const date=validDate(value);
  if(!date)return '';
  const part=n=>String(n).padStart(2,'0');
  return `${date.getFullYear()}-${part(date.getMonth()+1)}-${part(date.getDate())}T${part(date.getHours())}:${part(date.getMinutes())}`;
}

export function dueFromInput(value){
  if(!value)return null;
  const date=validDate(value);
  return date?.toISOString()||null;
}
