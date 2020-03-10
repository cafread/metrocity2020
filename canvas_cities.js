let width = 1600;
let height = 900;
let prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);
d3.json("2020cities15k.json", (err, dat) => {
  if (err) throw err;
  createMap(dat);
});
let tile = d3.geo.tile().size([width, height]);
let projection = d3.geo.mercator()
    .scale(300)
    .translate([-width / 2, -height / 2]);
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
let quadtree;
zoomed(); // Initial draw

function createMap (dataset) {
  let rad = Math.pow(zoom.scale(), 0.4) / 50;
  let dataBinding = locations.selectAll("points.arc")
    .data(dataset)
  		.enter()
      .append("points")
        .classed("arc", true)
        .attr("x", d => projection([d.lo, d.la])[0])
        .attr("y", d => projection([d.lo, d.la])[1])
        .attr("radius", rad)
        .attr("id", d => d.i)
        .attr("name", d => d.n)
        .attr("fillStyle", "#000000")
  drawCanvas();
}
function drawCanvas () {
  let elements = locations.selectAll("points.arc");
  // {i: d.i, n: d.n, la: d.la, lo: d.lo, p: d.p}
  let qtBound = new Rectangle(0, 0, width, height);
  quadtree = new QuadTree(qtBound, 4);
  elements.each(function (d) {
    let node = d3.select(this);
    let pt = new Point(+node.attr("x"), +node.attr("y"), d);
    quadtree.insert(pt);
    context.beginPath();
		context.arc(node.attr("x"), node.attr("y"), node.attr("radius"), 0, 2 * Math.PI);
		context.fillStyle = node.attr("fillStyle");
    context.fill();
    context.closePath();
	});
}
function reDraw () {
	context.clearRect(0, 0, width, height);
	drawCanvas();
}
function zoomed () {
  let tiles = tile.scale(zoom.scale()).translate(zoom.translate())();
  let rad = Math.pow(zoom.scale(), 0.4) / 50;
  projection
    .scale(zoom.scale() / 2 / Math.PI)
    .translate(zoom.translate());
	d3.selectAll("points.arc")
    .attr("x", d => projection([d.lo, d.la])[0])
    .attr("y", d => projection([d.lo, d.la])[1])
    .attr("radius", rad);
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
// Find the nodes within the specified rectangle.
function search (x, y) {
  // Given a projected x, y, return the most influential metro city
  let range = new Rectangle(...projBBox(x, y, true));
  let candidates = quadtree.query(range);
  if (candidates.length === 0) return; // TODO: decide what to do here
  if (candidates.length === 1) {
    return {
      i: candidates[0].userData.i,
      n: candidates[0].userData.n
    };
  }
  // Caution here to not mutate the points
  let [lo, la] = projection.invert([x, y]);
  let cands = candidates.map(d => {
    let thisDist = greatCircleKm (la, lo, d.userData.la, d.userData.lo);
    let thisScore = genScore(d.userData.p, thisDist);
    return {
      i: d.userData.i,
      n: d.userData.n,
      s: thisScore,
      d: thisDist
    };
  });
  return cands.filter(d => d.d <= 100).sort((a, b) => b.s - a.s)[0];
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
    return [x, y, w, h];
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
  return [x, y, w, h];
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
    metroCity = metroCity.n;
  } else {
    metroCity = "None";
  }
  let thisPosition = ", [" + d3.mouse(this).toString() +"], ";
  let thisLatLong = formatLocation(projection.invert(d3.mouse(this)), zoom.scale());
  info.text(metroCity + thisPosition + thisLatLong);
}
//function mousemoved () {info.text(formatLocation(projection.invert(d3.mouse(this)), zoom.scale()));}
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