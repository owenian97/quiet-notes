export function pinnedFirst(items){
  return items.map((item,index)=>({item,index})).sort((a,b)=>Number(Boolean(b.item.pinned))-Number(Boolean(a.item.pinned))||a.index-b.index).map(entry=>entry.item);
}

export function togglePinned(item,now=Date.now()){
  let pinned=!Boolean(item.pinned);
  return {...item,pinned,pinnedAt:pinned?now:null};
}
