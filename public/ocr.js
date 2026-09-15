let workerPromise,queue=Promise.resolve();
const OCR_TIMEOUT_MS=120000;

export function normalizeOcrText(value){return String(value||'').replace(/\s+/g,' ').trim().slice(0,50000)}

function worker(onProgress){
  if(!globalThis.Tesseract?.createWorker)throw new Error('OCR engine unavailable');
  workerPromise||=globalThis.Tesseract.createWorker('eng',1,{
    workerPath:'/vendor/tesseract/worker.min.js',
    corePath:'/vendor/tesseract/core/tesseract-core-lstm.wasm.js',
    langPath:'/vendor/tesseract/lang',
    workerBlobURL:false,
    logger:message=>onProgress?.(message)
  }).catch(error=>{workerPromise=undefined;throw error});
  return workerPromise;
}

export function recognizePhoto(blob,onProgress){
  const job=queue.then(async()=>{let engine=await worker(onProgress),timer;try{let result=await Promise.race([engine.recognize(blob),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('OCR timed out')),OCR_TIMEOUT_MS)})]);return normalizeOcrText(result?.data?.text)}catch(error){if(error?.message==='OCR timed out'){await engine.terminate();workerPromise=undefined}throw error}finally{clearTimeout(timer)}});
  queue=job.catch(()=>{});
  return job;
}
