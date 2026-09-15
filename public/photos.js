export const PHOTO_TYPES=new Set(['image/jpeg','image/png','image/webp','image/heic','image/heif']);

export function photoSize(width,height,max=1920){
  const scale=Math.min(1,max/Math.max(width,height));
  return {width:Math.round(width*scale),height:Math.round(height*scale)};
}

export function validPhoto(file){
  return Boolean(file&&PHOTO_TYPES.has(String(file.type).toLowerCase()));
}

export function photoFilename(noteFilename,number,customTitle){
  const suffix=`-Photo-${String(number).padStart(2,'0')}.jpg`;
  let filename=String(noteFilename||'');
  if(customTitle)filename=filename.replace(/^(\[(?:Idea|Task)-)[^\]]+(\])/i,`$1${customTitle}$2`);
  return filename.replace(/\.md$/i,suffix);
}

export function nextPhotoNumber(attachments=[]){
  return attachments.reduce((max,photo)=>Math.max(max,Number(photo.number)||0),0)+1;
}

export function inheritedPhotoNames(attachments,noteFilename){
  return attachments.map(photo=>photo.inherited?{...photo,filename:photoFilename(noteFilename,photo.number)}:photo);
}
