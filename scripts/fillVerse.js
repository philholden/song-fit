'use strict';

var Transform = require('./Transform');
var merge = require('merge');

//metric output from renderVerseVector
//

var defaults = {
  skewX: 0,
  skewY: 0,
  rotate: 0,
  scaleX: 1,
  scaleY: 1,
  handleX:0.5,
  handleY:0.5,
  posX:0,
  posY:0,
  fill: '#ccc'
};

function fillVerse(ctx, metrics, conf) {
  var defs;

  function drawVerse(verse) {
    var lineNum = 0;
    verse.lines.forEach(function(line) {
      line.brokenLine.split('\n').forEach(function(fragment) {
        ctx.fillText(fragment, 0-metrics.x, -metrics.y + metrics.song.fontMetrics.ascent + lineNum * metrics.mLineHeight);
        lineNum++;
      });
    });
  }

  ctx.save();
  conf = conf || {};
  defs = merge(true, defaults);
  conf = merge(defs, conf);

  var verseTrans = new Transform();
  var trans;
  var inverse;
  var off;
  verseTrans.scale(metrics.sf, metrics.sf);
  //verseTrans.translate(-metrics.x, -metrics.y);
  verseTrans.scale(conf.scaleX, conf.scaleY);
  verseTrans.translate(
    -(metrics.w * conf.handleX),
    -(metrics.h * conf.handleY)
  );

  verseTrans.skewX(conf.skewX);
  verseTrans.skewY(conf.skewY);

  verseTrans.rotate(conf.rotate); //angle
  inverse = verseTrans.getInverseTransform();
  off = verseTrans.transformPoint(metrics.x, metrics.y);
  trans = inverse.transformPoint(conf.posX, conf.posY);
  verseTrans.translate(trans.x, trans.y);
  verseTrans.translate(-metrics.w * conf.handleX,-metrics.h * conf.handleY); //origin

  ctx.font = metrics.song.fontHeight + 'px ' + metrics.song.fontName;
  ctx.fillStyle = conf.fill;
  //ctx.fillStyle = '#xxx'.replace(/x/g, x => (Math.random()*16|0).toString(16));
  ctx.setTransform.apply(ctx, verseTrans.m);

  drawVerse(metrics.song.verses[1], ctx);
  ctx.restore();
}



module.exports = fillVerse;