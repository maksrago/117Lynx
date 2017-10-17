
function lynxFormatting(split) {
  split = split.replace(/^>[^\&].*/g, greenTextFunction)
  split = split.replace(/\=\=.+?\=\=/g, redTextFunction)
  split = split.replace(/\'\'\'.+?\'\'\'/g, boldFunction)
  split = split.replace(/\'\'.+?\'\'/g, italicFunction)
  split = split.replace(/\_\_.+?\_\_/g, underlineFunction)
  split = split.replace(/\~\~.+?\~\~/g, strikeFunction)
  split = split.replace(/\[spoiler\].+?\[\/spoiler\]/g, spoilerFunction)
  split = split.replace(/\*\*.+?\*\*/g, altSpoilerFunction)
  split = split.replace(/\[aa\]/g, '<span class="aa">')
  split = split.replace(/\[\/aa\]/g, '</span>')

  // FIXME: how do we get this board setting?
  //if (replaceCode) {
    // was a code tag but a code tag doesn't preserve spaces in html
    split = split.replace(/\[code\]/g, '<pre>')
    split = split.replace(/\[\/code\]/g, '</pre>')
  //}
  //start youtube addon
  split = split.replace(/\[youtube\](.*)\[\/youtube\]/gi, YoutubeEmbedFunction)
  split = split.replace(/\[niconico\](.*)\[\/niconico\]/gi, NicoNicoEmbedFunction)
  return split
}

var greenTextFunction = function(match) {
  return '<span class="greenText">' + match + '</span>'
}

var redTextFunction = function(match) {
  var content = match.substring(2, match.length - 2)
  return '<span class="redText">' + content + '</span>'
}

var italicFunction = function(match) {
  return '<em>' + match.substring(2, match.length - 2) + '</em>'
}

var boldFunction = function(match) {
  return '<strong>' + match.substring(3, match.length - 3) + '</strong>'
}

var underlineFunction = function(match) {
  return '<u>' + match.substring(2, match.length - 2) + '</u>'
}

var strikeFunction = function(match) {
  return '<s>' + match.substring(2, match.length - 2) + '</s>'
}

var spoilerFunction = function(match) {
  var content = match.substring(9, match.length - 10)
  return '<span class="spoiler">' + content + '</span>'
}

var altSpoilerFunction = function(match) {
  var content = match.substring(2, match.length - 2)
  return '<span class="spoiler">' + content + '</span>'
}

var YoutubeEmbedFunction = function(match) {
    var match = match.slice(9, -10)
    //<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/"+match+"\" frameborder=\"0\" allowfullscreen></iframe>
    var ytURL='https://youtube.com/watch?v='+match
    // <a href="'+ytURL+'"><img src="https://endchan.xyz/.youtube/vi/'+match+'/0.jpg"></a>
    return '<span class="youtube_wrapper">'+ytURL+' [<a href="'+ytURL+'">Embed</a>]</span>'
}

var NicoNicoEmbedFunction = function(match) {
    var match = match.slice(10, -11)
    //return "<script type=\"text/javascript\" src=\"https://endchan.xyz/.niconico/thumb_watch/"+match+"\"></script>"
    //var nnURL="http://ext.nicovideo.jp/thumb_watch/"+match
    var nnURL='http://www.nicovideo.jp/watch/'+match
    return '<span class="niconico_wrapper">'+nnURL+' [<a href="'+nnURL+'">Embed</a>]</span>'
}
