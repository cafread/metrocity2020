let width = window.innerWidth;
let height = window.innerHeight;
let prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);
//d3.csv("ftgreenetrees.csv", function(err, dataset) {createMap(dataset)});
d3.json("2020cities15k.json", (err, dat) => {
  if (err) throw err;
  createMap(dat);
});
let tile = d3.geo.tile().size([width, height]);
let projection = d3.geo.mercator()
    .scale(300)
    .translate([-width / 2, -height / 2]); // Just temporary
let zoom = d3.behavior.zoom()
    .scale(projection.scale() * 2 * Math.PI)
    .scaleExtent([1 << 9, 1 << 25])
    .translate(projection([10, 10]).map(x => -x))
    .on("zoom", zoomed);
let container = d3.select("#container")
    .style("width", width + "px")
    .style("height", height + "px")
    .call(zoom)
    .on("mousemove", mousemoved);
let base = d3.select('#map');
let chart = d3.select('canvas')
    .attr("class", "layer")
    .attr('width', width)
    .attr('height', height);
let context = chart.node().getContext('2d');
let locations = d3.select('#points');
let layer = d3.select('.layer');
let info = base.append("div").attr("class", "info");
zoomed();
function createMap (dataset) {
  let dataBinding = locations.selectAll("points.arc")
    .data(dataset)
  		.enter()
      .append("points")
        .classed("arc", true)
        .attr("x", d => projection([d.lo, d.la])[0])
        .attr("y", d => projection([d.lo, d.la])[1])
        .attr("radius", zoom.scale() / 3000)
        .attr("fillStyle", "#000000")
  drawCanvas();
}
function drawCanvas () {
	let elements = locations.selectAll("points.arc");
  elements.each(function(d) {
    let node = d3.select(this);
    context.beginPath();
		context.arc(node.attr("x"), node.attr("y"), node.attr("radius"), 0, 2 * Math.PI);
		context.fillStyle = node.attr("fillStyle");
    context.fill();
    context.closePath();
	})
}
function reDraw () {
	context.clearRect(0, 0, width, height);
	drawCanvas();
}
function zoomed () {
  let tiles = tile.scale(zoom.scale()).translate(zoom.translate())();
  projection
    .scale(zoom.scale() / 2 / Math.PI)
    .translate(zoom.translate());
	d3.selectAll("points.arc")
    .attr("x", d => projection([d.lo, d.la])[0])
    .attr("y", d => projection([d.lo, d.la])[1]);
  reDraw();
  let image = layer
    .style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))
    .selectAll(".tile")
      .data(tiles, d => d);
  image.exit().remove();
  image.enter().append("img")
    .attr("class", "tile")
    .attr("src",   d => "http://" + ["a", "b", "c"][Math.random() * 3 | 0] + ".basemaps.cartocdn.com/light_all/" + d[2] + "/" + d[0] + "/" + d[1] + ".png")
    .style("left", d => (d[0] << 8) + "px")
    .style("top",  d => (d[1] << 8) + "px");
}
function mousemoved () {info.text(formatLocation(projection.invert(d3.mouse(this)), zoom.scale()));}
function matrix3d (scale, translate) {
  let k = scale / 256, r = scale % 1 ? Number : Math.round;
  return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1 ] + ")";
}
function prefixMatch (p) {
  let i = -1, n = p.length, s = document.body.style;
  while (++i < n) if (p[i] + "Transform" in s) return "-" + p[i].toLowerCase() + "-";
  return "";
}
function formatLocation (p, k) {
  let format = d3.format("." + Math.floor(Math.log(k) / 2 - 2) + "f");
  return (p[1] < 0 ? format(-p[1]) + " S" : format(p[1]) + " N") + " "
       + (p[0] < 0 ? format(-p[0]) + " W" : format(p[0]) + " E");
}