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
  let code = randomRGBA();
  while (!isOriginalColor (code)) code = randomRGBA();
  colorToId[code] = id;
  idToColor[id] = code;
}
function isOriginalColor (code) {
  // Check colorToId has space around each of r, g, b to avoid color collisions when the browser compresses it during Canvas.toDataURL
  if (colorToId.hasOwnProperty(code)) return false;
  let [r, g, b] = code.replace("rgba", "").replace(",1)", "").split(",");
  for (let per of compressionDebug) {
    code = "rgba(" + (r + per.r) + "," + (g + per.g) + "," + (b + per.b) + ",1)";
    if (colorToId.hasOwnProperty(code)) return false;
  }
  return true;
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
function offScreenTest (x, y) {
  if (x < -100) return false;
  if (y < -100) return false;
  if (x > width + 100) return false;
  if (y > height + 100) return false;
  return true;
}
function prefixMatch (p) {
  let i = -1;
  let n = p.length;
  let s = document.body.style;
  while (++i < n) {
    if (p[i] + "Transform" in s) {
      return "-" + p[i].toLowerCase() + "-";
    }
  }
  return "";
}
function d3GeoTile () {
  let size = [1536, 1024];
  let scale = 256;
  let translate = [size[0] / 2, size[1] / 2];
  let zoomDelta = 0;
  function tile() {
    let z = Math.max(Math.log(scale) / Math.LN2 - 8, 0);
    let z0 = Math.round(z + zoomDelta);
    let k = Math.pow(2, z - z0 + 8);
    let origin = [(translate[0] - scale / 2) / k, (translate[1] - scale / 2) / k];
    let tiles = [];
    let cols = d3.range(Math.max(0, Math.floor(-origin[0])), Math.max(0, Math.ceil(size[0] / k - origin[0])));
    let rows = d3.range(Math.max(0, Math.floor(-origin[1])), Math.max(0, Math.ceil(size[1] / k - origin[1])));
    rows.forEach(y => cols.forEach(x => tiles.push([x, y, z0])));
    tiles.translate = origin;
    tiles.scale = k;
    return tiles;
  }
  tile.size = function (_) {
    if (!arguments.length) return size;
    size = _;
    return tile;
  };
  tile.scale = function (_) {
    if (!arguments.length) return scale;
    scale = _;
    return tile;
  };
  tile.translate = function (_) {
    if (!arguments.length) return translate;
    translate = _;
    return tile;
  };
  tile.zoomDelta = function (_) {
    if (!arguments.length) return zoomDelta;
    zoomDelta = +_;
    return tile;
  };
  return tile;
};