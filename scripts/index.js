'use strict';

require('../style/main.scss');
var FullScreenCanvas = require('./FullScreenCanvas');
var SongContext = require('./SongContext');
var Song = require('./Song');
var drawSongToGetBounds = require('./drawSongToGetBounds');
var drawVersesToGetBounds = require('./drawVersesToGetBounds');
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

var hark = [
'Hark the herald angels sing',
'Glory to the newborn King!',
'Peace on earth and mercy mild',
'God and sinners reconciled',
'Joyful, all ye nations rise',
'Join the triumph of the skies',
'With the angelic host proclaim:',
'Christ is born in Bethlehem',
'Hark! The herald angels sing',
'Glory to the newborn King!',
'',
'Christ by highest heav\'n adored',
'Christ the everlasting Lord!',
'Late in time behold Him come',
'Offspring of a Virgin\'s womb',
'Veiled in flesh the Godhead see',
'Hail the incarnate Deity',
'Pleased as man with man to dwell',
'Jesus, our Emmanuel',
'Hark! The herald angels sing',
'Glory to the newborn King!',
'',
'Hail the heav\'n-born Prince of Peace!',
'Hail the Son of Righteousness!',
'Light and life to all He brings',
'Ris\'n with healing in His wings',
'Mild He lays His glory by',
'Born that man no more may die',
'Born to raise the sons of earth',
'Born to give them second birth',
'Hark! The herald angels sing',
'Glory to the newborn King!'
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
  var songRenderer;
  var verseRenderer;
  var verseLayouts;
  var songLayouts;
  var mode = 'blank';
  var verseShown = 0;
  var ctx;
  var id = 0;
  var renderVerseCallback;


  setSong(song);
  songCanvas.addEventListener('resize', recalc);

  function setSong(song) {
    mode = 'blank';
    song = song;
    verseLayouts = sc.getPlausibleVerseLayouts(song);
    songLayouts = sc.getPlausibleSongLayouts(song);
    recalc();
    showSong();
  }

  function recalc() {
    ctx = songCanvas.canvas.getContext('2d');
    songRenderer = getSongRenderCallback(ctx, songLayouts);
    verseRenderer = getVerseRenderCallback(ctx, verseLayouts);
    render();
    //id++;
    //animate(id);
  }

  function showSong() {
    mode = 'song';
    render();
  }

  function showVerse(n) {
    mode = 'verse';
    verseShown = n < 0 ?
      0 :
      n >= song.verses.length ?
        song.verses.length -1 :
        n;
    render();
  }

  function clear() {
    //ctx.clearRect(0,0,songCanvas.w, songCanvas.h);
    ctx.fillColor = '#000';
    ctx.fillRect(0,0,songCanvas.w, songCanvas.h);
  }

  function getSongRenderCallback(ctx, layouts) {
    var bestfit = sc.findBestFit(layouts,songCanvas.w,songCanvas.h);
    var metrics = drawSongToGetBounds(bestfit, songCanvas.w, songCanvas.h, false);
    return {
      metrics: metrics,
      renderCallback: function (ctx, offx, offy) {
        drawSong(bestfit, ctx, offx, offy, false);
      }
    };
  }

  function getVerseRenderCallback(ctx, layouts) {
    var bestfit = sc.findBestFit(layouts,songCanvas.w,songCanvas.h);
    var metrics = drawVersesToGetBounds(bestfit, songCanvas.w, songCanvas.h, false);
    return {
      metrics: metrics,
      renderCallback: function (ctx, offx, offy) {
        drawVerse(bestfit, verseShown, ctx, offx, offy, false);
      }
    };
  }

  function render() {
    var renderer;
    clear();
    if (mode === 'blank') {
      return;
    }
    if(mode === 'song') {
      renderer = songRenderer;
    } else {
      renderer = verseRenderer;
    }
    renderAffineText(ctx, renderer.metrics, renderer.renderCallback, {
      fill: '#fff',
      posX: songCanvas.w / 2,
      posY: songCanvas.h / 2,
    //   rotate: Math.PI/180 * 10,
       scaleX: .9,
       scaleY: .9
    });
  }

  // function recalc() {
  //   var bestfit = sc.findBestFit(layouts,songCanvas.w,songCanvas.h);
  //   metrics = drawSongToGetBounds(bestfit, songCanvas.w, songCanvas.h, false);
  //   ctx = songCanvas.canvas.getContext('2d');
  //   renderVerseCallback = function (ctx, offx, offy) {
  //     drawSong(bestfit, ctx, offx, offy, false);
  //   };
  //   renderAffineText(ctx, metrics, renderVerseCallback, {
  //     fill: '#000',
  //     posX: songCanvas.w / 2,
  //     posY: songCanvas.h / 2,
  //   //   rotate: Math.PI/180 * 10,
  //   //   scaleX: .5,
  //   //   scaleY: .2
  //   });
  //   id++;
  //   //animate(id);
  // }

  // function animate (myId) {
  //   var start = Date.now();
  //   (function loop () {
  //     var p = (Date.now()-start)%40000;
  //     var hue = Math.floor(p * 360/9000)%360;
  //     var hue2 = (180+Math.floor((p * 360)/9000))%360;
  //     ctx.fillStyle = 'rgba(0,0,0,.1)';
  //     //ctx.fillStyle = 'hsla('+ hue2 +', 60%, 70%,.1)';
  //     ctx.fillRect(0,0,songCanvas.w,songCanvas.h);
  //     if (myId === id) {
  //       requestAnimationFrame(loop);
  //     }
  //     renderAffineText(ctx, metrics, renderVerseCallback, {
  //       fill: 'hsla('+ hue +', 60%, 70%,1)',
  //       posX: songCanvas.w/2,
  //       posY: songCanvas.h/2,
  //       rotate: Math.PI/180 * (p/500 - 10),
  //       scaleX: 10/(1+p/500),
  //       scaleY: 10/(1+p/500)
  //     });
  //   }());
  // }
  window.showSong = showSong;
  window.showVerse = showVerse;
}

var song = new Song(hark);
build(song);

var reqFullScreen = document.body.requestFullScreen ||
    document.body.webkitRequestFullScreen ||
    document.body.mozRequestFullScreen ||
    document.body.msRequestFullScreen || function() {};