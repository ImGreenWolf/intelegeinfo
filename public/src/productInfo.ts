import { error } from "console";

try {


var video = document.createElement('video');
video.setAttribute('playsinline', '');
video.setAttribute('autoplay', '');
video.setAttribute('muted', '');
document.getElementById('video-container')!.style.width = '1920px';
document.getElementById('video-container')!.style.height = '1080px';
document.getElementById('video-container')!.style.position = "relative";
document.getElementById('video-container')!.appendChild(video)



//WebAssembly polyfill for some browsers
try { window['BarcodeDetector'].getSupportedFormats() }
//@ts-ignore
catch { window['BarcodeDetector'] = barcodeDetectorPolyfill.BarcodeDetectorPolyfill }



/* Setting up the constraint */
var facingMode = "environment"; // Can be 'user' or 'environment' to access back or front camera (NEAT!)
var constraints = {
  audio: false,
  video: {
   facingMode: facingMode,
   
   frameRate: 60,
   
  }
};

/* Stream it to video element */
if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) 
{
    window.alert('Media devices api isnt supported. Make sure the connection is secured.')
}
  navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
    video.srcObject = stream;
  const track = stream.getVideoTracks()[0];
  
    
//   const imageCapture = new (window as any).ImageCapture(track);

  // check compatibility
if (!("BarcodeDetector" in globalThis)) {
  console.log("Barcode Detector is not supported by this browser.");
} else {
  console.log("Barcode Detector supported!");

  // create new detector
  //@ts-ignore
  const barcodeDetector = new BarcodeDetector({
    });
  
let box: HTMLDivElement;
let lastCode;



checkBrowserCapabilities()
// let zoom=0;
// setInterval(() => {
//     setZoom(zoom+=0.01)
// }, 10);
const focusConstraints = {advanced: [{
    focusMode: 'manual',
    focusDistance: 0.01,
  }]};
 track.applyConstraints(focusConstraints as any);

setInterval(() => {
    if(box)
        box.remove();

  barcodeDetector
  .detect(video)
  .then((barcodes) => {
    barcodes.forEach((barcode) => {
        if(isNaN(parseInt(barcode.rawValue))) return
        const code = barcode.rawValue
        if(code == lastCode) return;
        navigator.vibrate(1)
        lastCode = code
        const pos = barcode.boundingBox as DOMRectReadOnly
        const size = 1;
         box = document.createElement('div')
        box.style.left = pos.left*size + "px";
        box.style.top = pos.top*size + "px";
        box.style.width = pos.width*size + "px";
        box.style.height = pos.height*size + "px";
        box.classList.add('barcode');
        // TODO Add matrix transform
        document.getElementById('video-container')!.appendChild(box)
        fetch('https://world.openfoodfacts.net/api/v2/product/'+barcode.rawValue+'.json', {
        method: 'GET',
        headers: { Authorization: 'Basic ' + btoa('off:off') },
        })
        .then(response => response.json())
        .then(json => displayResult(json));

        console.log(barcode.rawValue)
  });
  })
  .catch((err) => {
    console.log(err);
  });
}, 100);
}

    


async function setZoom(value){
  let expectedZoom = value;
  const zoomConstraints = {advanced: [{zoom: expectedZoom}]};
  await track.applyConstraints(zoomConstraints as any);
}



  
  
});

}
catch (err)
{
    window.alert(err)
}


function checkBrowserCapabilities(){
    //@ts-ignore
  if (navigator.mediaDevices.getSupportedConstraints().focusMode) {
    console.log("Browser supports focus mode");
  }else{
    alert("The browser does not support focus mode.");
  }
}

function displayResult(response: Record<string, any>)
{
    let htmlString = '';
    const product = response.product;
    console.log(response)
    htmlString += `<h1> ${product.product_name_ro || product.product_name_en || product.product_name || "N-am gasit nume" }</h1>`
    htmlString += `<img class="product-preview" src=${product.image_url}>`
    htmlString += `<p>${product.energy}kj</p>`
    htmlString += `<p>Alergenii: ${product.allergens}</p>`
    
    htmlString += `<p>Ingrediente: ${product.ingredients_text_with_allergens_ro || product.ingredients_text_with_allergens_en || product.ingredients_text_with_allergens}</p>`
    if(product.nutriscore[0])htmlString += `<p>Nutriscore: ${product.nutriscore_score || product.nutriscore_grade}</p>`

    for(const obj in response.product)
    {
        htmlString+="<li><span>"+obj+'</span> '+response.product[obj]+'</li>\n'
    }
    document.getElementById('result')!.innerHTML =  htmlString
}


