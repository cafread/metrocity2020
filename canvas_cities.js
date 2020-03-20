const nullTile = "data:image/octet-stream;base64,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";
const tileCode = "data:image/octet-stream;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAA"; // Tile results all start with this
const globScl = 1;
const width  = 1536 * globScl; // 256 * 6 and tiles are 256x256 pixels
const height = 1024 * globScl; // 256 * 4
const prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);
let cityData = [];
let isFrozen = false;
d3.json("2020cities15k_trimmed.json", (err, dat) => {
//d3.json("2020cities15k.json", (err, dat) => {
  // Trimmed variant removes all locations where at their location another location is returned for the metro city query
  if (err) throw err;
  cityData = dat;
  dat.forEach(d => colorGen(d.i));
  createMap();
});
let tile = d3.geo.tile().size([width, height]);
let projection = d3.geo.mercator()
    .scale(32768)
    .translate([-width / 2, -height / 2]);
let zoom = d3.behavior.zoom()
    .scale(32768) // For pixel perfect tiles, scale is acceptable
    .scaleExtent([32768, 32768])
    .on("zoom", zoomed);
let container = d3.select("#container")
    .style("width", width + "px")
    .style("height", height + "px")
    .call(zoom)
    .on("mousemove", mousemoved);
let base = d3.select("#map");
let chart = d3.select("#citiesCanvas")
    .attr("class", "mapLayer")
    .attr("width", width)
    .attr("height", height);
let output = d3.select("#outputCanvas")
    .attr("class", "outputLayer")
    .attr("width", width)
    .attr("height", height);
let penColor = "rgba(255,255,255,1)";
let citiesContext = chart.node().getContext("2d");
let outputContext = output.node().getContext("2d");
let mapLayer = d3.select(".mapLayer");
let info = document.getElementById("info");
let quadtree;
let qtBound = new Rectangle(width / 2, height / 2, width * 1.2, height * 1.2);
moveToTile();

function createMap () {
  if (isFrozen) return;
  let rad = Math.pow(zoom.scale(), 0.4) / 20;
  cityData = cityData.map(d => {
    [d.x, d.y] = projection([d.lo, d.la]);
    d.r = rad;
    d.f = idToColor[d.i];
    return d;
  });
  drawCanvas();
}
function drawCanvas () {
  if (isFrozen) return;
  quadtree = new QuadTree(qtBound, 1);
  cityData.forEach(d => {
    let pt = new Point(d.x, d.y, d);
    quadtree.insert(pt);
    citiesContext.beginPath();
		citiesContext.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
		citiesContext.fillStyle = d.f;
    citiesContext.fill();
    citiesContext.closePath();
  });
}
/*// This is the code which was used to generate the trimmed variant of the city data
var relevantLocs = [];
function trimPoints (elements) {
  elements.each(function (d) {
    let node = d3.select(this);
    let mc = search(+node.attr("x"), +node.attr("y"));
    if (mc && mc.i && +node.attr("id") === mc.i) relevantLocs.push(mc.i);
  });
  reDraw ();
}*/
function reDraw () {
  if (isFrozen) return;
  // Clear cities
  citiesContext.clearRect(0, 0, width, height);
  // Clear the output
  if (document.getElementById("mcControls") && document.getElementById("mcControls").style )document.getElementById("mcControls").style.visibility = "hidden";
  outputContext.clearRect(0, 0, width, height);
  // Plot cities again
  drawCanvas();
}
function zoomed () {
  if (isFrozen) return;
  // Update projection
  // translateExtent([[-27, 21], [27, 0]]) // Testing
  projection
    .scale(zoom.scale() / 2 / Math.PI)
    .translate(zoom.translate());
  // Re-project cities
  let rad = Math.pow(zoom.scale(), 0.4) / 20;
  cityData = cityData.map(d => {
    [d.x, d.y] = projection([d.lo, d.la]);
    d.r = rad;
    return d;
  });
  reDraw();
  // Map tiles
  let tiles = tile.scale(zoom.scale()).translate(zoom.translate())();
  let image = mapLayer
    .style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))
    .selectAll(".tile")
      .data(tiles, d => d);
  image.exit().remove();
  image.enter().append("img")
    .attr("class", "tile")
    .attr("src",   d => "https://" + ["a", "b", "c"][Math.random() * 3 | 0] + ".basemaps.cartocdn.com/light_all/" + d[2] + "/" + d[0] + "/" + d[1] + ".png")
    //.attr("src",   d => xyToMasterTile(d[0], + d[1]))
    //.attr("src",   d => "tiles/" + lpad(d[0], 3) + "_" + lpad(d[1], 3) + ".png")
    .style("left", d => (d[0] << 8) + "px")
    .style("top",  d => (d[1] << 8) + "px");
}
// Find the nodes within the specified rectangle.
function search (x, y) {
  // Given a projected x, y, return the most influential metro city
  let range = new Rectangle(...projBBox(x, y, true));
  let candidates = quadtree.query(range);
  if (candidates.length === 0) return;
  // Caution here to not mutate the points
  let [lo, la] = projection.invert([x, y]);
  let cands = candidates.map(d => {
    let thisDist = greatCircleKm (la, lo, d.userData.la, d.userData.lo);
    let thisScore = genScore(d.userData.p, thisDist);
    return {
      i: d.userData.i,
      n: d.userData.n,
      p: d.userData.p,
      s: thisScore,
      d: thisDist
    };
  });
  return cands.filter(d => d.s > 0).sort((a, b) => b.s - a.s)[0];
}
function xyToMasterTile (x, y) {
  let storedTile = localStorage.getItem([x, y].map(d => lpad(Number(d), 3)).join("_"));
  if (storedTile === null) return nullTile;
  return tileCode + LZString.decompress(storedTile);
}
// Basic conversions
const deg2rad = (degs) => Math.PI * degs / 180.0;
const rad2deg = (rads) => 180.0 * rads / Math.PI;
function projBBox (cx, cy, simple) {
  // Generate a bounding box based on a distance in all directions
  const searchDist = 100;
  // x, y are the centre of the rectangle we wish to create
  let [lo, la] = projection.invert([cx, cy]); // lo, la in degrees
  if (simple === true) {
    // https://en.wikipedia.org/wiki/Latitude
    // Longitude: 1 deg = 111.320 * cos(latitude in radians) km
    let longAdj = searchDist / (111.320 * Math.cos(deg2rad(la)));
    let x = projection([lo - longAdj, la])[0];
    // Latitude: 1 deg = 110.574 km at the equator
    let latAdj = searchDist / [110.574, 110.649, 110.852, 111.132, 111.412, 111.618, 111.694][Math.round(Math.abs(la) / 15)];
    let y = projection([lo, la + latAdj])[1];
    let w = projection([lo + longAdj, la])[0] - x;
    let h = projection([lo, la - latAdj])[1] - y;
    return [x + w / 2, y + h / 2, w, h];
  }
  // Complex method for verification
  // Semi-axes of WGS-84 geoidal reference
  const WGS84_a = 6378137.0;  // Major semiaxis in metres
  const WGS84_b = 6356752.3;  // Minor semiaxis in metres
  // Earth radius at a given latitude, according to the WGS-84 ellipsoid in metres
  function WGS84EarthRadius (lat) {
    // http://en.wikipedia.org/wiki/Earth_radius
    let An = WGS84_a * WGS84_a * Math.cos(lat);
    let Bn = WGS84_b * WGS84_b * Math.sin(lat);
    let Ad = WGS84_a * Math.cos(lat);
    let Bd = WGS84_b * Math.sin(lat);
    return Math.sqrt((An*An + Bn*Bn) / (Ad*Ad + Bd*Bd));
  }
  // Bounding box surrounding the point at given coordinates,
  // assuming local approximation of Earth surface as a sphere
  // of radius given by WGS84
  let lat = deg2rad(la);
  let lon = deg2rad(lo);
  let halfSide = searchDist * 1000;
  // Radius of Earth at given latitude
  let radius = WGS84EarthRadius(lat);
  // Radius of the parallel at given latitude
  let pradius = radius * Math.cos(lat);
  let latMin = rad2deg(lat - halfSide / radius);
  let latMax = rad2deg(lat + halfSide / radius); // latmax - latmin should be ~ 2 degrees
  let lonMin = rad2deg(lon - halfSide / pradius);
  let lonMax = rad2deg(lon + halfSide / pradius);
  // Re-project
  let x = projection([lonMin, la])[0];
  let y = projection([lo, latMax])[1];
  let h = projection([lo, latMin])[1] - y;
  let w = projection([lonMax, la])[0] - x;
  return [x + w / 2, y + h / 2, w, h];
}
function matrix3d (scale, translate) {
  let k = scale / 256, r = scale % 1 ? Number : Math.round;
  return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1 ] + ")";
}
function prefixMatch (p) {
  let i = -1, n = p.length, s = document.body.style;
  while (++i < n) if (p[i] + "Transform" in s) return "-" + p[i].toLowerCase() + "-";
  return "";
}
function mousemoved () {
  let metroCity = search(...d3.mouse(this));
  if (metroCity && metroCity.n) {
    metroCity = metroCity.n + ", id: " + metroCity.i + ", pop: " + metroCity.p + ", color: " + idToColor[metroCity.i];
  } else {
    metroCity = "None";
  }
  let thisPosition = ", [" + d3.mouse(this).toString() +"], ";
  let thisLatLong = formatLocation(projection.invert(d3.mouse(this)), zoom.scale());
  info.textContent = metroCity + thisPosition + thisLatLong;
}
function formatLocation (p, k) {
  let format = d3.format("." + Math.floor(Math.log(k) / 2 - 2) + "f");
  return (p[1] < 0 ? format(-p[1]) + " S" : format(p[1]) + " N") + " "
       + (p[0] < 0 ? format(-p[0]) + " W" : format(p[0]) + " E");
}
function greatCircleKm (lat1, lon1, lat2, lon2) {
  let R = 6371; // Radius of the earth in km
  let dLat = deg2rad(lat2 - lat1);
  let dLon = deg2rad(lon2 - lon1);
  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c; // Distance in km
  return d;
}
function genScore (pop, dist) {
  return Math.sqrt(pop) * (100 - dist);
}
function mapMCs (scl=8) {
  if (isFrozen) return;
  reDraw(); // Just to be sure that things are ready
  let xCount = Math.floor(width / scl);
  let yCount = Math.floor(height / scl);
  for (let i = 0; i < xCount; i++) {
    for (let j = 0; j < yCount; j++) {
      shadeMap(i * scl, j * scl, scl);
    }
  }
  document.getElementById("mcControls").style.visibility = "visible";
}
// Note there are 1.6 million pixels, many of which will contain nothing
// so the code should be written with this in mind rather than going at it 1.6 million times!
function shadeMap (x=0, y=0, w=8) { // Can tighten size if performance / quality balance is off
  // width = height as square
  // This is intended for web workers - many threads can be triggered
  // Note that x is the left, y, the top, not the centroid as in a Rectangle
  // 0, 0, 16 are defaults for the initial call
  // This will be called recursively for dense areas
  let MC = {
    nw: search(x    , y    ), // North West corner
    ne: search(x + w, y    ), // North East corner
    sw: search(x    , y + w), // South West corner
    se: search(x + w, y + w)  // South East corner
  };
  if (mcEqual(MC)) {
    // Draw the full size rectangle on the canvas
    let outputId = MC.nw ? MC.nw.i : 0;
    if (outputId > 0) {
      outputContext.fillStyle = idToColor[outputId];
      outputContext.fillRect(x, y, w, w);
    }
  } else if (w === 2) {
    // Draw corner points
    let corners = ["nw", "ne", "sw", "se"];
    let outputId;
    for (let c of corners) {
      outputId = MC[c] ? MC[c].i : 0;
      if (outputId > 0) {
        outputContext.fillStyle = idToColor[outputId];
        outputContext.fillRect(x, y, w, w);
      }
    }
  } else {
    // Sub-divide
    shadeMap(x,       y      , w/2, w/2);
    shadeMap(x + w/2, y      , w/2, w/2);
    shadeMap(x      , y + w/2, w/2, w/2);
    shadeMap(x + w/2, y + w/2, w/2, w/2);
  } 
  // let imgData = outputContext.getImageData(x, y, w, h);
}
function mcEqual (mc4) { // Test if four corner MCs have the same id
  let nw = mc4.nw ? mc4.nw.i : 0;
  let ne = mc4.ne ? mc4.ne.i : 0;
  if (nw !== ne) return false;
  let sw = mc4.sw ? mc4.sw.i : 0;
  if (nw !== sw) return false;
  let se = mc4.se ? mc4.se.i : 0;
  return nw === se;
}
function colorGen (id) {
  // Generates a unique color which can be mapped back to the id
  if (idToColor.hasOwnProperty(id)) return; // Dupe check
  console.log("unmapped id:" + id);
  let colorCode = randomRGBA();
  while (colorToId.hasOwnProperty(colorCode)) { // Dupe check
    colorCode = randomRGBA();
  }
  colorToId[colorCode] = id;
  idToColor[id] = colorCode;
}
function randomRGBA () {
  let [r, g, b] = [Math.random()*255 | 0, Math.random()*255 | 0, Math.random()*255 | 0];
  return "rgba(" + r + "," + g + "," + b + ",1)";
}
function saveResult () {
  let outCanvas = document.getElementById("outputCanvas");
  let outImage = outCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  window.location.href=outImage;
}
function generateMaster () {
  if (!confirm("Are you sure? This will take a little while and will clear local storage")) return;
  localStorage.clear();
  let tileX = 0;  // Range is 00 to 127, window is 6 tiles wide (1536px)
  let tileY = 17; // Range is 17 to 087, window is 4 tiles tall (1024px)
  moveToTile(tileX, tileY);
  while (tileY < 88) {
    console.log("executing for y = " + tileY + " of 87");
    while (tileX < 128) {
      mapMCs();
      persistResult();
      moveToTile(tileX, tileY);
      if (tileX === 124) {
        tileX = 128;
      } else {
        tileX = Math.min(124, tileX + 6);
      }
    }
    tileX = 0;
    tileY = tileY + 4;
    moveToTile(tileX, tileY);
  }
  moveToTile(); // Reset back to the UK
}
function moveToTile (x=60, y=40) {
  zoom.translate([256 * (64 - x), 256 * (64 - y)]);
  zoomed();
}
function persistResult () {
  let tileCoords = d3.select("#container").selectAll(".tile")[0].map(d => d3.select(d).attr("src").substr(44, 15).replace(".png", "").split("/"));
  let minTileX = d3.min(tileCoords, d => +d[0]);
  let minTileY = d3.min(tileCoords, d => +d[1]);
  let outCanvas = document.getElementById("outputCanvas");
  let hiddenCanvas = document.getElementById("hiddenCanvas");
  hiddenCanvas.width = 256;
  hiddenCanvas.height = 256;
  let hiddenContext = hiddenCanvas.getContext("2d");
  let row = 0;
  let col = 0;
  let outTile;
  let _key = "";
  while (row < 4) { // Row is our Y
    while (col < 6) { // Col is our X
      if (minTileX + col < 128) {
        hiddenContext.clearRect(0, 0, 256, 256);
        hiddenContext.drawImage(outCanvas, col * 256, row * 256, 256, 256, 0, 0, 256, 256);
        outTile = hiddenCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        _key = lpad(minTileX + col, 3) + "_" + lpad(minTileY + row, 3);
        let compressedTile = LZString.compress(outTile.replace(tileCode, ""));
        if (outTile !== nullTile) localStorage.setItem(_key, compressedTile);
        col++;
      } else {
        col = 10; // End if we have tried to get something beyond maximum x tile
      }
    }
    col = 0;
    row++;
  }
}
function zipAndDownload() {
  let zip = new JSZip();
  let tls = zip.folder("tiles");
  let lsKeys = Object.keys(localStorage);
  lsKeys.forEach(k => {
    let b64Str = tileCode.substring(31, 78) + LZString.decompress(localStorage.getItem(k));
    tls.file(k + ".png", b64Str, {base64: true});
  });
  zip.generateAsync({type:"blob"}).then(function(content) {saveAs(content, "tiles.zip");});
}
function getTileData (x, y) {
  let _key = lpad(x, 3) + "_" + lpad(y, 3);
  let compressed = localStorage.getItem(_key);
  if (compressed === null) return nullTile;
  let uncompressed = LZString.decompress(compressed);
  return tileCode + uncompressed;
}
function lpad (str, len, padChar="0") {
  str = str + "";
  let retLen = Math.max(str.length, len);
  return padChar.repeat(retLen - str.length) + str;
}
function saveInfo () {
  // Save projection of [0, 0], [width, 0], [0, height], [width, height]
  // Save idToColor
  let proj = {
    scale: zoom.scale(),
    nw: projection.invert([0, 0]),
    ne: projection.invert([width, 0]),
    sw: projection.invert([0, height]),
    se: projection.invert([width, height])
  }
  const encode = (s) => new Uint8Array(s.split("").map(d => d.charCodeAt()));
  let data = encode(JSON.stringify({proj: proj, idToColor: idToColor}, null, 2));
  let blob = new Blob([data], {type: 'application/octet-stream'});
  url = URL.createObjectURL(blob);
  let link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "metroCityInfo.json");
  let event = document.createEvent("MouseEvents");
  event.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
  link.dispatchEvent(event);
}
function setOpacity (sliderValue) {
  document.getElementById("outputCanvas").style.opacity = sliderValue / 100;
}
function toggleFrozen () {
  isFrozen = document.getElementById("frozenToggle").checked;
  if (!isFrozen) {
    document.getElementById("outputCanvas").style.cursor = "pointer";
    document.getElementById("mapMCs").style.visibility = "visible";
    document.getElementById("brushInfo").style.visibility = "hidden";
    d3.select("#outputCanvas").on("click", null);
    allowDrawing = false;
    busyDrawing = false
  } else {
    enableSample ();
    penColor = "rgba(255,255,255,1)";
    document.getElementById("colorPot").style.background = penColor;
    document.getElementById("mapMCs").style.visibility = "hidden";
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
