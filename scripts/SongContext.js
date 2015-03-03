
var measureString = require('./measureString');

function SongContext(canvas, lineHeight, fontHeight, fontName) {
  var ctx = canvas.getContext('2d');
  var fontMetrics = measureString('Hygpqil', canvas, fontHeight);
  var mFontHeight = fontMetrics.h;
  var fontGap = (lineHeight - 1) * mFontHeight;
  fontName = fontName || 'Courier, Serif, Helvetica, Arial, Sans-Serif';
  ctx.font = fontHeight + 'px ' + fontName;

  function distributeBreaks(length, numBreaks) {
    var allBreaks = [];
    function recurse(i, out) {
      var gaps = length - 1 - i;
      var breaksLeft;
      var copy = [];
      var j;
      for (j=0; j<out.length; j++ ) copy.push(out[j]);
      breaksLeft = numBreaks - copy.length;
      if(breaksLeft === 0) {
        allBreaks.push(copy);
        return;
      }
      copy.push(i);
      recurse(i + 1, copy);
      if (gaps > breaksLeft) {
        copy.pop();
        recurse(i + 1, copy);
      }
    }
    recurse(0, []);
    return allBreaks;
  }

  //all ways of splitting a line n times
  function linePermutations(line, breaks) {
    var words = line.split(/\s/g);
    var permutes = distributeBreaks(words.length, breaks);
    var perm;
    var i = 0;
    var j;
    var join;
    var out = [];
    var word;
    while (perm = permutes[i]) {
      i++;
      join = words[0];
      j = 0;
      while (word = words[j + 1]) {
        join += (~perm.indexOf(j) ? '\n' : ' ') + word;
        j++;
      }
      out.push(join);
    }
    return out;
  }

  //find most ballanced position of breaks
  function minDifference(permutations, canvas) {
    var i = 0;
    var j;
    var perm;
    var lines;
    var minDiff;
    var outi;
    var outlen;
    var diff;
    var min;
    var max;
    var len;
    var line;
    var ctx = canvas.getContext('2d');
    if(!permutations.length) return;
    while(perm = permutations[i]) {
      lines =  perm.split(/\n/g);
      j = 1;
      min = ctx.measureText(lines[0]).width;
      max = min;
      while(line = lines[j]) {
        len = ctx.measureText(line).width;
        if (len > max) max = len;
        if (len < min) min = len;
        j++;
      }
      diff = max - min;
      if (minDiff === undefined || diff < minDiff) {
        minDiff = diff;
        outlen = max;
        outi = i;
      }
      i++;
    }
    return {txt: permutations[outi], width: outlen, breaks: lines.length - 1};
  }

  function clone(obj) {
   return JSON.parse(JSON.stringify(obj));
  }

  function init(song) {
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
      if (vHeight > h ) h = vHeight;
      if (vWidth > w ) w = vWidth;
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

      function maxWidth(a,b){
        return Math.max(a.width, b.width);
      }
      //must deal with long words
      function splitWidestLine(verses) {
        function widest(widest, item) {
          return item.width > widest.width ? item : widest;
        }
        var widestVerse = verses.reduce(widest);
        var widestLine = widestVerse.lines.reduce(widest);
        var perm = linePermutations(widestLine.line, widestLine.height);
        var brokenLine = minDifference(perm, canvas);
        widestLine.width = brokenLine.width;
        widestLine.height = brokenLine.breaks + 1;
        widestLine.brokenLine = brokenLine.txt
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
        console.log('exit1');
        return;
      }

      //if shorter narrower than longer or empty
      if (!shortVerses.length || longerMaxWidth >= shorterMaxWidth){
        //if adding line would reduce font size return end
        if (maxHeight === 1000) {
          console.log('exit2');
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
    init: init,
    getPlausibleLayouts: getPlausibleLayouts,
    findBestFit: findBestFit,
    log: log
  };
}
module.exports = SongContext;