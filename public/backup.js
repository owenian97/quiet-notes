import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

export const BACKUP_FORMAT='quiet-notes-backup',BACKUP_VERSION=1;

const safeJson=value=>strToU8(JSON.stringify(value));
const sizeOf=value=>value instanceof Blob?value.size:value?.bytes?.byteLength||value?.byteLength||0;

async function recordFile(store,id,value){
  const blob=value instanceof Blob?value:new Blob([value?.bytes||value],{type:value?.type||'application/octet-stream'});
  return {id:String(id),store,type:blob.type||'application/octet-stream',size:blob.size,path:`${store}/${encodeURIComponent(String(id))}.bin`,bytes:new Uint8Array(await blob.arrayBuffer())};
}

export async function createBackup(items,photos,audio,exportedAt=new Date()){
  const records=[];
  for(const entry of photos)records.push(await recordFile('photos',entry.id,entry.value));
  for(const entry of audio)records.push(await recordFile('audio',entry.id,entry.value));
  const manifest={format:BACKUP_FORMAT,version:BACKUP_VERSION,exportedAt:exportedAt.toISOString(),counts:{items:items.length,photos:photos.length,recordings:audio.length},records:records.map(({bytes,...record})=>record)};
  const files={'manifest.json':safeJson(manifest),'items.json':safeJson(items)};
  for(const record of records)files[record.path]=record.bytes;
  const rawBytes=strToU8(JSON.stringify(items)).byteLength+records.reduce((sum,record)=>sum+record.size,0);
  return {bytes:zipSync(files,{level:0}),manifest,rawBytes};
}

function validItems(items){return Array.isArray(items)&&items.every(item=>item&&typeof item==='object'&&typeof item.id==='string'&&['IDEA','TASK','VOICE'].includes(item.type))}

export function readBackup(input){
  let files,manifest,items;
  try{files=unzipSync(input);manifest=JSON.parse(strFromU8(files['manifest.json']));items=JSON.parse(strFromU8(files['items.json']))}catch{throw new Error('This is not a valid Quiet Notes backup.')}
  if(manifest?.format!==BACKUP_FORMAT||manifest?.version!==BACKUP_VERSION)throw new Error('This backup version is not supported by this version of Quiet Notes.');
  if(!validItems(items)||!Array.isArray(manifest.records))throw new Error('The backup metadata is invalid. Nothing was changed.');
  const seen=new Set(),photos=[],audio=[];
  for(const record of manifest.records){
    if(!record||!['photos','audio'].includes(record.store)||typeof record.id!=='string'||typeof record.path!=='string'||seen.has(`${record.store}:${record.id}`))throw new Error('The backup contains invalid or duplicate records. Nothing was changed.');
    const bytes=files[record.path];
    if(!bytes||bytes.byteLength!==record.size)throw new Error('The backup is incomplete or corrupted. Nothing was changed.');
    seen.add(`${record.store}:${record.id}`);
    const value=record.store==='photos'?{bytes:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),type:record.type||'image/jpeg'}:new Blob([bytes],{type:record.type||'audio/webm'});
    (record.store==='photos'?photos:audio).push({id:record.id,value});
  }
  if(manifest.counts?.items!==items.length||manifest.counts?.photos!==photos.length||manifest.counts?.recordings!==audio.length)throw new Error('The backup counts do not match its contents. Nothing was changed.');
  return {manifest,items,photos,audio};
}

export function backupFilename(date=new Date()){return `QuietNotes-Backup-${date.toISOString().slice(0,10)}.zip`}
export function formatBytes(bytes){if(bytes<1024)return `${bytes} B`;if(bytes<1048576)return `${(bytes/1024).toFixed(1)} KB`;return `${(bytes/1048576).toFixed(1)} MB`}
export function totalStoredBytes(entries){return entries.reduce((sum,entry)=>sum+sizeOf(entry.value),0)}
