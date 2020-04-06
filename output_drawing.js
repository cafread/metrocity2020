function setOpacity (sliderValue) {
  document.getElementById("outputCanvas").style.opacity = sliderValue / 100;
  document.getElementById("editCanvas").style.opacity = sliderValue / 100;
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
    // Find tile data and draw it for x, y
    retrieveLSToDraw(x, y);
    // Fade master
    d3.selectAll(".masterTile").style("opacity", 0);
    document.getElementById("freezeControl").style.visibility = "visible";
  }
}
function topLeftTile () {
  let tileCoords = d3.select("#container").selectAll(".tile")[0].map(d => d3.select(d).attr("src").substr(44, 15).replace(".png", "").split("/"));
  let minTileX = d3.min(tileCoords, d => +d[0]);
  let minTileY = d3.min(tileCoords, d => +d[1]);
  return [minTileX, minTileY];
}
function retrieveLSToDraw (x, y) {
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
        drawWipTile (tileX, tileY, imgSrc, "outputCanvas");
      }
      tileX++;
    }
    tileX = 0;
    tileY++;
  }
  // Show detailed controls
  document.getElementById("mcControls").style.visibility = "visible";
}
function drawWipTile (tileX, tileY, imgSrc) {
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
    d3.select("#editCanvas").on("click", null);
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
  if (document.getElementById("editCanvas") !== null) document.getElementById("editCanvas").remove();
}
function enableSample () {
  // Switch from observation mode to color sampling mode
  // Set cursor to pipette to make this obvious
  document.getElementById("outputCanvas").style.cursor = "url(res/pip.png), pointer";
  if (document.getElementById("editCanvas") !== null) document.getElementById("editCanvas").remove();
  d3.select("#outputCanvas").on("click", sampleOutput);
  busyDrawing = false;
  allowDrawing = false;
}
function enablePaint () {
  // Switch to painting mode
  // Set cursor to brush to make this obvious
  document.getElementById("outputCanvas").style.cursor = "url(res/brush.png), pointer";
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
  let mc = mcid ? cityData.find(d => d.i === mcid).n : "None";
  document.getElementById("paintCity").textContent = mc;
  enablePaint ();
}

// Requires Mootools 1.4.5
// TODO move this into a class?
// Might need to alter the z-index of editCanvas and outputCanvas based on state
let myArt;
let artContext;
let busyDrawing = false;
let allowDrawing = false;

let clickX = [];
let clickY = [];
let clickDrag = [];

function addClick (x, y, dragging) {
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
  reDrawArt();
}
function reDrawArt () {
  artContext.clearRect(0, 0, width, height); // Clears the canvas
  artContext.strokeStyle = penColor;
  artContext.lineJoin = "round";
  artContext.lineWidth = document.getElementById("brushSize").value;
  for (let i = 0; i < clickX.length; i++) {
    artContext.beginPath();
    if (clickDrag[i] && i) {
      artContext.moveTo(clickX[i - 1], clickY[i - 1]);
     } else {
      artContext.moveTo(clickX[i] - 1, clickY[i]);
     }
     artContext.lineTo(clickX[i], clickY[i]);
     artContext.closePath();
     artContext.stroke();
  }
}
function transferArt () {
  // Takes the temporary work on the editCanvas and transfers it to the outputCanvas
  // This is only called once the edit work has completed and avoids glitchy drawing
  artContext.clearRect(0, 0, width, height); // Clears the edit canvas
  busyDrawing = false;
  if (penColor === "rgba(0,0,0,1)" || penColor === "rgba(255,255,255,1)") { // Erasing
    outputContext.globalCompositeOperation = "destination-out";
    outputContext.strokeStyle = "rgba(255,255,255,1)";
  } else { // Drawing
    outputContext.globalCompositeOperation = "source-over";
    outputContext.strokeStyle = penColor;
  }
  outputContext.lineJoin = "round";
  outputContext.lineWidth = document.getElementById("brushSize").value;
  for (let i = 0; i < clickX.length; i++) {
    outputContext.beginPath();
    if (clickDrag[i] && i) {
      outputContext.moveTo(clickX[i - 1], clickY[i - 1]);
     } else {
      outputContext.moveTo(clickX[i] - 1, clickY[i]);
     }
     outputContext.lineTo(clickX[i], clickY[i]);
     outputContext.closePath();
     outputContext.stroke();
  }
  clickX.length = 0;
  clickY.length = 0;
  clickDrag.length = 0;
}

function addPaint () {
  // Now to do the painty bit itself
  allowDrawing = true;
  if (document.getElementById("editCanvas") !== null) document.getElementById("editCanvas").remove(); // Just in case
  let container = document.getElementById("map");
	let editCanvas = document.createElement("canvas");
  editCanvas.setAttribute("width", width);
  editCanvas.setAttribute("height", height);
  editCanvas.setAttribute("id", "editCanvas");
  container.appendChild(editCanvas);
  // Remove this canvas later - on sample, on persist, on unfreeze d3.select("#editCanvas").remove()
  myArt = document.getElementById("editCanvas"); //
  myArt.style.cursor = "url(res/brush.png), pointer";
  artContext = myArt.getContext("2d");
  initArt ();
}
function initArt () {
  myArt.onselectstart = () => {};
  myArt.unselectable = "on";
  myArt.style.MozUserSelect = "none";
  myArt.onmousedown = function (event) {
    busyDrawing = allowDrawing;
    let mouseX = event.pageX - this.offsetLeft;
    let mouseY = event.pageY - this.offsetTop;
    busyDrawing = true;
    addClick(mouseX, mouseY, false);
  }
  myArt.onmousemove = function (e) {if (busyDrawing) addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);}
  myArt.onmouseup = () => transferArt ();
  myArt.onmouseleave = () => busyDrawing = false;
}
