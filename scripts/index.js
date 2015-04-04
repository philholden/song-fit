'use strict';

require('../style/main.scss');
var FullScreenCanvas = require('./FullScreenCanvas');
var SongContext = require('./SongContext');
var Song = require('./Song');
var drawSongToGetBounds = require('./drawSongToGetBounds');
var drawVerse = require('./drawVerse');
var drawSong = require('./drawSong');
var renderAffineText = require('./renderAffineText');

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
  'Couldn\'t fit Fumpty together again',
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
  module.hot.dispose(function() {
    location.reload();
  });
}

function build(song) {
  var songCanvas = new FullScreenCanvas();
  var sc = SongContext(1.3, 20, '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif');
  var layouts;
  var metrics;
  var ctx;
  var id = 0;
  var renderVerseCallback;

  setSong(song);

  songCanvas.addEventListener('resize', recalc);

  function setSong(song) {
    song = song;
    //layouts = sc.getPlausibleVerseLayouts(song);
    layouts = sc.getPlausibleSongLayouts(song);
    recalc();
  }

  function recalc() {
    var bestfit = sc.findBestFit(layouts,songCanvas.w,songCanvas.h);
    metrics = drawSongToGetBounds(bestfit, songCanvas.w, songCanvas.h, false);
    ctx = songCanvas.canvas.getContext('2d');
    renderVerseCallback = function (ctx, offx, offy) {
      drawSong(bestfit, ctx, offx, offy, false);
    };
    renderAffineText(ctx, metrics, renderVerseCallback, {
      fill: '#000',
      posX: songCanvas.w / 2,
      posY: songCanvas.h / 2,
    //   rotate: Math.PI/180 * 10,
    //   scaleX: .5,
    //   scaleY: .2
    });
    id++;
    //animate(id);
  }

  function animate (myId) {
    var start = Date.now();
    (function loop () {
      var p = (Date.now()-start)%40000;
      var hue = Math.floor(p * 360/9000)%360;
      var hue2 = (180+Math.floor((p * 360)/9000))%360;
      ctx.fillStyle = 'rgba(0,0,0,.1)';
      //ctx.fillStyle = 'hsla('+ hue2 +', 60%, 70%,.1)';
      ctx.fillRect(0,0,songCanvas.w,songCanvas.h);
      if (myId === id) {
        requestAnimationFrame(loop);
      }
      renderAffineText(ctx, metrics, renderVerseCallback, {
        fill: 'hsla('+ hue +', 60%, 70%,1)',
        posX: songCanvas.w/2,
        posY: songCanvas.h/2,
        rotate: Math.PI/180 * (p/500 - 10),
        scaleX: 10/(1+p/500),
        scaleY: 10/(1+p/500)
      });
    }());
  }

}

var song = new Song(humpty);
build(song);

var reqFullScreen = document.body.requestFullScreen ||
    document.body.webkitRequestFullScreen ||
    document.body.mozRequestFullScreen ||
    document.body.msRequestFullScreen || function() {};