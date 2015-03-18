'use strict';

var canvasGetBounds = require('./canvasGetBounds');
var Transform = require('./Transform');

//Takes a song that has been meta info about verse metrics and renders
//each verse to a canvas. w and h is the desired width and height
//the function has two passes the first pass renders larger than
//desired size in order to get better metrics. The second pass is
//at the desired size.

function renderVersesVector(song, w, h, bounds) {
  var aspect = w / h;
  var canvas = document.createElement('canvas');
  var mLineHeight = song.fontMetrics.h * song.lineHeight;
  var sf = aspect > song.aspect ? h / song.pxHeight : w / song.maxWidth;
  var ctx;
  var padding = 4;
  var trans = new Transform();
  var transInv;
  var trueBounds;

  function drawVerse(verse, ctx) {
    var lineNum = 0;
    verse.lines.forEach(function(line) {
      line.brokenLine.split('\n').forEach(function(fragment) {
        ctx.fillText(fragment, 0, song.fontMetrics.ascent + lineNum * mLineHeight);
        lineNum++;
      });
    });
  }

  canvas.setAttribute('id', 'canvas-super');

  //bounds true on second pass
  if (bounds) {
    sf = aspect > bounds.w / bounds.h ? h / (bounds.h/(sf*1.1)) : w / (bounds.w/(sf*1.1));
    canvas.width = Math.ceil(sf * song.maxWidth) + padding * 2;
    canvas.height = Math.ceil(sf * song.pxHeight) + padding * 2;
  } else {
    sf *= 1.1;
    canvas.width = Math.ceil(sf * song.maxWidth) + padding * 2;
    canvas.height = Math.ceil(sf * song.pxHeight) + padding * 2;
  }

  ctx = canvas.getContext('2d');
  ctx.font = song.fontHeight + 'px ' + song.fontName;
  ctx.fillStyle = '#fff';
  ctx.save();
  trans.scale(sf,sf);
  trans.translate(padding/sf, padding/sf);
  transInv = trans.getInverseTransform();
  ctx.setTransform.apply(ctx, trans.m);

  //draw all verses on top of each other
  song.verses.forEach(function(verse){drawVerse(verse,ctx);});

  if (bounds) {
    bounds = canvasGetBounds(canvas);
    trueBounds = transInv.transformPoint(bounds.x, bounds.y);
    trueBounds.w = bounds.w/sf;
    trueBounds.h = bounds.h/sf;
    ctx.fillStyle = 'rgba(255,255,255,.5)';

    ctx.fillRect(trueBounds.x, trueBounds.y, bounds.w/sf, bounds.h/sf);
    console.log(trueBounds, bounds);
    document.body.appendChild(canvas);

    var verseCanvas = document.createElement('canvas');
    var verseCtx;
    var verseTrans = new Transform();
    var scale = 5;
    var xpos = 0.5;
    var ypos = 0.5;
    var theta = Math.random() * 360;
    var origx = .5;
    var origy = .5;
    var trans;
    var inverse;
    verseTrans.scale(sf,sf);
    verseTrans.translate(-trueBounds.x,-trueBounds.y);
    verseTrans.scale(scale,scale);
    verseTrans.translate(
      -(trueBounds.w * origx),
      -(trueBounds.h * origy)
    );

    verseTrans.skewX(5*Math.PI/180);
    verseTrans.skewY(5*Math.PI/180);
    verseTrans.translate(
     trueBounds.w * xpos / scale,
     trueBounds.h * ypos / scale
    );
    verseTrans.rotate(Math.PI * theta/180); //angle
    inverse = verseTrans.getInverseTransform();
    trans = inverse.transformPoint(bounds.w*.5, bounds.h * .5);
    verseTrans.translate(trans.x, trans.y);
    verseTrans.translate(-trueBounds.w * origx,-trueBounds.h * origy); //origin

    verseCanvas.width = bounds.w;
    verseCanvas.height = bounds.h;
    verseCtx = verseCanvas.getContext('2d');
    verseCtx.font = song.fontHeight + 'px ' + song.fontName;
    verseCtx.fillStyle = '#xxx'.replace(/x/g, x => (Math.random()*16|0).toString(16));
    verseCtx.fillRect(0,0,bounds.w,bounds.h);
    verseCtx.fillStyle = '#xxx'.replace(/x/g, x => (Math.random()*16|0).toString(16));
    verseCtx.setTransform.apply(verseCtx, verseTrans.m);

    drawVerse(song.verses[1], verseCtx);
    document.body.appendChild(verseCanvas);

    return ;
  } else {
    bounds = canvasGetBounds(canvas);
    console.log(bounds);
    return renderVersesVector(song, w, h, bounds);
  }
}

module.exports = renderVersesVector;