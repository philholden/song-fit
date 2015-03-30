'use strict';

var measureString = require('./measureString');
var splitLineEvenly = require('./splitLineEvenly');

function SongContext(lineHeight, fontHeight, fontName, verseGap) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var fontMetrics = measureString('Hygpqil', canvas, fontHeight);
  var mFontHeight = fontMetrics.h;
  var fontGap = (lineHeight - 1) * mFontHeight;
  fontName = fontName || 'Courier, Serif, Helvetica, Arial, Sans-Serif';
  ctx.font = fontHeight + 'px ' + fontName;

  function clone(obj) {
   return JSON.parse(JSON.stringify(obj));
  }

  function setSong(song) {
    function measure(line){
      return {
        line: line,
        brokenLine: line,
        height: 1,
        width: ctx.measureText(line).width
      };
    }
    var metaSong = {
      fontMetrics: fontMetrics,
      fontHeight: fontHeight, //fontHeight specified
      fontName: fontName,
      lineHeight: lineHeight //multiplier e.g. 1.4
    };
    metaSong.verses = song.verses.map(function(verse){
      return {
        lines: verse.lines.map(measure)
      };
    });
    return augment(metaSong);
  }

  function log(song) {
    var brokenSong = song.verses.map(function(verse){
      return verse.lines.map(function(line) {
        return line.brokenLine;
      }).join('\n');
    }).join('\n\n');
    console.log('\n' + brokenSong);
  }

  function findBestFit(plausibleLayouts, w, h) {
    var aspect = w / h;
    var out = plausibleLayouts[0];
    var margin = Math.abs(aspect - plausibleLayouts[0].aspect);
    var m;
    for(var i = 1; i < plausibleLayouts.length; i++) {
      m = Math.abs(aspect - plausibleLayouts[i].aspect);
      if (m < margin) {
        margin = m;
        out = plausibleLayouts[i];
      }
    }
    log(out);
    return out;
  }

  function augment(metaSong) {
    var h = 0;
    var w = 0; //widest verse
    var vHeight;
    var vWidth; //widest line
    var numLines = 0;
    var augmented = clone(metaSong);

    function max(line) {
      if (line.width > w ){
        w = line.width;
      }
      if (line.width > vWidth ){
        vWidth = line.width;
      }
      vHeight += line.height;
    }

    augmented.verses.forEach(function(verse){
      vHeight = 0;
      vWidth = 0;
      verse.lines.forEach(max);
      if (vHeight > h) h = vHeight;
      if (vWidth > w) w = vWidth;
      verse.height = vHeight;
      verse.width = vWidth;
      numLines+= vHeight;
    });

    augmented.pxHeight = (h - 1) * fontGap + h * mFontHeight;
    augmented.maxWidth = w;
    augmented.maxHeight = h;
    augmented.pnumLines = augmented.numLines;
    augmented.numLines = numLines;
    augmented.aspect = w / augmented.pxHeight;
    return augmented;
  }

  function getPlausibleLayouts(augmented) {
    var plausible = [];
    function tick(augmented) {
      var shortVerses;
      var longVerses;
      var longerMaxWidth;
      var shorterMaxWidth;
      var maxHeight;

      function shorts(verse) {
        return verse.height < maxHeight;
      }

      function longs(verse) {
        return verse.height >= maxHeight;
      }

      function maxWidth(a, b){
        return Math.max(a.width, b.width);
      }
      //must deal with long words
      function splitWidestLine(verses) {
        function widest(widest, item) {
          return item.width > widest.width ? item : widest;
        }
        var widestVerse = verses.reduce(widest);
        var widestLine = widestVerse.lines.reduce(widest);
        var brokenLine = splitLineEvenly(widestLine.line, widestLine.height, canvas);
        widestLine.width = brokenLine.width;
        widestLine.height = brokenLine.breaks + 1;
        widestLine.brokenLine = brokenLine.txt;
      }

      //find max width of longest verse
      augmented = clone(augmented);
      maxHeight = augmented.maxHeight;
      shortVerses = augmented.verses.filter(shorts);
      longVerses = augmented.verses.filter(longs);
      longerMaxWidth = longVerses.reduce(maxWidth, longVerses[0].width);
      if (shortVerses.length) {
        shorterMaxWidth = shortVerses.reduce(maxWidth, longVerses[0].width);
      }

      //if all lines shorter than longest word return ie minwidth

      if(augmented.pnumLines === augmented.numLines) {
        return;
      }

      //if shorter narrower than longer or empty
      if (!shortVerses.length || longerMaxWidth >= shorterMaxWidth){
        //if adding line would reduce font size return end
        if (maxHeight === 1000) {
          return;
        }
        plausible.push(clone(augmented));
        splitWidestLine(longVerses);
      } else {
        splitWidestLine(shortVerses);
      }

      augmented = augment(augmented);
      tick(augmented);
    }

    tick(augmented);

    return plausible;
  }

  return {
    setSong: setSong,
    getPlausibleLayouts: getPlausibleLayouts,
    findBestFit: findBestFit,
    log: log
  };
}
module.exports = SongContext;