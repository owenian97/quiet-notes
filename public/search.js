function normalizedTerms(query) {
  return String(query || '').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
}

export function matchesSavedItem(item, query) {
  const terms = normalizedTerms(query);
  if (!terms.length) return true;
  const typeLabel = item.type === 'IDEA' ? 'idea' : item.type === 'TASK' ? 'task' : item.type === 'VOICE' ? 'voice voice memo recording' : '';
  const metadata = [item.title, item.filename, item.type, typeLabel, item.text].filter(Boolean).join(' ').toLocaleLowerCase();
  return terms.every(term => metadata.includes(term));
}

export function filterSavedItems(items, typeFilter, query) {
  return items.filter(item => (typeFilter === 'ALL' || item.type === typeFilter) && matchesSavedItem(item, query));
}
