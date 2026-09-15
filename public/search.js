function normalizedTerms(query) {
  return String(query || '').trim().toLocaleLowerCase().split(/\s+/).map(term=>term.replace(/^#+/,'')).filter(Boolean);
}

export function matchesSavedItem(item, query) {
  const terms = normalizedTerms(query);
  if (!terms.length) return true;
  const typeLabel = item.type === 'IDEA' ? 'idea' : item.type === 'TASK' ? 'task' : item.type === 'VOICE' ? 'voice voice memo recording' : '';
  const photoFilenames=(item.attachments||[]).map(photo=>photo.filename).join(' ');
  const photoText=(item.attachments||[]).map(photo=>photo.ocrText).filter(Boolean).join(' ');
  const checklistText=item.type==='TASK'?(item.checklist||[]).map(step=>step.text).join(' '):'';
  const tags=(item.tags||[]).map(tag=>`${tag} #${tag}`).join(' ');
  const metadata = [item.title, item.filename, item.type, typeLabel, item.text, photoFilenames,photoText,checklistText,tags].filter(Boolean).join(' ').toLocaleLowerCase();
  return terms.every(term => metadata.includes(term));
}

export function filterSavedItems(items, typeFilter, query, tagFilter='') {
  const wanted=String(tagFilter||'').toLocaleLowerCase();
  return items.filter(item => (typeFilter === 'ALL' || item.type === typeFilter) && (!wanted||(item.tags||[]).some(tag=>String(tag).toLocaleLowerCase()===wanted)) && matchesSavedItem(item, query));
}
