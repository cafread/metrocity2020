const globScl = 1;
const width  = 1536 * globScl;
const height = 1024 * globScl;
let prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);
var colorToId = {"#000000": 0};
var idToColor = {"0": "#000000", "": "#000000"};
var cityData = [];
d3.csv("res/city_mesh.csv", (err, dat) => {
  if (err) throw err;
  cityData = dat;
  dat.forEach(d => colorGen_mk(d.mc_id));
  createMap();
});
let tile = d3.geo.tile().size([width, height]);
let projection = d3.geo.mercator()
    .scale(1 << 15)
    .translate([-width / 2, -height / 2]);
let zoom = d3.behavior.zoom()
    .scale(1 << 15) // For pixel perfect tiles, scale is acceptable
    .scaleExtent([23171, 46340])
    .translate(projection([10, 10]).map(x => -x))
    .on("zoom", zoomed);
let container = d3.select("#container")
    .style("width", width + "px")
    .style("height", height + "px")
    .call(zoom)
    .on("mousemove", mousemoved);
let base = d3.select('#map');
let chart = d3.select('#citiesCanvas')
    .attr("class", "mapLayer")
    .attr('width', width)
    .attr('height', height);
let output = d3.select('#outputCanvas')
    .attr('class', 'outputLayer')
    .attr('width', width)
    .attr('height', height);
let citiesContext = chart.node().getContext('2d');
let outputContext = output.node().getContext('2d');
let mapLayer = d3.select('.mapLayer');
let info = document.getElementById("info");
moveToTile();

function createMap () {
  let rad = Math.pow(zoom.scale(), 0.4) / 20;
  cityData = cityData.map(d => {
    [d.x, d.y] = projection([d.lo, d.la]);
    [d.x2, d.y2] = projection([d.mc_lo, d.mc_la]);
    d.r = rad;
    d.f = idToColor[d.mc_id];
    return d;
  });
  drawCanvas();
}
function drawCanvas () {
  cityData.forEach(d => {
    citiesContext.beginPath();
		citiesContext.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
		citiesContext.fillStyle = d.f;
    citiesContext.fill();
    citiesContext.closePath();
    // Now draw line
    if (d.mc_id !== "") {
      citiesContext.strokeStyle = d.f;
      citiesContext.beginPath();
      citiesContext.moveTo(d.x, d.y);
      citiesContext.lineTo(d.x2, d.y2);
      citiesContext.stroke();
    }
    // Draw label
    if (d.city_id === d.mc_id) {
      citiesContext.fillStyle = "black";
      citiesContext.font = "15px Arial";
      citiesContext.fillText(d.mc_name, d.x2 + 10, d.y2);
    }
  });
}
function reDraw () {
  // Clear cities
  citiesContext.clearRect(0, 0, width, height);
  // Clear the output
  outputContext.clearRect(0, 0, width, height);
  // Plot cities again
  drawCanvas();
}
function zoomed () {
  // Update projection
  projection
    .scale(zoom.scale() / 2 / Math.PI)
    .translate(zoom.translate());
  // Re-project cities
  let rad = Math.pow(zoom.scale(), 0.4) / 20;
  cityData = cityData.map(d => {
    [d.x, d.y] = projection([d.lo, d.la]);
    [d.x2, d.y2] = projection([d.mc_lo, d.mc_la]);
    d.r = rad;
    return d;
  });
  reDraw(); // Maybe call this with a boolean for hasScaled ?
  // Map tiles
  let tiles = tile.scale(zoom.scale()).translate(zoom.translate())();
  // Base map layer
  let image = mapLayer
    .style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))
    .selectAll(".tile")
      .data(tiles, d => d);
  image.exit().remove();
  image.enter().append("img")
    .attr("class", "tile")
    .attr("src",   d => "https://" + ["a", "b", "c"][Math.random() * 3 | 0] + ".basemaps.cartocdn.com/light_all/" + d[2] + "/" + d[0] + "/" + d[1] + ".png")
    .style("left", d => (d[0] << 8) + "px")
    .style("top",  d => (d[1] << 8) + "px");
  // Current MC result
  d3.selectAll(".masterTile").style("opacity", 0.15);
  let master = mapLayer
    .style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))
    .selectAll(".masterTile")
      .data(tiles, d => d);
      master.exit().remove();
  master.enter().append("img")
    .attr("class", "masterTile")
    .attr("src", d => "tiles/" + lpad(d[0], 3) + "_" + lpad(d[1], 3) + ".png")
    .attr("onerror", "this.src='tiles/none.png'")
    .style("opacity", 0.15)
    .style("left", d => (d[0] << 8) + "px")
    .style("top",  d => (d[1] << 8) + "px");
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
function mousemoved () {}
function colorGen_mk (id) {
  // Generates a unique color which can be mapped back to the id
  if (idToColor.hasOwnProperty(id)) return; // Dupe check
  // console.log("unmapped id:" + id);
  let colorCode = randomRGBA();
  while (colorToId.hasOwnProperty(colorCode)) { // Dupe check
    colorCode = randomRGBA();
  }
  colorToId[colorCode] = id;
  idToColor[id] = colorCode;
}
function moveToTile (x=60, y=40) {
  zoom.translate([256 * (64 - x), 256 * (64 - y)]);
  zoomed();
}