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

var codeMonkeyByJonathanCoultonCcByNd = [
  'Code Monkey get up get coffee',
  'Code Monkey go to job',
  'Code Monkey have boring meeting',
  'With boring manager Rob',
  'Rob say Code Monkey very diligent',
  'But his output stink',
  'His code not "functional" or "elegant"',
  'What do Code Monkey think?',
  'Code Monkey think maybe manager want to write god damned login page himself',
  'Code Monkey not say it out loud',
  'Code Monkey not crazy, just proud',
  '',
  'Code Monkey like Fritos',
  'Code Monkey like Tab and Mountain Dew',
  'Code Monkey very simple man',
  'With big warm fuzzy secret heart:',
  'Code Monkey like you',
  'Code Monkey like you',
  '',
  'Code Monkey hang around at front desk',
  'Tell you sweater look nice',
  'Code Monkey offer buy you soda',
  'Bring you cup, bring you ice',
  'You say no thank you for the soda cause',
  'Soda make you fat',
  'Anyway you busy with the telephone',
  'No time for chat',
  'Code Monkey have long walk back to cubicle he sit down pretend to work',
  'Code Monkey not thinking so straight',
  'Code Monkey not feeling so great',
  '',
  'Code Monkey like Fritos',
  'Code Monkey like Tab and Mountain Dew',
  'Code Monkey very simple man',
  'With big warm fuzzy secret heart:',
  'Code Monkey like you',
  'Code Monkey like you a lot',
  '',
  'Code Monkey have every reason',
  'To get out this place',
  'Code Monkey just keep on working',
  'See your soft pretty face',
  'Much rather wake up, eat a coffee cake',
  'Take bath, take nap',
  'This job "fulfilling in creative way"',
  'Such a load of crap',
  'Code Monkey think someday he have everything even pretty girl like you',
  'Code Monkey just waiting for now',
  'Code Monkey say someday, somehow',
  '',
  'Code Monkey like Fritos',
  'Code Monkey like Tab and Mountain Dew',
  'Code Monkey very simple man',
  'With big warm fuzzy secret heart:',
  'Code Monkey like you',
  'Code Monkey like you'
].join('\n');

var idols = [
'Destroy the idols',
'Which you trust',
'Tear them down',
'Grind them to dust',
'',
'We run the race',
'Fight the fight',
'Keep the faith',
'And we get the prize',
'',
'Renew us Lord',
'Take our lives',
'Set us free',
'Be our victory',
'',
'Sustain us Lord',
'Be our strength'
].join('\n');

var grace = [
'Amazing grace! How sweet the sound',
'That saved a wretch like me!',
'I once was lost, but now am found;',
'Was blind, but now I see.',
// '',
// '’Twas grace that taught my heart to fear,',
// 'And grace my fears relieved;',
// 'How precious did that grace appear',
// 'The hour I first believed.',
// '',
// 'Through many dangers, toils and snares,',
// 'I have already come;',
// '’Tis grace hath brought me safe thus far,',
// 'And grace will lead me home.',
// '',
// 'The Lord has promised good to me,',
// 'His Word my hope secures;',
// 'He will my Shield and Portion be,',
// 'As long as life endures.',
// '',
// 'Yea, when this flesh and heart shall fail,',
// 'And mortal life shall cease,',
// 'I shall possess, within the veil,',
// 'A life of joy and peace.',
// '',
// 'The earth shall soon dissolve like snow,',
// 'The sun forbear to shine;',
// 'But God, who called me here below,',
// 'Will be forever mine.',
// '',
// 'When we’ve been there ten thousand years,',
// 'Bright shining as the sun,',
// 'We’ve no less days to sing God’s praise',
// 'Than when we’d first begun.'
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
  var sc = SongContext(1.4, 20, 'RobotoThin',.75);
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
       //rotate: Math.PI/180 * 10,
       scaleX: 1,
       scaleY: 1,
    //   skewX: Math.PI/180 * 5,
    //   skewY: Math.PI/180 * 2,
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
  window.showVerse = showVerse;1
  document.body.addEventListener('keyup',(e) => {
    var n = e.keyCode - 48;
    if (n === 0) {
      showSong();
    }
    if (n > 0 && n <= song.verses.length) {
      showVerse(n - 1);
    }
    if (n === 9) {
      setSong(new Song(codeMonkeyByJonathanCoultonCcByNd));
    }
  });
}

//https://www.npmjs.com/package/fontloader

var font = new FontFace('RobotoThin','url(../fonts/Roboto-Thin.ttf)',{});
font.loaded.then(function(){
  console.log('font loaded');
  var song = new Song(grace);
  build(song);
});
font.load();



var reqFullScreen = document.body.requestFullScreen ||
    document.body.webkitRequestFullScreen ||
    document.body.mozRequestFullScreen ||
    document.body.msRequestFullScreen || function() {};