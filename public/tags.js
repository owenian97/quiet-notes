export function normalizeTag(value){return String(value||'').trim().replace(/^#+/,'').replace(/[^\p{L}\p{N} _-]+/gu,'').replace(/\s+/g,' ').slice(0,40).toLocaleLowerCase()}
export function normalizeTags(tags){let result=[];for(const value of Array.isArray(tags)?tags:[]){let tag=normalizeTag(value);if(tag&&!result.includes(tag))result.push(tag)}return result}
export function addTag(tags,value){let current=normalizeTags(tags),tag=normalizeTag(value);return !tag||current.includes(tag)?current:[...current,tag]}
export function removeTag(tags,value){let target=normalizeTag(value);return normalizeTags(tags).filter(tag=>tag!==target)}
export function hasTag(item,value){let target=normalizeTag(value);return !target||normalizeTags(item?.tags).includes(target)}
