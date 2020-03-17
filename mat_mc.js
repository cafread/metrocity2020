// Original http://bl.ocks.org/jhubley/25f32b1f123dca4012f1
// Using a custom quadtree for locating nearby cities to consider as the d3 implementation isn't great
let globScl = 1;
let width = 1776 * globScl; // 16 x 111
let height = 912 * globScl; // 16 x 57
let prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);
var colorToId = {"#000000": 0};
var idToColor = {"0": "#000000"};
var cityData = [];
d3.csv("mat_mc.csv", (err, dat) => {
  // Trimmed variant removes all locations where at their location another location is returned for the metro city query
  if (err) throw err;
  cityData = dat;
  dat.forEach(d => colorGen(d.i, d.n));
  createMap();
});
let tile = d3.geo.tile().size([width, height]);
let projection = d3.geo.mercator()
    .scale(globScl * 300)
    .translate([-width / 2, -height / 2]);
let zoom = d3.behavior.zoom()
    .scale(projection.scale() * 2 * Math.PI)
    .scaleExtent([1885, 1 << 27])
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
let info = base.append("div").attr("class", "info");
let quadtree;
let qtBound = new Rectangle(width / 2, height / 2, width * 1.2, height * 1.2);
zoomed();

function createMap () {
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
    d.r = rad;
    return d;
  });
  reDraw(); // Maybe call this with a boolean for hasScaled ?
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
  info.text(metroCity + thisPosition + thisLatLong);
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
function mapMCs (scl=16) {
  reDraw(); // Just to be sure that things are ready
  let xCount = Math.floor(width / scl);
  let yCount = Math.floor(height / scl);
  for (let i = 0; i < xCount; i++) {
    for (let j = 0; j < yCount; j++) {
      shadeMap(i * scl, j * scl, scl);
    }
  }
}
// Note there are 1.6 million pixels, many of which will contain nothing
// so the code should be written with this in mind rather than going at it 1.6 million times!
function shadeMap (x=0, y=0, w=8) { // Can tighten size if performance / quality balance is off
  // width = height as square
  // This is intended for web workers - many 16x16 threads can be triggered
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
function colorGen (id, name) {
  // Annoyingly, this might need to be rgba rather than hexS
  // Takes the details for metrocity and inserts into colorKey a unique hexadecimal colour which can be mapped back to the id
  if (idToColor.hasOwnProperty(id)) return; // Dupe check
  let colorCode = strColor(name + id.toString());
  while (colorToId.hasOwnProperty(colorCode)) { // Dupe check
    colorCode = strColor(name + id.toString() + Math.random(1000).toString());
  }
  colorToId[colorCode] = id;
  idToColor[id] = colorCode;
}
function strColor (s) {
  let hash = 0, i, chr;
  if (s.length === 0) return "#000000";
  for (i = 0; i < s.length; i++) {
    chr   = s.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return "#" + (Math.abs(hash).toString(16) + "ffffff").substring(0, 6);
}
function saveResult () {
  let outCanvas = document.getElementById("outputCanvas");
  let outImage = outCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  window.location.href=outImage;
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