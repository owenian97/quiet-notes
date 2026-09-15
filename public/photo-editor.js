export function cropBounds(rect,width,height){
  if(!rect)return null;
  const x=Math.max(0,Math.min(width,Math.round(rect.x)));
  const y=Math.max(0,Math.min(height,Math.round(rect.y)));
  const w=Math.max(0,Math.min(width-x,Math.round(rect.width)));
  const h=Math.max(0,Math.min(height-y,Math.round(rect.height)));
  return w>=10&&h>=10?{x,y,width:w,height:h}:null;
}

function dataUrl(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)})}
function loadImage(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('image'));image.src=src})}
function canvasBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('encode')),'image/jpeg',.8))}

export async function openPhotoEditor(blob){
  const dialog=document.querySelector('#photoEditorDialog'),canvas=document.querySelector('#photoEditorCanvas'),cropBox=document.querySelector('#photoCropBox'),status=document.querySelector('#photoEditorStatus'),context=canvas.getContext('2d');
  const original=await dataUrl(blob),image=await loadImage(original);
  canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;context.drawImage(image,0,0);
  let mode='crop',start=null,crop=null,drawing=false,history=[],settled=false;
  const point=event=>{const box=canvas.getBoundingClientRect();return{x:(event.clientX-box.left)*canvas.width/box.width,y:(event.clientY-box.top)*canvas.height/box.height}};
  const snapshot=()=>{history.push(canvas.toDataURL('image/png'));if(history.length>5)history.shift()};
  const restore=async src=>{const saved=await loadImage(src);canvas.width=saved.naturalWidth;canvas.height=saved.naturalHeight;context.drawImage(saved,0,0);crop=null;cropBox.hidden=true};
  const showCrop=()=>{if(!crop){cropBox.hidden=true;return}cropBox.hidden=false;cropBox.style.left=`${canvas.offsetLeft+crop.x/canvas.width*canvas.clientWidth}px`;cropBox.style.top=`${canvas.offsetTop+crop.y/canvas.height*canvas.clientHeight}px`;cropBox.style.width=`${crop.width/canvas.width*canvas.clientWidth}px`;cropBox.style.height=`${crop.height/canvas.height*canvas.clientHeight}px`};
  const setMode=value=>{mode=value;if(value!=='crop'){crop=null;cropBox.hidden=true}document.querySelectorAll('[data-photo-mode]').forEach(button=>button.classList.toggle('selected',button.dataset.photoMode===value));document.querySelector('#photoCropControls').hidden=value!=='crop';document.querySelector('#photoColorControls').hidden=value==='crop';document.querySelector('#photoDrawControls').hidden=value!=='draw';document.querySelector('#photoTextControls').hidden=value!=='text';status.textContent=value==='crop'?'Drag a box over the area to keep, then tap Apply This Crop.':value==='draw'?'Draw on the photo with your finger. Scroll using the controls area.':'Type below, then tap the photo where the text should begin.'};
  canvas.onpointerdown=event=>{event.preventDefault();canvas.setPointerCapture(event.pointerId);const p=point(event);if(mode==='crop'){start=p;crop={x:p.x,y:p.y,width:0,height:0};showCrop()}else if(mode==='draw'){snapshot();drawing=true;context.beginPath();context.moveTo(p.x,p.y);context.strokeStyle=document.querySelector('#photoEditorColor').value;context.lineWidth=Number(document.querySelector('#photoBrushSize').value);context.lineCap='round';context.lineJoin='round'}else if(mode==='text'){const text=document.querySelector('#photoText').value.trim();if(!text){status.textContent='Enter text first.';return}snapshot();context.fillStyle=document.querySelector('#photoEditorColor').value;context.font=`bold ${Number(document.querySelector('#photoTextSize').value)}px system-ui`;context.textBaseline='top';context.fillText(text,p.x,p.y);status.textContent='Text added. Tap elsewhere to add it again.'}};
  canvas.onpointermove=event=>{if(mode==='crop'&&start){const p=point(event);crop={x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),width:Math.abs(p.x-start.x),height:Math.abs(p.y-start.y)};showCrop()}else if(mode==='draw'&&drawing){const p=point(event);context.lineTo(p.x,p.y);context.stroke()}};
  canvas.onpointerup=()=>{start=null;drawing=false};canvas.onpointercancel=()=>{start=null;drawing=false};
  document.querySelectorAll('[data-photo-mode]').forEach(button=>button.onclick=()=>setMode(button.dataset.photoMode));
  document.querySelector('#applyPhotoCrop').onclick=()=>{const bounds=cropBounds(crop,canvas.width,canvas.height);if(!bounds){status.textContent='Drag a crop area first.';return}snapshot();const copy=document.createElement('canvas');copy.width=bounds.width;copy.height=bounds.height;copy.getContext('2d').drawImage(canvas,bounds.x,bounds.y,bounds.width,bounds.height,0,0,bounds.width,bounds.height);canvas.width=bounds.width;canvas.height=bounds.height;context.drawImage(copy,0,0);crop=null;cropBox.hidden=true;status.textContent='Crop applied. You can keep editing or save.'};
  document.querySelector('#placePhotoText').onclick=()=>{if(!document.querySelector('#photoText').value.trim()){status.textContent='Enter text first.';return}setMode('text');status.textContent='Now tap the photo where the text should begin.'};
  document.querySelector('#undoPhotoEdit').onclick=async()=>{const previous=history.pop();if(previous)await restore(previous);else status.textContent='Nothing to undo.'};
  document.querySelector('#resetPhotoEdit').onclick=async()=>{history=[];await restore(original);status.textContent='Photo reset.'};
  setMode('crop');dialog.showModal();
  return new Promise(resolve=>{
    const finish=value=>{if(settled)return;settled=true;canvas.onpointerdown=canvas.onpointermove=canvas.onpointerup=canvas.onpointercancel=null;if(dialog.open)dialog.close();resolve(value)};
    document.querySelector('#cancelPhotoEdit').onclick=()=>finish(null);
    document.querySelector('#savePhotoEdit').onclick=async()=>{try{finish(await canvasBlob(canvas))}catch{status.textContent='Could not save this edit.'}};
    dialog.oncancel=event=>{event.preventDefault();finish(null)};
  });
}
