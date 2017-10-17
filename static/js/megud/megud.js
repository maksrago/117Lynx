// global variables
var megudState=false
var ws

function attachTextArea(elem, cb) {
  if (elem.addEventListener) {
      elem.addEventListener('keyup', cb, false)
      //elem.addEventListener('input', cb, false)
  } else if (elem.attachEvent) {
      elem.attachEvent('onpropertychange', cb)
  }
}

function attachText(elem, cb) {
  if (elem.addEventListener) {
      elem.addEventListener('keyup', cb, false)
      //elem.addEventListener('input', cb, false)
  } else if (elem.attachEvent) {
      elem.attachEvent('onpropertychange', cb)
  }
}

// make sure you have WebSocket support
if (typeof(WebSocket)!='undefined') {
  var ptclMgr=webProtocol.exports

  if (megudConfig.UserOptIn) {
    // create user opt-in checkbox
    var c=document.querySelector(megudConfig.UserOptInQuerySelector)
      var label=document.createElement('label')
        label.style.display='inline'
        label.id="megudSupport"
      var input=document.createElement('input')
        input.type='checkbox'
        input.id="useMegud"
        input.onclick=updateMegudState

        // load saved state
        input.checked=getSetting('myUseMegud')==='true'
      label.appendChild(input)
      label.appendChild(document.createTextNode(megudConfig.UserOptInCheckBoxLabel))
    c.parentNode.appendChild(label)

    // bring state up to date with UI
    updateMegudState()
  } else {
    // auto connect everyone
    megudState=true
    megudConnect()
  }

  var clientPdu=new webPDU.exports('clientPdu')
  clientPdu.update=function(socket, str) {
    // str is now Uint8Array
    //console.log('sending', str)
    socket.send(str)
  }
  clientPdu.buildPacketString=function(socket, msg, k, sk) {
    console.log('megud::buildPacketString', msg, 'key', k, 'subkey', sk, 'to connection', socket.id)
    ptclMgr.setHeader() // client packets don't have who
    var binary=ptclMgr.packetify(msg.t, msg)
    //var test=ptclMgr.parse(binary.buffer)
    //console.log('megud::buildPacketString doublecheck', test)
    return binary
  }
  clientPdu.getSubscribers=function(data, cb) {
    //console.log('pduSendToScope::getSubscribers', data)
    cb([ws])
  }
  clientPdu.dispatch()

  var lastSent=""
  var lastTimer=null
  // holding backspace doesn't multifire
  // (acts like select-all delete)
  function megudStateChange(txt) {
    if (txt!=lastSent) {
      // 0 is connecting
      // 1 is open
      // 2 is closing
      // 3 is closed
      if (!megudConnecting && ws.readyState==1) {
        // responsiveness is determined by bandwidth budget
        lastSent=txt
        clientPdu.set(txt, Date.now())
      } else {
        //console.log('ws readyState', ws.readyState)
        // if an event comes in when we have something scheduled
        // cancel and replace
        if (lastTimer!=null) clearTimeout(lastTimer)
        lastTimer=setTimeout(function() {
          megudStateChange(txt)
        }, 1000)
      }
    }
  }

  // Attach post form
  var elemComments=document.querySelector(megudConfig.postFormCommentsSelector)
  attachTextArea(elemComments, function() {
    var txt=elemComments.value
    if (megudState && ws) {
      megudStateChange(txt)
    }
  })

  // we need to hook the quickreply system too
  setTimeout(function() {
    //console.log('trying to hook qr');
    if (typeof(setQr)!='undefined') {
      //console.log('qr function found!');
      var oldShow_quick_reply=setQr
      setQr=function() {
        if (document.getElementById('quick-reply') !== null) {
          // it's already built
          return;
        }
        // build it once
        oldShow_quick_reply()
        // now attach
        // attach textarea
        var elemQRComments=document.querySelector(megudConfig.quickReplyCommentsSelector)
        //console.log('was qrbody found', elemQRComments)
        attachTextArea(elemQRComments, function() {
          var txt=elemQRComments.value
          //console.log('qr typing detected', txt)
          //console.log('megudState state', megudState)
          if (megudState && ws) {
            megudStateChange(txt)
          }
        })

        // QRpostReply
        // attach submit
        var oldQRpostReply=postReply
        postReply=function() {
          //console.log('megud submit')
          if (megudState && ws) {
            ptclMgr.setHeader() // client packets don't have who
            var binary=ptclMgr.packetify('p', { t: "p", c: 0 })
            ws.send(binary)
          }
          oldQRpostReply()
        }
      }
    }
  }, 1000);

  // make an empty block for realtime results
  var startElem=document.querySelector(megudConfig.outputQuerySelector)
  var counts=document.createElement('div')
  counts.id='realtimeCounts'

  var div=document.createElement('div')
  div.id='realtimePostsNew'
  startElem.parentNode.insertBefore(counts, startElem)
  startElem.parentNode.insertBefore(div, startElem)

  // Hook form submission functions (lynxchan)
  if (typeof(postReply)!='undefined') {
    var oldPostReply=postReply
    postReply=function() {
      //console.log('megud submit')
      if (megudState && ws) {
        ptclMgr.setHeader() // client packets don't have who
        var binary=ptclMgr.packetify('p', { t: "p", c: 0 })
        ws.send(binary)
      }
      oldPostReply()
    }
  }
  if (typeof(postThread)!='undefined') {
    var oldPostThread=postThread
    postThread=function() {
      //console.log('megud submit')
      if (megudState && ws) {
        ptclMgr.setHeader() // client packets don't have who
        var binary=ptclMgr.packetify('p', { t: "p", c: 0 })
        ws.send(binary)
      }
      oldPostThread()
    }
  }

}

// bring state up to date with UI
function updateMegudState() {
  var input=document.getElementById('useMegud') // find checkbox
  if (!input) {
    console.log('megud::updateMegudState - no #useMegud found')
    return
  }
  //console.log('check input', input.checked, 'connected', megudState)
  if (megudState===undefined) megudState=false
  // if state and UI don't match
  if (megudState!=input.checked) {
    // fix state
    if (megudState) {
      // disconnect
      ws.close()
      megudState=false
    } else {
      // connect
      console.log('connecting')
      megudState=true
      megudConnect()
    }
  }
  var days=365*10 // remember this setting for 10 years
  setSetting('myUseMegud', input.checked?'true':'false', days)
}

var megudConnecting=false // lock to prevent double connections
// stats
var usersOnSite=0
var usersOnBoard=0
var usersOnThread=null

function updateRealTimeCounts() {
  if (counts) {
    while (counts.hasChildNodes()) {
      counts.removeChild(counts.lastChild)
    }
    counts.appendChild(document.createTextNode('realtime users, on site: '+usersOnSite+', on '+boardUri+': '+usersOnBoard+(usersOnThread===null?'':(', on this thread: '+usersOnThread))))
  }
}

function strip(input) {
  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
  var commentsAndPhpTags = /<!--[\s\S]*?-->/gi
  var val=input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
    return ''
  })
  val=val.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/\'/g,"&#39;")
  return val
}

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join(' ')
}

function handlePacket(data) {
  //console.log('received_msg', data)
  switch(data.t) {
    case 'ban':
      console.log('You are banned:', data.s)
      // stop reconnect loops
      megudConnecting=true
    break
    case 's': // stats (site, board, thread)
      //console.log('stat update', data)
      if (data.s=='site') {
        //console.log('realtime users on site:', data.c)
        usersOnSite=data.c
      } else
      if (data.s.match(/thread/)) {
        //console.log('realtime users on thread:', data.c)
        usersOnThread=data.c
      } else {
        //console.log('realtime users on board:', data.c)
        usersOnBoard=data.c
      }
      updateRealTimeCounts()
    break
    case 'd': // delta (board or thread)
      // does this id subblock exist
      var subblock=div.querySelector('#connection'+data.i)
      if (!subblock) {
        // if not create it
        subblock=document.createElement('div')
        subblock.id='connection'+data.i
        div.appendChild(subblock)
      }
      // update it
      while (subblock.hasChildNodes()) {
        subblock.removeChild(subblock.lastChild)
      }
      var str=clientPdu.updateState(data.n)
      if (str!==undefined) {
        subblock.innerHTML=lynxFormatting(strip(str))
      }
    break
    case 'p': // post update (board or thread)
      // does this id subblock exist
      var subblock=div.querySelector('#connection'+data.i)
      if (!subblock) {
        // if not create it
        subblock=document.createElement('div')
        subblock.id='connection'+data.i
        div.appendChild(subblock)
      }
      // update it
      while (subblock.hasChildNodes()) {
        subblock.removeChild(subblock.lastChild)
      }
      // maybe force a refresh
      if (typeof(refreshPosts)!='undefined') {
        refreshPosts()
      }
    break
    default:
      console.log('megud::handlePacket - unknown packet type', data.t, data)
    break
  }
}

window.onbeforeunload = function(e) {
  //console.log('onbeforeunload')
  if (megudState && ws && ws.readyState==1) {
    // only if there's a draft
    //console.log('draft', lastSent)
    if (lastSent) {
      console.log('closing draft')
      ptclMgr.setHeader() // client packets don't have who
      var binary=ptclMgr.packetify('p', { t: "p", s: 2 })
      //ws.send(JSON.stringify({ t: "p", s: 2 }))
      ws.send(binary)
    }
  }
}

function megudConnect() {
  if (megudConnecting) return
  megudConnecting=true
  ws = new WebSocket('wss://'+megudConfig.webSocketHost+':'+megudConfig.webSocketPortnginx+'/'+megudConfig.webSocketPath, megudConfig.webSocketProtocol)
  ws.binaryType="arraybuffer"
  ws.onopen = function() {
    console.log('connected')
    var boardUri = document.querySelector(megudConfig.boardIdentifierSelector).value
    var obj={ t: "i", b: boardUri }
    var threadId = 0
    // we don't want the first thread on the board
    var opCell = document.getElementsByClassName('opCell')
    if (opCell && opCell.length===1) {
      threadId = opCell[0].id
      obj.i=threadId
    }
    //console.log('threadId', threadId)
    var obj2={ t: 's', s: boardUri, c: threadId }
    ptclMgr.setHeader() // client packets don't have who
    var binary=ptclMgr.packetify('s', obj2)
    ws.send(binary)
    megudConnecting=false
  }
  ws.onmessage = function (evt) {
    var json = evt.data
    //console.log('pkt type', typeof(json))
    if (typeof(json)=='object') {
      // are we receiving bad data? or converting it into bad?
      var dv = new DataView(evt.data);
      var view=[]
      for(var i=0; i<evt.data.byteLength; i++) {
        view.push(dv.getUint8(i))
      }
      //console.log('binary data detected', view, toHexString(view))
      var msg=ptclMgr.parse(evt.data)
      //console.log('ptclMgr.parse got', msg)
      if (msg.t==='s' || msg.t==='p' || msg.t==='ban') {
        handlePacket(msg)
      } else {
        ptclMgr.setHeader([ [ 'i', 'ui16'] ]) // server packets have who
        msg=ptclMgr.parse(evt.data)
        //console.log('packet', msg) // handle does this
        handlePacket({ t:'d', i: msg.i, n: msg })
      }
      return
    }
    //var data=JSON.parse(json)
    console.log('got non-binary data', json)
    //handlePacket(data)
  }
  ws.onerror = function(err) {
    console.log('ws err', err)
  }
  ws.onclose = function() {
    console.log('disconnecting')
    megudState=false
    updateMegudState()
    // probably should clear all subblocks
    if (div) {
      while (div.hasChildNodes()) {
        div.removeChild(div.lastChild)
      }
    }
    if (counts) {
      while (counts.hasChildNodes()) {
        counts.removeChild(counts.lastChild)
      }
      counts.appendChild(document.createTextNode('Disconnected'))
    }

  }
}
