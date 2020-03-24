const deg2rad = (degs) => Math.PI * degs / 180.0;
const rad2deg = (rads) => 180.0 * rads / Math.PI;
function lpad (str, len, padChar="0") {
  str = str + "";
  let retLen = Math.max(str.length, len);
  return padChar.repeat(retLen - str.length) + str;
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
function matrix3d (scale, translate) {
  let k = scale / 256, r = scale % 1 ? Number : Math.round;
  return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1 ] + ")";
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
function formatLocation (p, k) {
  let format = d3.format("." + Math.floor(Math.log(k) / 2 - 2) + "f");
  return (p[1] < 0 ? format(-p[1]) + " S" : format(p[1]) + " N") + " "
       + (p[0] < 0 ? format(-p[0]) + " W" : format(p[0]) + " E");
}
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
function mousemoved (e) {
  let metroCity = "None";
  let thisPosition = ", [" + d3.mouse(this).toString() +"], ";
  let thisLatLong = formatLocation(projection.invert(d3.mouse(this)), zoom.scale());
  if (document.getElementById("mcControls").style.visibility === "visible") { // Master tiles or mc projection active
    let pixelData = outputContext.getImageData(d3.mouse(this)[0], d3.mouse(this)[1], 1, 1).data;
    let mcColor = "rgba(" + pixelData[0] + "," + pixelData[1] +  "," + pixelData[2] + ",1)";
    let mcId = colorToId[mcColor];
    if (mcId !== 0) metroCity = cityData.find(d => d.i === mcId).n;
  } else {
    metroCity = search(...d3.mouse(this));
    if (metroCity && metroCity.n) {
      metroCity = metroCity.n + ", id: " + metroCity.i + ", pop: " + metroCity.p + ", color: " + idToColor[metroCity.i];
    } else {
      metroCity = "None";
    }
  }
  info.textContent = metroCity + thisPosition + thisLatLong;
}