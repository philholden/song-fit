'use strict';

var canvasGetBounds = require('./canvasGetBounds');

//Takes a song that has been meta info about verse metrics and renders
//each verse to a canvas. w and h is the desired width and height
//the function has two passes the first pass renders larger than
//desired size in order to get better metrics. The second pass is
//at the desired size.

function renderVerses(song, w, h, bounds) {
  var aspect = w / h;
  var canvas = document.createElement('canvas');
  var mLineHeight = song.fontMetrics.h * song.lineHeight;
  var sf = aspect > song.aspect ? h / song.pxHeight : w / song.maxWidth;
  var ctx;
  var padding = 4;

  function drawVerse(verse) {
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
    sf = aspect > song.aspect ? h / song.pxHeight : w / song.maxWidth;
    sf *= 1.1;
    canvas.width = Math.ceil(sf * song.maxWidth) + padding * 2;
    canvas.height = Math.ceil(sf * song.pxHeight) + padding * 2;
  }

  ctx = canvas.getContext('2d');
  ctx.font = song.fontHeight + 'px ' + song.fontName;
  ctx.fillStyle = '#fff';
  ctx.save();
  ctx.scale(sf,sf);
  ctx.translate(padding/sf, padding/sf);

  //draw all verses on top of each other
  song.verses.forEach(drawVerse);

  if (bounds) {
    var verseCanvases = [];
    bounds = canvasGetBounds(canvas);
    document.body.appendChild(canvas);
    song.verses.forEach(function(verse) {
      var verseCanvas = document.createElement('canvas');
      var verseCtx;
      verseCanvas.width = bounds.w;
      verseCanvas.height = bounds.h;
      verseCtx = verseCanvas.getContext('2d');
      ctx.fillStyle = '#xxx'.replace(/x/g, x => (Math.random()*16|0).toString(16));
      verseCtx.fillStyle = '#xxx'.replace(/x/g, x => (Math.random()*16|0).toString(16));
      verseCtx.fillRect(0,0,bounds.w,bounds.h);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawVerse(verse);
      verseCtx.drawImage(canvas, -bounds.x,-bounds.y);
      verseCanvases.push(verseCanvas);
      document.body.appendChild(verseCanvas);
    });
    return ;
  } else {
    bounds = canvasGetBounds(canvas);
    return renderVerses(song, w, h, bounds);
  }
}

module.exports = renderVerses;