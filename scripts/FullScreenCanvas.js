'use strict';

//body must have overflow hidden

function FullScreenCanvas(canvas) {
  if(!canvas) {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.display = 'block';
  }
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.resizeFromEl();
  this.resizeListener = this.resizeFromEl.bind(this);
  
  window.addEventListener('resize', this.resizeListener);
}

FullScreenCanvas.prototype.resizeFromEl = function () {
  var bounds = document.body.getBoundingClientRect();
  this.resize(bounds.width, bounds.height);
};

FullScreenCanvas.prototype.addEventListener = function (...args) {
  this.canvas.addEventListener.apply(this.canvas, args);
};

FullScreenCanvas.prototype.resize = function (w, h) {
  var ratio = window.devicePixelRatio || 1;
  this.w = w * ratio;
  this.h = h * ratio;
  this.canvas.width = this.w;
  this.canvas.height = this.h;
  this.canvas.style.width = w + 'px';
  this.canvas.style.height = h + 'px';
  this.canvas.dispatchEvent(new Event('resize'));
};

FullScreenCanvas.prototype.destroy = function() {
  window.removeEventListener('resize', this.resizeListener);
};

module.exports = FullScreenCanvas;