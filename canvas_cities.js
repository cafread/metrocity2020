const nullTile = "data:image/octet-stream;base64,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";
const tileCode = "data:image/octet-stream;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAA"; // Tile results all start with this
const globScl = 1;
const width  = 1536 * globScl; // 256 * 6 and tiles are 256x256 pixels
const height = 1024 * globScl; // 256 * 4
const prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);
let cityData = [];
let isFrozen = false;
d3.json("res/2020cities15k_trimmed.json", (err, dat) => {
//d3.json("res/2020cities15k.json", (err, dat) => {
  // Trimmed variant removes all locations where at their location another location is returned for the metro city query
  if (err) throw err;
  cityData = dat.filter(d => excludedGeoIds.indexOf(d.i) === -1);
  cityData.forEach(d => colorGen(d.i));
  createMap();
});
let tile = d3.geo.tile().size([width, height]);
let projection = d3.geo.mercator()
    .scale(1 << 15)
    .translate([-width / 2, -height / 2]);
let zoom = d3.behavior.zoom()
    .scale(1 << 15) // For pixel perfect tiles, scale is acceptable
    .scaleExtent([1 << 15, 1 << 15])
    .on("zoom", zoomed);
let container = d3.select("#container")
    .style("width", width + "px")
    .style("height", height + "px")
    .call(zoom)
    .on("mousemove", mousemoved);
let chart = d3.select("#citiesCanvas")
    .attr("class", "mapLayer")
    .attr("width", width)
    .attr("height", height);
let output = d3.select("#outputCanvas")
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
    d.r = rad * Math.sqrt(d.p / 80000);
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
		citiesContext.fillStyle = d.p < 30000 ? "red" : "black";//d.f;
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
  if (document.getElementById("mcControls") && document.getElementById("mcControls").style)document.getElementById("mcControls").style.visibility = "hidden";
  if (document.getElementById("freezeControl") && document.getElementById("freezeControl").style)document.getElementById("freezeControl").style.visibility = "hidden";
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
    d.r = rad * Math.sqrt(d.p / 80000);
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
    .attr("src", d => d[0] > 127 ? "tiles/none.png" : "https://" + ["a", "b", "c"][Math.random() * 3 | 0] + ".basemaps.cartocdn.com/light_all/" + d[2] + "/" + d[0] + "/" + d[1] + ".png")
    .style("left", d => (d[0] << 8) + "px")
    .style("top",  d => (d[1] << 8) + "px");
  d3.selectAll(".masterTile").style("opacity", 0.15);
  let master = mapLayer
    .style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))
    .selectAll(".masterTile")
      .data(tiles, d => d);
      master.exit().remove();
  master.enter().append("img")
    .attr("class", "masterTile")
    .attr("src", d => {
      if (d[0] > 127 || d[1] < 17 || d[1] > 87) return "tiles/none.png";
      let tileKey = lpad(d[0], 3) + "_" + lpad(d[1], 3);
      if (Object.keys(localStorage).length > 1 && localStorage.getItem(tileKey) === null) return "tiles/none.png";
      return "tiles/" + tileKey + ".png";
    })
    .attr("onerror", "this.src='tiles/none.png'")
    .style("opacity", 0.15)
    .style("left", d => (d[0] << 8) + "px")
    .style("top",  d => (d[1] << 8) + "px");
}
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
function prefixMatch (p) {
  let i = -1, n = p.length, s = document.body.style;
  while (++i < n) if (p[i] + "Transform" in s) return "-" + p[i].toLowerCase() + "-";
  return "";
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
  document.getElementById("mcControls").style.visibility = "visible"; // Should only show opacity, not painting
}
function shadeMap (x=0, y=0, w=8) {
  // width = height as square
  // Note that x is the left, y, the top, not the centroid as in a Rectangle
  // This will be called recursively for dense areas
  let MC = {
    nw: search(x    , y    ), // North West corner
    ne: search(x + w, y    ), // North East corner
    sw: search(x    , y + w), // South West corner
    se: search(x + w, y + w)  // South East corner
  };
  if (mcEqual(MC)) { // Draw the full size rectangle on the canvas
    let outputId = MC.nw ? MC.nw.i : 0;
    if (outputId > 0) {
      //cityData.find(d => d.i === outputId).px += w*w;
      outputContext.fillStyle = idToColor[outputId];
      outputContext.fillRect(x, y, w, w);
    }
  } else if (w === 2) { // Draw corner points
    let corners = ["nw", "ne", "sw", "se"];
    let outputId;
    for (let c of corners) {
      outputId = MC[c] ? MC[c].i : 0;
      if (outputId > 0) {
        //cityData.find(d => d.i === outputId).px += 4;
        outputContext.fillStyle = idToColor[outputId];
        outputContext.fillRect(x, y, w, w);
      }
    }
  } else { // Sub-divide
    shadeMap(x,       y      , w/2, w/2);
    shadeMap(x + w/2, y      , w/2, w/2);
    shadeMap(x      , y + w/2, w/2, w/2);
    shadeMap(x + w/2, y + w/2, w/2, w/2);
  }
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
function generateMaster () {
  if (!confirm("Are you sure? This will take a little while and will clear local storage")) return;
  localStorage.clear();
  // For testing how many pixels each claims
  //for (let i = 0; i < cityData.length; i++) cityData[i].px = 0;
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
  alert("Master made");
}
function moveToTile (x=60, y=40) {
  zoom.translate([256 * (64 - x), 256 * (64 - y)]);
  zoomed();
}
function persistResult () {
  let [minTileX, minTileY] = topLeftTile ();
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
  document.getElementById("storeEdits").style.background = "lightgreen";
  setTimeout(function(){document.getElementById("storeEdits").style.background = "";}, 600);
}
function zipAndDownload () {
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