'use strict';

require('../style/main.scss');
var FullScreenCanvas = require('./FullScreenCanvas');
var SongContext = require('./SongContext');
var Song = require('./Song');
var renderVerses = require('./renderVersesVector');
var calculateVersesVector = require('./calculateVersesVector');
var fillVerse = require('./fillVerse');



var canvas = document.getElementById('mycanvas');
var canvas2 = document.getElementById('canvas2');

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


if (module.hot) {
  console.log('hot');
  module.hot.accept();
  module.hot.accept(
    ['./renderVersesVector','./index','./Song','./FullScreenCanvas'],
  function() {
    location.reload();
  });
}

function build(song) {
  var songCanvas = new FullScreenCanvas();
  var sc = SongContext(canvas2, 1.5, 20, 'Arial');
  var layouts;
  var metrics;
  var ctx;


  setSong(song);
  
  songCanvas.addEventListener('resize', recalc);

  function setSong(song) {
    song = song;
    layouts = sc.getPlausibleLayouts(sc.init(song));
    recalc();
  }

  function recalc() {
    var bestfit = sc.findBestFit(layouts,songCanvas.w,songCanvas.h);
    console.log(bestfit, songCanvas.w, songCanvas.h);
    metrics = calculateVersesVector(bestfit,songCanvas.w,songCanvas.h);
    ctx = songCanvas.canvas.getContext('2d');
    fillVerse(ctx, metrics,{
      fill: '#f00',
      posX: songCanvas.w/2,
      posY: songCanvas.h/2

    });
  }

}

var song = new Song(humpty);
build(song);

var reqFullScreen = document.body.requestFullScreen ||
    document.body.webkitRequestFullScreen ||
    document.body.mozRequestFullScreen ||
    document.body.msRequestFullScreen || function() {};

var ctx = canvas2.getContext('2d');

ctx.fillStyle = '#fff';
ctx.fillRect(7,0,3,2);




//measureString('Helloyg', canvas2, 80);




//var per = linePermutations('the quick brown fox sdfjhkjd jdfhkjdshf jhkjdshfjds jdd hdjdhj dhdd a jj shjsh hghg', 2)
// console.log(per);
// var mind = minDifference(per, canvas)
// console.log(mind);

// var meta = new MetaSong(song, canvas2, 1.5, 20);
// var maxlines = meta.calcMaxLines(160, 90);
// meta.fitToAspect(5);


//    var sc = SongContext(canvas2, 1.5, 20, 'Arial');
//    var bestfit = sc.findBestFit(sc.getPlausibleLayouts(sc.init(song)),16,9);
//    var v110 = renderVerses(bestfit,1024/1.6,576/1.6);