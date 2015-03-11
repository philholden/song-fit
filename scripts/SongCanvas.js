'use strict';

function SongCanvas(canvas) {
  this.verse = 0;
  this.song = null;
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.resizeFromEl();
  
  window.addEventListener('resize', this.resizeFromEl.bind(this));
}

SongCanvas.prototype.resizeFromEl = function (e) {
  var bounds = document.body.getBoundingClientRect();
  console.log(bounds);
  this.resize(bounds.width, bounds.height);
}

SongCanvas.prototype.resize = function (w, h) {
  var ratio = window.devicePixelRatio || 1;
  console.log(ratio);
  this.w = w * ratio;
  this.h = h * ratio;
  this.canvas.setAttribute('width', w);
  this.canvas.setAttribute('height', h);
  if (this.song !== null) {
    //choose layout
  }
  console.log(w,h);
}

SongCanvas.prototype.setSong = function(song) {
  //var sc = SongContext(canvas2, 1.5, 20, 'Arial');
  //var bestfit;
  //var vector;
  //this.song = song;
  //bestfit = sc.findBestFit(sc.getPlausibleLayouts(sc.init(song)),this.w,this.h);
  //vector = renderVersesVector(bestfit, this.w, this.h);
  //create lookup
//one verse is too long
//var bounds = renderSong(bestfit,1024,900);

//var v110 = renderVerses(bestfit,1024,576);
}

SongCanvas.prototype.setVerse = function(verse) {
  this.verse = verse;
}

module.exports = SongCanvas;