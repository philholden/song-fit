'use strict';

var canvasGetBounds = require('./canvasGetBounds');
var drawVerse = require('./drawVerse');
var Transform = require('./Transform');

//Takes a song that has been meta info about verse metrics and renders
//each verse to a canvas. w and h is the desired width and height
//the function has two passes the first pass renders larger than
//desired size in order to get better metrics. The second pass is
//at the desired size.

function calculateVersesVector(song, w, h, bounds) {
  var aspect = w / h;
  var canvas = document.createElement('canvas');
  var mLineHeight = song.fontMetrics.h * song.lineHeight;
  var sf = aspect > song.aspect ? h / song.pxHeight : w / song.maxWidth;
  var ctx;
  var padding = 4;
  var trans = new Transform();
  var transInv;
  var trueBounds;
  var overscan = 1.1;

  canvas.setAttribute('id', 'canvas-super');

  //bounds true on second pass
  if (bounds) {
    sf = aspect > bounds.w / bounds.h ?
      h / (bounds.h / (sf * overscan)) :
      w / (bounds.w / (sf * overscan));
    canvas.width = Math.ceil(sf * song.maxWidth) + padding * 2;
    canvas.height = Math.ceil(sf * song.pxHeight) + padding * 2;
  } else {
    sf *= overscan;
    canvas.width = Math.ceil(sf * song.maxWidth) + padding * 2;
    canvas.height = Math.ceil(sf * song.pxHeight) + padding * 2;
  }

  ctx = canvas.getContext('2d');
  ctx.font = song.fontHeight + 'px ' + song.fontName;
  ctx.fillStyle = '#fff';
  ctx.save();
  trans.scale(sf, sf);
  trans.translate(padding / sf, padding / sf);
  transInv = trans.getInverseTransform();
  ctx.setTransform.apply(ctx, trans.m);

  //draw all verses on top of each other
  song.verses.forEach(function(verse, i){
    drawVerse(song, i, ctx, 0, 0, false);
  });

  if (bounds) {
    bounds = canvasGetBounds(canvas);
    trueBounds = transInv.transformPoint(bounds.x, bounds.y);
    trueBounds.w = bounds.w / sf;
    trueBounds.h = bounds.h / sf;
    trueBounds.sf = sf;
    trueBounds.song = song;
    trueBounds.mLineHeight = mLineHeight;
    //document.body.appendChild(canvas);
    // canvas.style.opacity = .5;
    return trueBounds;
  } else {
    bounds = canvasGetBounds(canvas);
    return calculateVersesVector(song, w, h, bounds);
  }
}

module.exports = calculateVersesVector;