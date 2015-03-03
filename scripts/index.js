'use strict';

require('../style/main.scss');
var SongCanvas = require('./SongCanvas');
var SongContext = require('./SongContext');
var Song = require('./Song');
var canvasGetBounds = require('./canvasGetBounds');



var canvas = document.getElementById('mycanvas');
var canvas2 = document.getElementById('canvas2');
var songCanvas = new SongCanvas(canvas);
var humpty = [
  'title: Humpty',
  'artist: Phil',
  '',
  'Humpty Dumpty sat on a wall',
  'Humpty Dumpty had a great fall',
  'All the kings horses and all the kings men',
  'Couldn\'t put Humpty together again',
  '',
  'Fumpty Mumpty sat on a stall',
  'Fumpty Mumpty heard a great call',
  'All the things forces and all the things men',
  'Couldn\'t fit Fumpty together again'
].join('\n');

var song = new Song(humpty);

var reqFullScreen = document.body.requestFullScreen ||
    document.body.webkitRequestFullScreen ||
    document.body.mozRequestFullScreen ||
    document.body.msRequestFullScreen || function() {};

var ctx = canvas2.getContext('2d');

ctx.fillStyle = '#fff';
ctx.fillRect(7,0,3,2);

// function canvasGetPixels(canvas) {
//   var ctx = canvas.getContext('2d');
//   var w = canvas.width;
//   var h = canvas.height;
//   var imageData = ctx.getImageData(0, 0, w, h);
//   console.log(imageData.data)
//   var buf = new ArrayBuffer(imageData.data.length);
//   var buf8 = new Uint8ClampedArray(buf);
//   var data = new Uint32Array(buf);

//   buf8.set(buf);
//   return buf8;
// }



//measureString('Helloyg', canvas2, 80);

function renderSong(song, w, h) {
  var aspect = w / h;
  var canvas = document.createElement('canvas');
  var mLineHeight = song.fontMetrics.h * song.lineHeight;
  var boundsBig;
  var sf;
  var sf2;
  var pad = 20;
  canvas.setAttribute('id', 'canvas-super');

  function renderAtScale(width2, height2, sf, fudge, tx, ty, padding) {
    var ctx;
    var bounds;
    var sfpad = Math.floor(padding / sf);

    //create canvas 10% bigger than needed
    canvas.width = Math.ceil(sf * width2) + padding * 2;
    canvas.height = Math.ceil(sf * height2) + fudge + padding * 2;


    ctx = canvas.getContext('2d');
    ctx.font = song.fontHeight + 'px ' + song.fontName;
    ctx.fillStyle = '#fff';
    ctx.save();
    ctx.scale(sf,sf);
    ctx.translate(sfpad - tx, sfpad - ty);
    //zoom pxHeight, maxWidth to be full page
    //draw all verses on top of each other inside pxHeight, maxWidth
    song.verses.forEach(function(verse) {
      var lineNum = 0;

      verse.lines.forEach(function(line) {
        line.brokenLine.split('\n').forEach(function(fragment) {
          ctx.fillText(fragment, 0, song.fontMetrics.ascent + lineNum * mLineHeight);
          lineNum++;
        });
      });
    });
    ctx.restore();
    bounds = canvasGetBounds(canvas);
    bounds.sf = sf;
    bounds.tx = tx;
    bounds.ty = ty;
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
    console.log(bounds);
    //padding not working
    return bounds;
  }

  sf = aspect > song.aspect ? h / song.pxHeight : w / song.maxWidth;
  sf *= 1.1;

  boundsBig = renderAtScale(song.maxWidth, song.pxHeight, sf, 5, 0, 0, pad);
  var hAcc = boundsBig.h / sf;
  var wAcc = boundsBig.w / sf;
  sf2 = aspect > boundsBig.w / boundsBig.h ? h / hAcc: w / wAcc;


  document.body.appendChild(canvas);
  //return renderAtScale(wAcc, hAcc, sf2, 0, boundsBig.x / sf, boundsBig.y / sf,0);
}

function renderVerse(song, verse, bounds) {
  var canvas = document.createElement('canvas');
  var canvas2 = document.createElement('canvas');
  var mLineHeight = song.fontMetrics.h * song.lineHeight;
  var ctx;
  var ctx2;
  var padding = 10;
  var lineNum = 0;
  var sfpad = Math.floor(padding/bounds.sf);
  canvas2.setAttribute('id', 'canvas-super');
  canvas.width = bounds.w + padding * 2;
  canvas.height = bounds.h + padding * 2;
  ctx = canvas.getContext('2d');
  ctx.font = song.fontHeight + 'px ' + song.fontName;
  ctx.fillStyle = '#fff';
  ctx.save();
  ctx.scale(bounds.sf, bounds.sf);
  ctx.translate(sfpad - bounds.tx, sfpad - bounds.ty);
  song.verses[verse].lines.forEach(function(line) {
    line.brokenLine.split('\n').forEach(function(fragment) {
      ctx.fillText(fragment, 0, song.fontMetrics.ascent + lineNum * mLineHeight);
      lineNum++;
    });
  });
  ctx.restore();
  bounds = canvasGetBounds(canvas);
  canvas2.width = bounds.w;
  canvas2.height = bounds.h;
  ctx2 = canvas2.getContext('2d');
  ctx2.drawImage(canvas,-bounds.x,-bounds.y);
  console.log(bounds);
  //document.body.appendChild(canvas2);
  //but really we want to always cut from above
}







//var per = linePermutations('the quick brown fox sdfjhkjd jdfhkjdshf jhkjdshfjds jdd hdjdhj dhdd a jj shjsh hghg', 2)
// console.log(per);
// var mind = minDifference(per, canvas)
// console.log(mind);

// var meta = new MetaSong(song, canvas2, 1.5, 20);
// var maxlines = meta.calcMaxLines(160, 90);
// meta.fitToAspect(5);
var sc = SongContext(canvas2, 1.5, 20);
var bestfit = sc.findBestFit(sc.getPlausibleLayouts(sc.init(song)),16,9);
//one verse is too long
var bounds = renderSong(bestfit,1024,900);
//renderVerse(bestfit, 1, bounds);

//should add cutting margins