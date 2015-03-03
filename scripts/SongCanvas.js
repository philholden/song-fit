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
  console.log(w,h);
}

SongCanvas.prototype.setSong = function(song) {
  this.song = song;
}

SongCanvas.prototype.setVerse = function(verse) {
  this.verse = verse;
}

module.exports = SongCanvas;