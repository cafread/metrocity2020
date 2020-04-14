const width  = window.innerWidth;
const height = window.innerHeight;
let prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);
var colorToId = {"#000000": 0};
var idToColor = {"0": "#000000", "": "#000000"};
var cityData = [];
d3.csv("res/hotel_city.csv", (err, dat) => {
  if (err) throw err;
  cityData = dat;
  dat.forEach(d => colorGen_mk(d.city_id));
  createMap();
});
let tile = d3.geo.tile().size([width, height]);
let projection = d3.geo.mercator()
    .scale(1 << 15)
    .translate([-width / 2, -height / 2]);
let zoom = d3.behavior.zoom()
    .scale(60000)
    .scaleExtent([10000, 1000000])
    .translate(projection([-1, 18]).map(x => -x))
    .on("zoom", zoomed);
let container = d3.select("#container")
    .style("width", width + "px")
    .style("height", height + "px")
    .call(zoom);
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
let mapLayer = d3.select('.mapLayer');
let info = document.getElementById("info");
zoomed();

function createMap () {
  let rad = Math.pow(zoom.scale(), 0.4) / 600;
  cityData = cityData.map(d => {
    [d.x, d.y] = projection([d.hotl_lon, d.hotl_lat]);
    [d.x2, d.y2] = projection([d.city_lon, d.city_lat]);
    d.r = rad * Math.sqrt(d.usage_2019);
    d.f = idToColor[d.city_id];
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
    if (d.city_id !== "") {
      citiesContext.strokeStyle = d.f;
      citiesContext.beginPath();
      citiesContext.moveTo(d.x, d.y);
      citiesContext.lineTo(d.x2, d.y2);
      citiesContext.stroke();
    }
    // Draw label
    if (d.city_id === d.city_id) {
      citiesContext.fillStyle = "black";
      citiesContext.font = "8px Arial";
      citiesContext.fillText(d.city_name, d.x2 + 7, d.y2);
    }
  });
}
function reDraw () {
  // Clear cities
  citiesContext.clearRect(0, 0, width, height);
  // Plot cities again
  drawCanvas();
}
function zoomed () {
  // Update projection
  projection
    .scale(zoom.scale() / 2 / Math.PI)
    .translate(zoom.translate());
  // Re-project
  let rad = Math.pow(zoom.scale(), 0.4) / 600;
  cityData = cityData.map(d => {
    [d.x, d.y] = projection([d.hotl_lon, d.hotl_lat]);
    [d.x2, d.y2] = projection([d.city_lon, d.city_lat]);
    d.r = rad * Math.sqrt(d.usage_2019);
    return d;
  });
  reDraw();
  let tiles = tile.scale(zoom.scale()).translate(zoom.translate())();
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