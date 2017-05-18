var canvas,
ctx,
initializationDone,
diskPixelRadius,
diskPixelSquared,
arcRes,
selectThresholdSquared,
selectLabelThreshold,
selectedList,
selectError,
clicked,
mousePixelX,
mousePixelY,
mouseWorldX,
mouseWorldY,
mouseDrag,
mousePolar,
cursorStr,
highlightBrightness,
highlightDelta,
fileObject,
animatePoint,
animateFrameCount,
animateAngle,
animateMinCircleRadius,
labelCoordinates,
labelConstructHelp,
labelMeasureHelp,
labelMeasurements,
labelTitle,
labelComments,
menuConstruct,
menuMeasure,
menuGallery,
menuSelectUnhide,
buttonColorPicker,
switchAnimate,
dialogOpenFile,
gameMode,
nextLabelCode,
commentStr,
titleStr,
fontSize,
textNormal,
textBold,
virtualPoint,
virtualObj,
POINT_PIXELS = 4,
COLOR_CANVAS_BACKGROUND = '#a0b4a0',
COLOR_WORLD_BACKGROUND = '#FFFFFF',
COLOR_BLACK = '#000000',
COLOR_POINT = '#463264',
COLOR_SEGMENT = '#1560DC',
COLOR_RAY = '#FF7518',
COLOR_LINE = '#C81432',
COLOR_CIRCLE = '#008000',
COLOR_ERROR = '#A00000',
objList,
MODE = {
  SEGMENT: 1,
  RAY: 2,
  LINE: 3,
  CIRCLE: 4,
  INTERSECTION: 5,
  POINT_ON_OBJ: 6,
  POINT_FREE: 7,
  LABEL: 8,
  COMMENT: 9,
  MEASURE_SEGMENT: 10,
  MEASURE_ANGLE: 11,
  MEASURE_TRIANGLE: 12,
  MOVE_POINT: 13,
  HIDE: 14,
  DELETE: 15,
  ANIMATE: 16
},
SELECT_TYPE = {
  ANY_DRAWABLE: 0,
  POINT: 1,
  LINE_OR_CIRCLE: 2
},
STATUS = {
  STATIONARY: 1,
  MOVED: 2,
  DELETE: 3
},
info = Array(12);
info[MODE.SEGMENT] = '<b>Instrucciones:</b> Pulsa en dos puntos del disco de Poincar&eacute; para construir el segmento de línea entre ellos.';
info[MODE.RAY] = '<b>Instrucciones:</b> Pulsa en dos puntos del disco de Poincar&eacute; para construir el rayo que parte del primero y pasa por el segundo.';
info[MODE.LINE] = '<b>Instrucciones:</b> Pulsa en dos puntos del disco de Poincar&eacute; para construir la línea infinita que pasa por ellos.';
info[MODE.CIRCLE] = '<b>Instrucciones:</b> First click within the Poincar&eacute; disk to define a center point, then on a second point to define the circle\'s radius.';
info[MODE.POINT_FREE] = '<b>Instrucciones:</b> Plot a point by clicking anywhere within the Poincar&eacute; disk.A point created in this way is a <i>free point</i>, meaning that it is not dependant on any other points or objects and can be moved anywhere within the disk.';
info[MODE.INTERSECTION] = '<b>Instrucciones:</b> Click on two objects (any combination of Lines, Segments or Circles) to construct the intersection point(s) of the two objects.<br><br>Note: If the selected objects do not currently intersect, then nothing new will display; however, if the objects are later moved so that they do intersect, then the intersection point(s) will be displayed.';
info[MODE.POINT_ON_OBJ] = '<b>Instrucciones:</b> Click on an object (a line, ray, segment or circle) to construct a point on and bound to that object.<br><br>Once constructed, the point may be moved anywhere on the object.';
info[MODE.MOVE_POINT] = '<b>Instrucciones:</b> Move a point by click-and-drag. Free points may be dragged anywhere within the Poincar&eacute; disk. Points constructed on an object may be moved along that object. A point constructed as intersection can only be moved by moving the points that change the intersection.<br>';
info[MODE.LABEL] = '<b>Instrucciones:</b> <em>Add</em> or <em>change</em> a point\'s label: Mouseover the point. While it is highlighted, press an alphabetic key.<br><br><em>Remove</em> a label and <em>delete measurements</em> to that label by pressing the spacebar on a highlighted point.<br><br><em>Move</em> a label by click-and-drag.<br>';
info[MODE.HIDE] = '<b>Instrucciones:</b> Click on a point, line, ray, segment or circle to hide it.<br>Note: Hiding a point will also hide any measurements to that point in the orange measurements area.<br>';
info[MODE.DELETE] = '<b>Instrucciones:</b> Click on a point, line, ray, segment or circle to delete it <em>and all objects that depend on it</em>.<br>';
info[MODE.ANIMATE] = '<b>Instrucciones:</b> Watch as the animation script randomly moves points. Note that objects (lines, segments and circles) in NonEuiclid are dependant on points and move when any point on which they depend moves. The <i>free points</i> can move anywhere in the disk. Points constructed <i>on</i> an object are constrained to that object and points constructed as the <i>intersection</i> of objects can only move as the objects move.<br>';
info[MODE.MEASURE_SEGMENT] = '<b>Instrucciones:</b> Click any two points to measure the distance (as measured in hyperbolic geometry) between the points. Notice that the shortest distance between any two points is along the line segment between those points. In symbols: &#8739;AB&#8739; &le; &#8739;AC&#8739;+&#8739;CB&#8739; for any points A, B and C.If A, B and C are collinear, then &#8739;AB&#8739; = &#8739;AC&#8739;+&#8739;CB&#8739; <br><br><em>Be aware:</em> Due to rounding, you will see: <em>1.01 + 1.01 = 2.01</em> when the exact numbers are: 1.006 + 1.006 = 2.012 since those particular addends round up while the sum rounds down.<br>';
info[MODE.MEASURE_ANGLE] = '<b>Instrucciones:</b> Click any three points to measure the angle in degrees with the second point as the vertex and first and last defining the legs of the angle.<br>';
info[MODE.MEASURE_TRIANGLE] = '<b>Instrucciones:</b> Click any three points to measure a triangle\'s three angles and the length of each side.<br>';
function Point(a, b, c, d, f) {
  this.type = c;
  this.hide = !1;
  this.status = STATUS.MOVED;
  this.color = COLOR_POINT;
  this.x = a;
  this.y = b;
  this.label = void 0;
  this.labelDx = 1 + fontSize / 2;
  this.labelDy = - 4;
  this.parent1 = d;
  this.parent2 = f;
  this.sibling = void 0;
  this.isSubordinate = !1
}
function HypObject(a, b, c, d) {
  this.type = a;
  this.hide = !1;
  this.status = STATUS.MOVED;
  this.color = COLOR_BLACK;
  this.p1 = b;
  this.p2 = c;
  this.p3 = d;
  this.beta = this.alpha = this.y0 = this.x0 = this.r = void 0;
  this.glowCount = 0;
  this.color = buttonColorPicker.value;
  isMeasure(a) && (this.glowCount = 256, a === MODE.MEASURE_SEGMENT ? (88 < nextLabelCode && (nextLabelCode = 65), void 0 === b.label && (b.label = String.fromCharCode(nextLabelCode++)), void 0 === c.label && (c.label = String.fromCharCode(nextLabelCode++)))  : (87 < nextLabelCode && (nextLabelCode = 65), void 0 ===
  b.label && (b.label = String.fromCharCode(nextLabelCode++)), void 0 === c.label && (c.label = String.fromCharCode(nextLabelCode++)), void 0 === d.label && (d.label = String.fromCharCode(nextLabelCode++))));
  updateObject(this)
}
window.onload = init;
function init() {
  initializationDone = !1;
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  cursorStr = 'default';
  document.body.style.cursor = cursorStr;
  fontSize = 14;
  textNormal = '14px Arial';
  textBold = 'bold 14px Arial';
  ctx.font = textNormal;
  ctx.textAlign = 'center';
  selectLabelThreshold = fontSize / 2 * (fontSize / 2);
  animateMinCircleRadius = 0.05;
  canvas.onmousedown = mouseDown;
  canvas.onmouseup = mouseUp;
  canvas.onmousemove = mouseMove;
  document.onkeydown = keyDown;
  labelCoordinates = document.getElementById('labelCoordinates');
  labelConstructHelp = document.getElementById('labelConstructHelp');
  labelMeasureHelp = document.getElementById('labelMeasureHelp');
  menuConstruct = document.getElementById('menuConstruct');
  menuMeasure = document.getElementById('menuMeasure');
  menuGallery = document.getElementById('menuGallery');
  labelMeasurements = document.getElementById('labelMeasurements');
  labelTitle = document.getElementById('labelTitle');
  labelComments = document.getElementById('labelComments');
  dialogOpenFile = document.getElementById('openFileDialog');
  menuSelectUnhide = document.getElementById('menuSelectUnhide');
  switchAnimate = document.getElementById('switchAnimate');
  switchAnimate.checked = !0;
  switchAnimate.onclick = function () {
    toggleAnimate()
  };
  buttonColorPicker = document.getElementById('buttonColorPicker');
  dialogOpenFile.addEventListener('change', loadLocalFile, !1);
  virtualPoint = new Point;
  virtualObj = new HypObject;
  mousePolar = void 0;
  setSize();
  var a = 'IsoscelesTriangle.csv',
  b = Math.random();
  0.125 > b ? a = 'TriangleMedianAndCentroid.csv' : 0.25 > b ? a = 'Circle.csv' : 0.375 >
  b ? a = 'WhatIsNonEuclid.csv' : 0.5 > b ? a = 'ParallelLines.csv' : 0.625 > b ? a = 'Rhombus.csv' : 0.75 > b ? a = 'Pseudosphere.csv' : 0.875 > b && (a = 'Altitude.csv');
  loadFromServer(a)
}
function initPart2(a) {
  menuConstruct.onchange = menuConstructChange;
  menuMeasure.onchange = menuMeasureChange;
  menuGallery.onchange = menuGalleryChange;
  initializationDone = !0;
  requestAnimationFrame(update)
}
function setSize() {
  diskPixelRadius = canvas.width / 2;
  diskPixelSquared = diskPixelRadius * diskPixelRadius;
  arcRes = 0.4 / diskPixelRadius;
  var a = (POINT_PIXELS + 4) / (2 * diskPixelRadius);
  selectThresholdSquared = a * a
}
function clear(a) {
  selectedList = [
  ];
  objList = [
  ];
  highlightBrightness = 1;
  highlightDelta = 0.03;
  nextLabelCode = 65;
  clicked = !1;
  virtualObj.status = STATUS.MOVED;
  animatePoint = void 0;
  gameMode = a;
  a === MODE.ANIMATE ? (menuConstructClear(), menuMeasureClear(), switchAnimate.checked = !0)  : a === MODE.MOVE_POINT ? (menuConstructClear(), menuMeasureChange('ModeMove'))  : (menuMeasureClear(), menuGalleryClear(), menuConstructChange('ModeSegment'))
}
function update() {
  var a,
  b,
  c = !1;
  highlightBrightness += highlightDelta;
  0 < highlightDelta && 2.25 < highlightBrightness ? highlightDelta = - 0.03 : 0 > highlightDelta && 1 > highlightBrightness && (highlightDelta = 0.03);
  ctx.fillStyle = COLOR_CANVAS_BACKGROUND;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = COLOR_WORLD_BACKGROUND;
  ctx.beginPath();
  ctx.arc(diskPixelRadius, diskPixelRadius, diskPixelRadius, 0, 2 * Math.PI);
  ctx.fill();
  labelMeasurements.innerHTML = '';
  var d = Number.MAX_VALUE;
  if (gameMode === MODE.ANIMATE) {
    for (a = 0; a < objList.length; a++) objList[a].type ===
    MODE.CIRCLE && objList[a].r < d && (d = objList[a].r);
    animate()
  }
  for (a = 0; a < objList.length; a++) {
    var f = objList[a];
    if (f.status !== STATUS.STATIONARY) for (void 0 === f.status ? areParentsDefined(f) && updateObject(f)  : f.status === STATUS.MOVED && updateObject(f), b = a + 1; b < objList.length; b++) setStatusIfDirectDependant(f, objList[b])
  }
  if (gameMode === MODE.ANIMATE) for (a = 0; a < objList.length; a++) objList[a].type === MODE.CIRCLE && objList[a].r < d && objList[a].r < animateMinCircleRadius && setRandomAnimationPoint();
  for (a = 0; a < objList.length; a++) objList[a].hide ?
  c = !0 : drawObject(objList[a]);
  for (a = 0; a < selectedList.length; a++) drawObject(selectedList[a], !0);
  for (a = 0; a < objList.length; a++) objList[a].status === STATUS.MOVED && (objList[a].status = STATUS.STATIONARY);
  (isLine(gameMode) || gameMode === MODE.CIRCLE) && 0 < selectedList.length && (mouseWorldX !== selectedList[0].x || mouseWorldY !== selectedList[0].y) && mousePolar && (virtualObj.status === STATUS.MOVED && (virtualPoint.x = mouseWorldX, virtualPoint.y = mouseWorldY, virtualObj.type = gameMode, virtualObj.p1 = selectedList[0], virtualObj.p2 = virtualPoint, updateObject(virtualObj)), virtualObj.color = brighten(buttonColorPicker.value, highlightBrightness), drawObject(virtualObj));
  menuSelectUnhide.disabled = c ? !1 : !0;
  requestAnimationFrame(update)
}
function setStatusIfDirectDependant(a, b) {
  if (void 0 !== b.status && b.type !== MODE.POINT_FREE) if (b.type === MODE.POINT_ON_OBJ) b.parent1 === a && (b.status = a.status);
   else if (b.type === MODE.INTERSECTION) {
    if (b.parent1 === a || b.parent2 === a) b.status = a.status
  } else if (b.p1 === a || b.p2 === a || b.p3 === a) b.status = a.status
}
function updateObject(a) {
  a.status = STATUS.MOVED;
  (isLine(a.type) || a.type === MODE.MEASURE_SEGMENT) && updateLine(a);
  a.type === MODE.MEASURE_ANGLE ? updateMeasureAngle(a)  : a.type === MODE.CIRCLE ? updateCircle(a)  : a.type === MODE.INTERSECTION ? updateIntersection(a)  : a.type === MODE.POINT_ON_OBJ && updatePointOnObj(a)
}
function updateLine(a) {
  var b = a.p1.x,
  c = a.p1.y,
  d = a.p2.x,
  f = a.p2.y,
  e = findLine(b, c, d, f);
  a.r = e.r;
  a.x0 = e.x0;
  a.y0 = e.y0;
  a.type === MODE.LINE || a.type === MODE.MEASURE_SEGMENT ? (e = findBoundaryPoints(a.x0, a.y0, a.r), b = e.x1, c = e.y1, d = e.x2, f = e.y2)  : a.type === MODE.RAY && (e = findBoundaryPoints(a.x0, a.y0, a.r), isCbetweenPandQ(d, f, b, c, e.x1, e.y1, a.x0, a.y0) ? (d = e.x1, f = e.y1)  : (d = e.x2, f = e.y2));
  b = findAlphaBeta(b, c, d, f, a.x0, a.y0);
  a.alpha = b.alpha;
  a.beta = b.beta;
  a.beta < a.alpha && (a.alpha = b.beta, a.beta = b.alpha)
}
function updateCircle(a) {
  var b = findCircle(a.p1.x, a.p1.y, a.p2.x, a.p2.y);
  a.r = b.r;
  a.x0 = b.x0;
  a.y0 = b.y0;
  a.alpha = 0;
  a.beta = 2 * PI
}
function updateIntersection(a) {
  if (!a.isSubordinate) {
    var b = a.parent1,
    c = a.parent2,
    b = findIntersection(b.x0, b.y0, b.r, c.x0, c.y0, c.r),
    d,
    f,
    e;
    void 0 === a.sibling ? (a.x = b.p1.x, a.y = b.p1.y)  : (a.sibling.status = STATUS.MOVED, void 0 === b.p1.x ? (a.x = void 0, a.y = void 0, a.sibling.x = void 0, a.sibling.y = void 0)  : void 0 === b.p2.x ? (a.x = b.p1.x, a.y = b.p1.y, a.sibling.x = void 0, a.sibling.y = void 0)  : void 0 === a.x ? (c = a.sibling.x - b.p1.x, d = a.sibling.y - b.p1.y, f = a.sibling.x - b.p2.x, e = a.sibling.y - b.p2.y, c * c + d * d < f * f + e * e ? (a.sibling.x = b.p1.x, a.sibling.y = b.p1.y, a.x = b.p2.x, a.y = b.p2.y)  : (a.sibling.x = b.p2.x, a.sibling.y = b.p2.y, a.x = b.p1.x, a.y = b.p1.y))  : (c = a.x - b.p1.x, d = a.y - b.p1.y, f = a.x - b.p2.x, e = a.y - b.p2.y, c * c + d * d < f * f + e * e ? (a.x = b.p1.x, a.y = b.p1.y, a.sibling.x = b.p2.x, a.sibling.y = b.p2.y)  : (a.x = b.p2.x, a.y = b.p2.y, a.sibling.x = b.p1.x, a.sibling.y = b.p1.y)), void 0 === a.sibling.x && (a.sibling.status = void 0));
    void 0 === a.x && (a.status = void 0)
  }
}
function updateMeasureAngle(a) {
  a.alpha = findAngle(a.p1.x, a.p1.y, a.p2.x, a.p2.y, a.p3.x, a.p3.y)
}
function updatePointOnObj(a) {
  var b = findPointOnLineNearP(a.parent1.x0, a.parent1.y0, a.parent1.r, a.x, a.y);
  a.x = b.x;
  a.y = b.y
}
function animate() {
  void 0 === animatePoint && setRandomAnimationPoint();
  animateFrameCount++;
  var a = xyToPolar(animatePoint.x, animatePoint.y),
  b = 0.01 / (1 + a.radius),
  a = movePoint(animatePoint, animatePoint.x + b * Math.cos(animateAngle), animatePoint.y + b * Math.sin(animateAngle));
  void 0 === a ? animateAngle = animateAngle * Math.PI + Math.PI * (Math.random() - Math.random()) / 2 : 100 < animateFrameCount && Math.random() < b && setRandomAnimationPoint()
}
function movePoint(a, b, c) {
  a.type === MODE.POINT_ON_OBJ && (c = findPointOnLineNearP(a.parent1.x0, a.parent1.y0, a.parent1.r, b, c), b = c.x, c = c.y);
  var d = xyToPolar(b, c);
  void 0 !== d && (a.x = b, a.y = c, a.status = STATUS.MOVED);
  return d
}
function areParentsDefined(a) {
  if (isPoint(a.type)) {
    if (void 0 !== a.parent1 && void 0 === a.parent1.status || void 0 !== a.parent2 && void 0 === a.parent2.status) return !1
  } else if (void 0 === a.p1.status || void 0 === a.p2.status || void 0 !== a.p3 && void 0 === a.p3.status) return !1;
  return !0
}
function setRandomAnimationPoint() {
  animatePoint = void 0;
  var a,
  b = 0;
  for (a = 0; a < objList.length; a++) objList[a].hide || objList[a].type !== MODE.POINT_FREE && objList[a].type !== MODE.POINT_ON_OBJ || b++;
  if (!(1 > b)) {
    animateFrameCount = 0;
    b = randomInt(b) + 1;
    for (a = 0; a < objList.length && (objList[a].hide || objList[a].type !== MODE.POINT_FREE && objList[a].type !== MODE.POINT_ON_OBJ || (b--, animatePoint = objList[a], 0 !== b)); a++);
    animateAngle = 2 * Math.PI * Math.random()
  }
}
function isSelected(a) {
  var b = selectedList.length;
  clicked || b--;
  for (var c = 0; c < b; c++) if (selectedList[c] === a) return !0;
  return !1
}
function drawObject(a, b) {
  if (void 0 !== a.status) {
    if (b) {
      var c = a.color;
      gameMode === MODE.DELETE && (c = COLOR_ERROR);
      ctx.strokeStyle = brighten(c, highlightBrightness);
      ctx.lineWidth = 4
    } else ctx.strokeStyle = a.color,
    ctx.lineWidth = 2;
    isPoint(a.type) ? drawPoint(a, b)  : isLine(a.type) ? drawLine(a, b)  : a.type === MODE.CIRCLE ? drawCircle(a, b)  : a.type === MODE.MEASURE_SEGMENT ? displayDistance(a)  : a.type === MODE.MEASURE_ANGLE ? displayAngleMeasure(a)  : a.type === MODE.MEASURE_TRIANGLE && displayTriangle(a)
  }
}
function drawPoint(a, b) {
  var c = toScreenX(a.x),
  d = toScreenY(a.y);
  ctx.beginPath();
  ctx.arc(c, d, POINT_PIXELS, 0, 2 * Math.PI);
  ctx.stroke();
  a.label && (b && selectError ? (ctx.font = textBold, ctx.fillStyle = COLOR_ERROR)  : b ? (ctx.font = textBold, ctx.fillStyle = ctx.strokeStyle)  : ctx.fillStyle = a.color, ctx.fillText(a.label, c + a.labelDx, d + a.labelDy), b && (ctx.font = textNormal))
}
function drawLine(a) {
  var b = a.alpha,
  c = a.beta;
  ctx.beginPath();
  var d = toScreenX(a.r * Math.cos(b) + a.x0),
  f = toScreenY(a.r * Math.sin(b) + a.y0),
  e = arcRes / a.r;
  ctx.moveTo(d, f);
  for (b += e; b < c; b += e) d = toScreenX(a.r * Math.cos(b) + a.x0),
  f = toScreenY(a.r * Math.sin(b) + a.y0),
  ctx.lineTo(d, f);
  ctx.stroke()
}
function drawCircle(a) {
  var b = toScreenX(a.x0),
  c = toScreenY(a.y0);
  a = a.r * diskPixelRadius;
  ctx.beginPath();
  ctx.arc(b, c, a, 0, 2 * Math.PI);
  ctx.stroke()
}
function applyGlow(a, b) {
  return '<b style="color:' + gray(b) + '">' + a + '</b>'
}
function displayDistance(a) {
  var b = getHyperbolicDistance(a.p1.x, a.p1.y, a.p2.x, a.p2.y, {
    x0: a.x0,
    y0: a.y0,
    r: a.r
  }),
  b = '&#8739;' + a.p1.label + a.p2.label + '&#8739; = ' + b.toFixed(2);
  a.glowCount && (b = applyGlow(b, a.glowCount), a.glowCount = Math.max(0, a.glowCount - 2));
  labelMeasurements.innerHTML += b + '<br>'
}
function displayAngleMeasure(a) {
  var b = (a.alpha * RAD_TO_DEGREE).toFixed(1);
  0.1 > a.alpha && (b = '< 0.1');
  b = 'm&ang;' + a.p1.label + a.p2.label + a.p3.label + ' = ' + b + '&deg;';
  a.glowCount && (b = applyGlow(b, a.glowCount), a.glowCount = Math.max(0, a.glowCount - 2));
  labelMeasurements.innerHTML += b + '<br>'
}
function displayTriangle(a) {
  var b = findAngle(a.p2.x, a.p2.y, a.p1.x, a.p1.y, a.p3.x, a.p3.y) * RAD_TO_DEGREE,
  c = findAngle(a.p1.x, a.p1.y, a.p2.x, a.p2.y, a.p3.x, a.p3.y) * RAD_TO_DEGREE,
  d = findAngle(a.p1.x, a.p1.y, a.p3.x, a.p3.y, a.p2.x, a.p2.y) * RAD_TO_DEGREE,
  f = findLine(a.p2.x, a.p2.y, a.p3.x, a.p3.y),
  e = findLine(a.p1.x, a.p1.y, a.p3.x, a.p3.y),
  g = findLine(a.p1.x, a.p1.y, a.p2.x, a.p2.y),
  f = getHyperbolicDistance(a.p2.x, a.p2.y, a.p3.x, a.p3.y, f).toFixed(2),
  e = getHyperbolicDistance(a.p1.x, a.p1.y, a.p3.x, a.p3.y, e).toFixed(2),
  g = getHyperbolicDistance(a.p1.x, a.p1.y, a.p2.x, a.p2.y, g).toFixed(2),
  h = a.p1.label,
  k = a.p2.label,
  l = a.p3.label,
  m = b + c + d,
  b = 'Triangle   ' + h + k + l + ':<br><table><tr><td>Length: &nbsp;&nbsp;</td> <td>&#8739;' + k + l + '&#8739; = ' + f + ',&nbsp;&nbsp;&nbsp;</td> <td>&#8739;' + h + l + '&#8739; = ' + e + ',&nbsp;&nbsp;&nbsp;</td> <td>&#8739;' + h + k + '&#8739; = ' + g + '</td></tr> <tr><td>Angle:</td> <td>' + h + ' = ' + b.toFixed(1) + '&deg;,</td> <td>' + k + ' = ' + c.toFixed(1) + '&deg;,</td> <td>' + l + ' = ' + d.toFixed(1) + '&deg;,</td> </tr><tr><td colspan=2>Angle Sum = ' + m.toFixed(1) +
  '&deg;</td><td colspan=2>Area = ' + (180 - m).toFixed(1) + '&deg;</td></tr></table><br>';
  a.glowCount && (b = applyGlow(b, a.glowCount), a.glowCount = Math.max(0, a.glowCount - 2));
  labelMeasurements.innerHTML += b + '<br>'
}
function getObject(a, b, c, d, f) {
  for (var e = void 0, g = 0; g < objList.length; g++) if (objList[g].type === a) if (a === MODE.MEASURE_ANGLE) {
    if (!(objList[g].p2 !== c || objList[g].p1 !== b && objList[g].p1 !== d || objList[g].p3 !== b && objList[g].p3 !== d)) {
      e = objList[g];
      break
    }
  } else if (a === MODE.MEASURE_TRIANGLE) {
    if (objList[g].p1 === b || objList[g].p1 === c || objList[g].p1 === d) if (objList[g].p2 === b || objList[g].p2 === c || objList[g].p2 === d) if (objList[g].p3 === b || objList[g].p3 === c || objList[g].p3 === d) {
      e = objList[g];
      break
    }
  } else if (a === MODE.CIRCLE) {
    if (objList[g].p1 ===
    b && objList[g].p2 === c) {
      e = objList[g];
      break
    }
  } else if (objList[g].p1 === b || objList[g].p1 === c) if (objList[g].p2 === b || objList[g].p2 === c) {
    e = objList[g];
    break
  }
  e && f && (e.hide = !1, e.color = buttonColorPicker.value, isMeasure(a) && (objList[g].p1 = b, objList[g].p2 = c, objList[g].p3 = d, e.glowCount = 256));
  return e
}
function mouseMove(a) {
  a = select(a);
  if (mouseDrag) {
    a = selectedList[0];
    if (gameMode === MODE.MOVE_POINT) {
      movePoint(a, mouseWorldX, mouseWorldY);
      return
    }
    if (gameMode === MODE.LABEL) {
      a.labelDx = Math.max( - fontSize, Math.min(fontSize, mousePixelX - toScreenX(a.x)));
      a.labelDy = Math.max( - fontSize, Math.min(1.5 * fontSize, mousePixelY - toScreenY(a.y)));
      return
    }
  }
  a && (clicked = !1);
  mousePolar = xyToPolar(mouseWorldX, mouseWorldY);
  displayPolar(mousePolar)
}
function mouseDown(a) {
  mouseDrag = !1;
  var b = select(a);
  b && (gameMode === MODE.ANIMATE && (menuMeasureChange('ModeMove'), b = select(a)), selectError || (clicked = !0));
  a = xyToPolar(mouseWorldX, mouseWorldY);
  displayPolar(a);
  if (void 0 === a) clearSelection();
   else if (void 0 === b && doesModeCreateNewPoints(gameMode) && (b = new Point(mouseWorldX, mouseWorldY, MODE.POINT_FREE), objList.push(b), selectedList.push(b), clicked = !0), doesModeHaveNeededSelection(gameMode)) {
    if (gameMode === MODE.INTERSECTION) constructIntersection();
     else if (gameMode !==
    MODE.POINT_FREE) if (gameMode === MODE.POINT_ON_OBJ) constructPointOnObject();
     else {
      if (gameMode === MODE.MOVE_POINT || gameMode === MODE.LABEL) {
        mouseDrag = !0;
        return
      }
      gameMode === MODE.HIDE ? hideObject(b)  : gameMode === MODE.DELETE ? deleteObject(b)  : (b = getObject(gameMode, selectedList[0], selectedList[1], selectedList[2], !0), b || (b = new HypObject(gameMode, selectedList[0], selectedList[1], selectedList[2]), objList.push(b)))
    }
    clearSelection()
  }
}
function mouseUp() {
  mouseDrag && clearSelection()
}
function keyDown(a) {
  a.preventDefault();
  gameMode !== MODE.LABEL || 1 > selectedList.length || !isPoint(selectedList[0].type) || (a = a.keyCode, 32 === a ? (selectedList[0].label = void 0, deleteMeasurementsWithUndefinedLabels())  : 65 > a || 122 < a || 90 < a && 97 > a || (selectedList[0].label = String.fromCharCode(a).toUpperCase()))
}
function hideObject(a) {
  a.hide = !0;
  for (var b = 0; b < objList.length; b++) isMeasure(objList[b].type) && (objList[b].p1 === a ? objList[b].hide = !0 : objList[b].p2 === a ? objList[b].hide = !0 : objList[b].p2 === a && (objList[b].hide = !0))
}
function constructIntersection() {
  for (var a = selectedList[0], b = selectedList[1], c = 0; c < objList.length; c++) if (!(objList[c].type !== MODE.INTERSECTION || objList[c].parent1 !== a && objList[c].parent1 !== b || objList[c].parent2 !== a && objList[c].parent2 !== b)) {
    objList[c].hide = !1;
    objList[c].sibling && (objList[c].sibling.hide = !1);
    return
  }
  var d = findIntersection(a.x0, a.y0, a.r, b.x0, b.y0, b.r),
  c = new Point(d.p1.x, d.p1.y, MODE.INTERSECTION, a, b);
  objList.push(c);
  if (a.type === MODE.CIRCLE || b.type === MODE.CIRCLE) a = new Point(d.p2.x, d.p2.y, MODE.INTERSECTION, a, b),
  objList.push(a),
  c.sibling = a,
  a.sibling = c,
  a.isSubordinate = !0
}
function constructPointOnObject() {
  var a = selectedList[0],
  b = findPointOnLineNearP(a.x0, a.y0, a.r, mouseWorldX, mouseWorldY),
  a = new Point(b.x, b.y, MODE.POINT_ON_OBJ, a);
  objList.push(a)
}
function deleteObject(a) {
  var b;
  for (b = 0; b < objList.length && a !== objList[b]; b++);
  a.status = STATUS.DELETE;
  for (a = b; a < objList.length; a++) if (objList[a].status === STATUS.DELETE) for (b = a + 1; b < objList.length; b++) setStatusIfDirectDependant(objList[a], objList[b]);
  for (a = objList.length - 1; 0 <= a; a--) objList[a].status === STATUS.DELETE && objList.splice(a, 1)
}
function deleteMeasurementsWithUndefinedLabels() {
  for (var a = objList.length - 1; 0 <= a; a--) {
    var b = objList[a];
    isMeasure(b.type) && (void 0 === b.p1.label || void 0 === b.p2.label || b.p3 && void 0 === b.p3.label) && objList.splice(a, 1)
  }
}
function doesModeCreateNewPoints(a) {
  return a === MODE.SEGMENT || a === MODE.RAY || a === MODE.LINE || a === MODE.CIRCLE || a === MODE.POINT_FREE ? !0 : !1
}
function doesModeHaveNeededSelection(a) {
  if (3 === selectedList.length) {
    if (a === MODE.MEASURE_ANGLE || a === MODE.MEASURE_TRIANGLE) return !0
  } else if (2 === selectedList.length) {
    if (isLine(a) || a === MODE.CIRCLE || a === MODE.INTERSECTION || a === MODE.MEASURE_SEGMENT) return !0
  } else if (1 === selectedList.length && (a === MODE.POINT_FREE || a === MODE.POINT_ON_OBJ || a === MODE.LABEL || a === MODE.MOVE_POINT && !selectError || a === MODE.HIDE || a === MODE.DELETE)) return !0;
  return !1
}
function isMatchingType(a, b) {
  return b === SELECT_TYPE.ANY_DRAWABLE && (isLine(a.type) || a.type === MODE.CIRCLE || isPoint(a.type)) ? !0 : b !== SELECT_TYPE.LINE_OR_CIRCLE || !isLine(a.type) && a.type !== MODE.CIRCLE ? !1 : !0
}
function showHidden() {
  for (var a = 0; a < objList.length; a++) objList[a].hide && (objList[a].hide = !1);
  menuMeasureChange('ModeMove')
}
labelCoordinates = document.getElementById('labelCoordinates');
labelConstructHelp = document.getElementById('labelConstructHelp');
labelMeasureHelp = document.getElementById('labelMeasureHelp');
function menuConstructClear() {
  menuConstruct.value = '';
  labelConstructHelp.innerHTML = ' ';
  buttonColorPicker.style.visibility = 'hidden'
}
function menuMeasureClear() {
  menuMeasure.value = '';
  labelMeasureHelp.innerHTML = ' '
}
function menuGalleryClear() {
  titleStr = commentStr = menuGallery.value = '';
  labelComments.innerHTML = commentStr;
  labelTitle.innerHTML = titleStr
}
function menuConstructChange(a) {
  clearSelection();
  a instanceof Event ? a = menuConstruct.value : menuConstruct.value = a;
  if ('ModeSegment' === a) gameMode = MODE.SEGMENT,
  buttonColorPicker.value = COLOR_SEGMENT;
   else if ('ModeRay' === a) gameMode = MODE.RAY,
  buttonColorPicker.value = COLOR_RAY;
   else if ('ModeLine' === a) gameMode = MODE.LINE,
  buttonColorPicker.value = COLOR_LINE;
   else if ('ModeCircle' === a) gameMode = MODE.CIRCLE,
  buttonColorPicker.value = COLOR_CIRCLE;
   else if ('ModeIntersect' === a) gameMode = MODE.INTERSECTION,
  buttonColorPicker.value = COLOR_POINT;
   else if ('ModePointOnObj' === a) gameMode = MODE.POINT_ON_OBJ,
  buttonColorPicker.value = COLOR_POINT;
   else if ('ModePoint' === a) gameMode = MODE.POINT_FREE,
  buttonColorPicker.value = COLOR_POINT;
   else return;
  switchAnimate.checked = !1;
  labelConstructHelp.innerHTML = info[gameMode];
  menuMeasureClear();
  isPoint(gameMode) ? buttonColorPicker.style.visibility = 'hidden' : buttonColorPicker.style.visibility = 'visible'
}
function menuMeasureChange(a) {
  clearSelection();
  a instanceof Event ? a = menuMeasure.value : menuMeasure.value = a;
  if ('ModeClear' === a) clear();
   else {
    if ('ModeLabel' === a) gameMode = MODE.LABEL;
     else if ('ModeComment' === a) gameMode = MODE.COMMENT;
     else if ('ModeMeasureLength' === a) gameMode = MODE.MEASURE_SEGMENT;
     else if ('ModeMeasureAngle' === a) gameMode = MODE.MEASURE_ANGLE;
     else if ('ModeMeasureTriangle' === a) gameMode = MODE.MEASURE_TRIANGLE;
     else if ('ModeMove' === a) gameMode = MODE.MOVE_POINT;
     else if ('ModeHide' === a) gameMode = MODE.HIDE;
     else if ('ModeUnhide' === a) showHidden();
     else if ('ModeDelete' === a) gameMode = MODE.DELETE;
     else return;
    switchAnimate.checked = !1;
    labelMeasureHelp.innerHTML = info[gameMode];
    menuConstructClear()
  }
}
function menuGalleryChange() {
  clearSelection();
  var a = menuGallery.value;
  'What is Non-Euclidean Geometry?' === a ? loadFromServer('WhatIsNonEuclid.csv')  : 'Circle' === a ? loadFromServer('Circle.csv')  : 'Isosceles Triangle' === a ? loadFromServer('IsoscelesTriangle.csv')  : 'Altitudes' === a ? loadFromServer('Altitude.csv')  : 'Area' === a ? loadFromServer('Area.csv')  : 'Pseudosphere' === a ? loadFromServer('Pseudosphere.csv')  : 'Parallel Lines' === a ? loadFromServer('ParallelLines.csv')  : 'Rhombus' === a ? loadFromServer('Rhombus.csv')  : 'Triangle Medians and Centroid' ===
  a ? loadFromServer('TriangleMedianAndCentroid.csv')  : 'ModeLoadLocal' === a ? showFileOpenDialog()  : 'ModeSave' === a && saveConstruction()
}
function select(a) {
  mousePixelX = a.offsetX;
  mousePixelY = a.offsetY;
  mouseWorldX = toWorldX(mousePixelX);
  mouseWorldY = toWorldY(mousePixelY);
  a = void 0;
  if (isLine(gameMode)) a = selectPoint();
   else if (gameMode === MODE.CIRCLE) a = selectPoint();
   else if (gameMode === MODE.INTERSECTION) a = selectObject(SELECT_TYPE.LINE_OR_CIRCLE);
   else if (gameMode === MODE.POINT_ON_OBJ) a = selectObject(SELECT_TYPE.LINE_OR_CIRCLE);
   else if (gameMode === MODE.LABEL) a = selectPoint();
   else if (gameMode === MODE.MEASURE_SEGMENT) a = selectPoint();
   else if (gameMode ===
  MODE.MEASURE_ANGLE) a = selectPoint();
   else if (gameMode === MODE.MEASURE_TRIANGLE) a = selectPoint();
   else if (gameMode === MODE.MOVE_POINT) a = selectPoint();
   else if (gameMode === MODE.ANIMATE) a = selectPoint();
   else if (gameMode === MODE.DELETE || gameMode === MODE.HIDE) (a = selectPoint()) || (a = selectObject(SELECT_TYPE.ANY_DRAWABLE));
  if (mousePixelX !== virtualPoint.x || mousePixelY !== virtualPoint.y) virtualObj.status = STATUS.MOVED;
  clicked || selectedList.pop();
  a ? selectedList.push(a)  : 0 < selectedList.length && (clicked = !0);
  setCursor();
  return a
}
function setCursor() {
  var a = 'default';
  selectError ? a = 'not-allowed' : gameMode === MODE.LABEL ? 0 < selectedList.length && (a = 'text')  : gameMode === MODE.MOVE_POINT ? 0 < selectedList.length && !selectError && (a = selectedList[selectedList.length - 1].type === MODE.POINT_ON_OBJ ? 'ew-resize' : 'move')  : isMeasure(gameMode) ? 0 < selectedList.length && !clicked && (a = 'pointer')  : isLine(gameMode) || gameMode === MODE.CIRCLE || gameMode === MODE.POINT_FREE ? mousePolar && (a = 0 < selectedList.length && !clicked ? 'pointer' : 'crosshair')  : (gameMode === MODE.INTERSECTION || gameMode === MODE.POINT_ON_OBJ || gameMode === MODE.DELETE || gameMode === MODE.HIDE) && mousePolar && 0 < selectedList.length && !clicked && (a = 'pointer');
  a !== cursorStr && (cursorStr = a, document.body.style.cursor = cursorStr)
}
function selectPoint() {
  var a,
  b;
  selectError = !1;
  for (var c = void 0, d = void 0, f = 0; f < objList.length; f++) if (isPoint(objList[f].type)) {
    var e = objList[f];
    if (!e.hide && !isSelected(e) && (a = mouseWorldX - e.x, b = mouseWorldY - e.y, a * a + b * b < selectThresholdSquared ? c = e : e.label && (a = toScreenX(e.x), b = toScreenY(e.y), a = mousePixelX - (a + e.labelDx), b = mousePixelY - (b + e.labelDy), a * a + b * b < selectLabelThreshold && (c = e)), c)) if (gameMode === MODE.MOVE_POINT && e.type === MODE.INTERSECTION) d = c,
    c = void 0;
     else return gameMode !== MODE.LABEL && (mouseWorldX = e.x, mouseWorldY = e.y),
    c
  }
  if (d) return selectError = !0,
  d
}
function selectObject(a) {
  for (var b, c, d, f, e, g, h = 0; h < objList.length; h++) if (g = objList[h], !g.hide && !isSelected(g) && isMatchingType(g, a)) for (d = g.alpha, f = g.beta, e = 3 * arcRes / g.r; d < f; d += e) if (b = mouseWorldX - (g.r * Math.cos(d) + g.x0), c = mouseWorldY - (g.r * Math.sin(d) + g.y0), b = b * b + c * c, b < selectThresholdSquared) return g
}
function displayPolar(a, b) {
  if (void 0 === a) labelCoordinates.innerHTML = '(r= &minus;.&minus; , &phi;= &minus;.&minus;&deg;)';
   else {
    var c = a.angle * RAD_TO_DEGREE,
    d = Math.abs(c).toFixed(1);
    0 > c && (d = '&minus;' + d);
    c = '(r= ' + a.radius.toFixed(3) + ', &phi;= ' + d + '&deg;)';
    b && (c = b + ': ' + c);
    labelCoordinates.innerHTML = c
  }
}
function clearSelection() {
  selectedList = [
  ];
  mouseDrag = clicked = selectError = !1
}
function saveConstruction() {
  for (var a = 'NonEuclid fileFormat.1.0\n' + titleStr + '\n' + commentStr + '\n' + nextLabelCode + '\n', b = 0; b < objList.length; b++) a += toString(objList[b]) + '\n';
  menuGallery.value = '';
  saveTextAsFile(a, titleStr)
}
function loadFromServer(a) {
  fileObject = new XMLHttpRequest;
  fileObject.onreadystatechange = function () {
    loadFromServerReady(a)
  };
  menuGallery.value = '';
  fileObject.open('GET', a, !0);
  fileObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  fileObject.send()
}
function loadFromServerReady(a) {
  if (4 == fileObject.readyState) {
    var b = fileObject.responseText;
    initializationDone ? clear(MODE.MOVE_POINT)  : clear(MODE.ANIMATE);
    loadFromString(a, b);
    initializationDone || initPart2()
  }
}
function loadLocalFile(a) {
  var b = a.target.files[0];
  a = new FileReader;
  a.onload = function (a) {
    a = a.target.result;
    clear(MODE.MOVE_POINT);
    loadFromString(b.name, a)
  };
  a.readAsText(b, 'UTF-8')
}
function showFileOpenDialog() {
  dialogOpenFile.click();
  menuGallery.value = ''
}
function loadFromString(a, b) {
  var c = b.split('\n');
  if ('NonEuclid fileFormat.1.0' === c[0]) {
    titleStr = c[1];
    2 > titleStr.length && (titleStr = a);
    commentStr = c[2];
    nextLabelCode = Number(c[3]);
    for (var d = 4; d < c.length - 1; d++) {
      var f = c[d].split(','),
      e = Number(f[0]),
      g,
      h,
      k,
      l,
      m,
      n;
      if (isPoint(e)) {
        k = numRead(f[3]);
        var p = numRead(f[4]);
        g = numRead(f[8]);
        h = numRead(f[9]);
        0 <= g && (l = objList[g]);
        0 <= h && (m = objList[h]);
        e = new Point(k, p, e, l, m);
        e.label = strRead(f[5]);
        e.labelDx = Number(f[6]);
        e.labelDy = Number(f[7]);
        e.isSubordinate = boolRead(f[10]);
        e.isSubordinate && (e.sibling = objList[objList.length - 1], e.sibling.sibling = e, updateObject(e.sibling))
      } else g = numRead(f[3]),
      h = numRead(f[4]),
      k = numRead(f[5]),
      0 <= g && (l = objList[g]),
      0 <= h && (m = objList[h]),
      0 <= k && (n = objList[k]),
      e = new HypObject(e, l, m, n);
      e.hide = boolRead(f[1]);
      e.color = f[2];
      objList.push(e);
      toString(e)
    }
    labelTitle.innerHTML = titleStr;
    labelComments.innerHTML = commentStr;
    return titleStr
  }
}
function numRead(a) {
  a = Number(a);
  return isNaN(a) ? void 0 : a
}
function boolRead(a) {
  return 'true' === a ? !0 : !1
}
function strWrite(a) {
  return void 0 === a ? '' : a
}
function strRead(a) {
  return 0 === a.length || 'undefined' === a ? void 0 : a
}
function toString(a) {
  var b = a.type + ',',
  b = b + (a.hide + ','),
  b = b + (a.color + ',');
  isPoint(a.type) ? (b += a.x + ',', b += a.y + ',', b += strWrite(a.label) + ',', b += a.labelDx.toFixed(0) + ',', b += a.labelDy.toFixed(0) + ',', b += objList.indexOf(a.parent1).toString() + ',', b += objList.indexOf(a.parent2).toString() + ',', b += a.isSubordinate)  : (b += objList.indexOf(a.p1).toString() + ',', b += objList.indexOf(a.p2).toString() + ',', b += objList.indexOf(a.p3).toString());
  return b
}
function randomInt(a) {
  return Math.floor(Math.random() * a)
}
function toWorldX(a) {
  return (a - diskPixelRadius) / diskPixelRadius
}
function toWorldY(a) {
  return (a - diskPixelRadius) / diskPixelRadius
}
function toScreenX(a) {
  return a * diskPixelRadius + diskPixelRadius
}
function toScreenY(a) {
  return a * diskPixelRadius + diskPixelRadius
}
function isPoint(a) {
  return a === MODE.POINT_FREE || a === MODE.POINT_ON_OBJ || a === MODE.INTERSECTION ? !0 : !1
}
function isLine(a) {
  return a === MODE.SEGMENT || a === MODE.RAY || a === MODE.LINE ? !0 : !1
}
function isMeasure(a) {
  return a === MODE.MEASURE_ANGLE || a === MODE.MEASURE_SEGMENT || a === MODE.MEASURE_TRIANGLE ? !0 : !1
}
function saveTextAsFile(a, b) {
  if (void 0 === b || 1 >= b.length) b = 'myNonEuclidConstruction';
  var c = new Blob([a], {
    type: 'text/csv'
  }),
  d = document.createElement('a');
  d.download = b + '.csv';
  d.innerHTML = 'Download File';
  null != window.URL ? d.href = window.URL.createObjectURL(c)  : (d.href = window.URL.createObjectURL(c), d.onclick = destroyClickedElement, d.style.display = 'none', document.body.appendChild(d));
  d.click()
}
function destroyClickedElement(a) {
  document.body.removeChild(a.target)
}
function toggleAnimate() {
  switchAnimate.checked ? (gameMode = MODE.ANIMATE, menuConstructClear(), menuMeasureClear())  : (menuConstructClear(), menuMeasureChange('ModeMove'))
}
function zeroPad(a, b) {
  for (; a.length < b; ) a = '0' + a;
  return a
}
function gray(a) {
  return '#' + zeroPad(Math.min(255, Math.floor(a)).toString(16), 2) + zeroPad(Math.min(255, Math.floor(a)).toString(16), 2) + zeroPad(Math.min(255, Math.floor(a)).toString(16), 2)
}
function brighten(a, b) {
  var c = parseInt(a.substr(1, 2), 16),
  d = parseInt(a.substr(3, 2), 16),
  f = parseInt(a.substr(5, 2), 16),
  e = Math.max(c, d, f);
  if (255 < e * b) {
    var g = (e * b - 255) / b,
    c = c + g,
    d = d + g,
    f = f + g;
    b = 255 / e
  }
  return '#' + zeroPad(Math.min(255, Math.floor(c * b)).toString(16), 2) + zeroPad(Math.min(255, Math.floor(d * b)).toString(16), 2) + zeroPad(Math.min(255, Math.floor(f * b)).toString(16), 2)
};
