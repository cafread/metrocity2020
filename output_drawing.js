function setOpacity (sliderValue) {
  document.getElementById("outputCanvas").style.opacity = sliderValue / 100;
}

function dispWIP () {
  let wipTileCount = Object.keys(localStorage).length;
  if (wipTileCount < 5) {
    alert("No WIP tiles found");
  } else {
    // Get top left
    let [x, y] = topLeftTile ();
    // Move to that tile
    moveToTile(x, y);
    // Call lsOut with it
    lsOut(x, y);
    // Fade master
    d3.selectAll(".masterTile").style("opacity", 0);
  }
}
function topLeftTile () {
  let tileCoords = d3.select("#container").selectAll(".tile")[0].map(d => d3.select(d).attr("src").substr(44, 15).replace(".png", "").split("/"));
  let minTileX = d3.min(tileCoords, d => +d[0]);
  let minTileY = d3.min(tileCoords, d => +d[1]);
  return [minTileX, minTileY];
}


function lsOut (x, y) {
  // Given the upper left x & y tile details, pull from localStorage all saved tiles
  let tileX = 0;
  let tileY = 0;
  let offsX = 0;
  let offsY = 0;
  let lsKey = "";
  let lsVal = "";
  let imgSrc = "";
  while (tileY < 4) {
    while (tileX < 6) {
      offsX = 256 * tileX;
      offsY = 256 * tileY;
      lsKey = lpad(x + tileX, 3) + "_" + lpad(y + tileY, 3);
      lsVal = localStorage.getItem(lsKey);
      if (lsVal !== null) {
        imgSrc = tileCode + LZString.decompress(lsVal).replace("image/octet-stream", "image/png");
        localStoreToOutput (x, y, tileX, tileY, imgSrc);
      }
      tileX++;
    }
    tileX = 0;
    tileY++;
  }
  // Show detailed controls
  document.getElementById("mcControls").style.visibility = "visible";
}
function localStoreToOutput (x, y, tileX, tileY, imgSrc) {
  let offsX = 256 * tileX;
  let offsY = 256 * tileY;
  let outCanvas = document.getElementById("outputCanvas");
  let outContext = outCanvas.getContext("2d");
  let masterTile = new Image();
  masterTile.onload = function(){outContext.drawImage(masterTile, offsX, offsY, 256, 256);};
  masterTile.src = imgSrc;
}

function toggleFrozen () {
  isFrozen = document.getElementById("frozenToggle").checked;
  if (!isFrozen) {
    document.getElementById("outputCanvas").style.cursor = "pointer";
    document.getElementById("mapMCs").style.visibility = "visible";
    document.getElementById("dispWIP").style.visibility = "visible";
    document.getElementById("brushInfo").style.visibility = "hidden";
    d3.select("#outputCanvas").on("click", null);
    allowDrawing = false;
    busyDrawing = false
  } else {
    enableSample ();
    penColor = "rgba(255,255,255,1)";
    document.getElementById("colorPot").style.background = penColor;
    document.getElementById("mapMCs").style.visibility = "hidden";
    document.getElementById("dispWIP").style.visibility = "hidden";
    document.getElementById("brushInfo").style.visibility = "visible";
    allowDrawing = false;
  }
}
function enableSample () {
  // Switch from observation mode to color sampling mode
  // Set cursor to pipette to make this obvious
  document.getElementById("outputCanvas").style.cursor = "url(pip.png), pointer";
  d3.select("#outputCanvas").on("click", sampleOutput);
  busyDrawing = false;
  allowDrawing = false;
}
function enablePaint () {
  // Switch to painting mode
  // Set cursor to brush to make this obvious
  document.getElementById("outputCanvas").style.cursor = "url(brush.png), pointer";
  d3.select("#outputCanvas").on("click", sampleOutput);
  // Do painty stuff here
  d3.select("#colorPot").on("click", enableSample);
  addPaint();
}
function sampleOutput () {
  let [x, y] = d3.mouse(this);
  let [r, g, b, a] = outputContext.getImageData(x, y, 1, 1).data;
  let rgba = "rgba(" + r + "," + g + "," + b + ",1)"; // Ignore alpha channel
  penColor = rgba;
  document.getElementById("colorPot").style.background = penColor;
  let mcid = colorToId[penColor];
  console.log(penColor, mcid);
  let mc = mcid ? cityData.find(d => d.i === mcid).n : "None";
  console.log(penColor, mcid, mc);
  document.getElementById("paintCity").textContent = mc;
  enablePaint ();
}

// Requires Mootools 1.4.5
// TODO move this into a class
let myArt = document.getElementById("outputCanvas");
let busyDrawing = false;
let allowDrawing = false;
myArt.onselectstart = () => {};
myArt.unselectable = "on";
myArt.style.MozUserSelect = "none";
myArt.onmousedown = (event) => {
  busyDrawing = allowDrawing;
  outputContext.strokeStyle = penColor;
  outputContext.lineWidth = document.getElementById("brushSize").value;
  outputContext.lineCap = "round";
  outputContext.beginPath();
  outputContext.moveTo(event.pageX - myArt.offsetLeft, event.pageY);
}
myArt.onmouseup = () => busyDrawing = false;
myArt.onmousemove = (event) => {
  if (busyDrawing) {
    outputContext.lineTo(event.pageX - myArt.offsetLeft, event.pageY);
    outputContext.stroke();
  }
}
myArt.onmouseleave = () => busyDrawing = false;
function addPaint () {
  if (penColor === "rgba(0,0,0,1)" || penColor === "rgba(255,255,255,1)") { // Erasing
    outputContext.globalCompositeOperation = "destination-out";
    outputContext.strokeStyle = "rgba(255,255,255,1)";
  } else { // Drawing
    outputContext.globalCompositeOperation = "source-over";
    outputContext.strokeStyle = penColor;
  }
  // Now to do the painty bit itself
  allowDrawing = true;
}