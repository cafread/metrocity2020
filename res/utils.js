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