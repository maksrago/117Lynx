// pdu.js

// protocol data unit

// manage a network string
// such that updates reduce bandwidth usage

// can take apart a string
// and put it back together

function PDU(name) {
  // public
  this.update=function(socket, msg, k, sk) {
    console.log('PDU::update - undefined update function, new msg:', msg, 'key', k, 'subkey', sk)
  }
  this.buildPacketString=function(socket, msg, k, sk) {
    console.log('PDU::buildPacketString - undefined update function, new msg:', msg, 'key', k, 'subkey', sk)
  }
  this.getSubscribers=function(data, cb) {
    console.log('PDU::router - undefined router function, update to:', data.key, '=', data.val)
    cb([]) // returns a list of objects
  }
  // optional
  this.maxBytesPerSec=1024
  // private
  this.name=name
  this.timer=null
  this.store={}
  this.state={}
  this.previousCommands={} // debug
  //
  this.activeSockets=[]
  // bandwidth resets hard on 1s
  var ref=this
  this.timer=setInterval(function() {
    var start=Date.now()
    for(var i in ref.activeSockets) {
      var socket=ref.activeSockets[i]
      // reset bytes used, we're on 1sec timer
      if (socket.pduBytesUsed) {
        //console.log('tic')
        socket.pduBytesUsed-=ref.maxBytesPerSec
        if (socket.pduBytesUsed<0) socket.pduBytesUsed=0
      }
    }
    var diff=Date.now()-start
    if (diff>1000) {
      // could cancel and reinterval at X*2
      console.log('PDU::timer - took than 1 sec', diff, 'ms')
    }
    ref.dispatch()
  }, 1000)

  // examine socket's usage
  // is it time to send things to this socket
  //   will next packet fit the bill
  //   send and track it
  //   if queue is empty remove active socket
  this.dispatch=function() {
    // maybe put limiter here
    var ref=this
    var start=Date.now()
    //console.log('PDU::dispatch - activeSockets', ref.activeSockets.length)
    for(var i in ref.activeSockets) {
      var socket=ref.activeSockets[i]

      for(var k in socket.pduData) {
        // does this socket have changes?
        if (typeof(socket.pduLast[k])=='undefined' || socket.pduLast[k]!=socket.pduChanges[k]) {
          if (socket.pduLastData[k]===undefined) socket.pduLastData[k]=''
          //console.log('spliting', socket.pduData, 'vs', socket.pduLastData)
          var start=Date.now()
          var op=ref.split(socket.pduData[k], socket.pduLastData[k])
          var diff=Date.now()-start
          // if the res.ops > set.op use set.op
          //console.log('op', res, 'took', diff)

          // we can't fusion last packet with new first
          // because we wont know the locality of the last change
          // since we scan left to right (and edit could be on the left)

          // push to queue
          if (socket.pduQueue===undefined) socket.pduQueue=[]
          op.k=k
          if (socket.pduSubKey) {
            op.sk=socket.pduSubKey[k]
          }
          socket.pduQueue.push(op)

          // mark as sent
          socket.pduLastData[k]=socket.pduData[k]
          socket.pduLast[k]=socket.pduChanges[k]
        }
      }
      if (socket.pduBytesUsed===undefined) socket.pduBytesUsed=0
      //console.log('PDU::dispatch, socket queue is', socket.pduQueue.length)
      //console.log('PDU::dispatch  socket bytes used', socket.pduBytesUsed, '/', ref.maxBytesPerSec)
      // send/track what we can from the queue
      while(socket.pduQueue.length && socket.pduBytesUsed<ref.maxBytesPerSec) {
        //console.log('PDU::dispatch, socket queue is', socket.pduQueue.length)
        var op=socket.pduQueue.shift()
        var k2=op.k
        var sk=false
        delete op.k
        if (op.sk) {
          sk=op.sk
          delete op.sk
        }
        var str=ref.buildPacketString(socket, op, k, sk)
        ref.update(socket, str)
        socket.pduBytesUsed+=str.byteLength?str.byteLength:str.length
        console.log('PDU::dispatch, queue left', socket.pduQueue.length, 'packets. last packet was', str.length, 'bytes. socket bytes used', socket.pduBytesUsed, '/', ref.maxBytesPerSec)
      }
      // if queue is empty remove active socket

    }
    var diff=Date.now()-start
    if (diff>1000) {
      console.log('pdu::dispatch took', diff, 'ms')
    }
  }

  this.split=function(str1, str2, m, n) {
    if (!str1) {
      // delete all
      return { t: 'da' }
    }
    if (!str2) {
      // insert all
      return { t: 'ia', s: str1}
    }
    if (str1===str2) return {}

    if (m===undefined) m=str1.length
    if (n===undefined) n=str2.length

    // sort
    var a=str1, b=str2
    if (m > n) {
      var tmp = a
      a = b
      b = tmp
    }
    //console.log('a', a, 'b', b)

    var la = a.length
    var lb = b.length

    // if the shortest string has chars left
    // from the right, look for different chars
    while (la > 0 && (a.charCodeAt(la - 1) === b.charCodeAt(lb - 1))) {
      la--
      lb--
    }
    //console.log('la', la, 'lb', lb)
    var ola=la
    var olb=lb

    var offset = 0
    // from the left, look for different chars
    while (offset < la && (a.charCodeAt(offset) === b.charCodeAt(offset))) {
      offset++
    }
    //console.log('offset', offset)

    la -= offset
    lb -= offset

    if (la === 0 || lb === 1) {

      // 1 or more chars can change here
      //console.log('changes', lb, 'o', ola, olb)
      // deletion or insertion
      // usually at the end of str2
      // or beginning of str1
      var obj={ t: '?' }
      if (lb>m || lb>n) {
        //console.log('lb', lb, 'larger than', m, 'or', n)
        var tlb1=Math.min(m, lb)
        var tlb2=Math.min(n, lb)
        var sm=Math.min(tlb1, tlb2)
        //console.log('sm', sm)
        //console.log(str1.substr(0, sm), '==', str2.substr(0, sm))
        var leftSame=str1.substr(0, sm)===str2.substr(0, sm)
        //console.log(str1.substr(str1.length-sm), '==', str2.substr(str2.length-sm))
        var rightSame=str1.substr(str1.length-sm)===str2.substr(str2.length-sm)
      } else {
        //console.log(str1.substr(0, lb), '==', str2.substr(0, lb))
        var leftSame=str1.substr(0, lb)===str2.substr(0, lb)
        //console.log(str1.substr(str1.length-lb), '==', str2.substr(str2.length-lb))
        var rightSame=str1.substr(str1.length-lb)===str2.substr(str2.length-lb)
      }
      //console.log('leftSame', leftSame, 'rightSame', rightSame)
      if (leftSame && rightSame) {
        //console.log('left and right by', lb, 'are same', la, 'o', ola, olb)
        // grabbing too many
        //console.log('from', offset, 'to', str1.length-offset)
        //console.log('from', offset, 'to', str2.length-offset)
        // at least one char
        if (m>n) {
          //
          obj={ t: 'i', p: offset, s: str1.substr(offset, lb) }
        } else if (m<n) {
          obj={ t: 'd', p: offset, c: lb }
        } else {
          // we won't hit this here, (9,9)-5 doesn't yield 0,* or *,1
          obj={ t: 'r', p: offset, s: str1.substr(offset, lb) }
        }
      } else
      if (leftSame && !rightSame) {
        //console.log('end different by', lb)
        // ins or del?
        if (m>n) {
          obj={ t: 'ie', s: str1.substring(n) }
        } else if (m<n) {
          obj={ t: 'de', c: lb }
        } else {
          // we won't hit this here, (9,9)-5 doesn't yield 0,* or *,1
          obj={ t: 're', s: str1.substring(m-lb) }
        }
      } else
      if (!leftSame && rightSame) {
        //console.log('beginning different by', lb)
        // ins or del?
        if (m>n) {
          obj={ t: 'is', s: str1.substr(0, lb) }
        } else if (m<n) {
          obj={ t: 'ds', c: lb }
        } else {
          // we won't hit this here, (9,9)-5 doesn't yield 0,* or *,1
          obj={ t: 'rs', s: str1.substring(m-lb) }
        }
      } else {
        // usually means the beginnings and ends match
        // asdf asdf vs asdf
        // the diff is "asdf " or " asdf"
        // lb is 5
        // str1.substring(0, lb) is "asdf ", so it's an left insert
        // was it insert at the left or right? either
        // so pick one
        // well first size
        if (m>n) {
          obj={ t: 'is', s: str1.substr(0, lb) }
        } else if (m<n) {
          // problem? one of the ds c:6 shuold have been a d p:4 c:6
          // zxcv qwer asdf
          // to
          // zxcvasdf
          // resulted in
          // wer asdf
          // lb is correct but the pos isn't always 0
          if (offset) {
            obj={ t: 'd', p: offset, c: lb }
          } else {
            obj={ t: 'ds', c: lb }
          }
        } else {
          // we won't hit this here, (9,9)-5 doesn't yield 0,* or *,1
          obj={ t: 'rs', s: str1.substring(m-lb) }
        }
      }
      return obj
      //}
    }
    // just set
    return { t: 'ra', s: str1 }
  }

  this.set=function(key, val, now) {
    // val, now
    if (now==undefined && val!==undefined && key!==undefined) {
      now=val
      val=key
      key=undefined
    }
    // val || key, val
    if (now==undefined) now=Date.now()
    // val || val, now
    if (key===undefined) key='default'
    //console.log('PDU::set', key, val, now)
    // discard no changes
    if (val==this.store[key]) {
      return false
    }
    this.store[key]=val
    var ref=this
    this.getSubscribers({ key: key, val: val, store: this.store }, function(sockets, keys) {
      //console.log('PDU::getSubscribers - returned', sockets.length, 'sockets')
      for(var i in sockets) {
        var socket=sockets[i]
        if (keys!=undefined) {
          // this is socket[key] not socket
          if (socket.pduSubKey===undefined) socket.pduSubKey={}
          socket.pduSubKey[key]=keys[i]
        }
        if (socket.pduData===undefined) socket.pduData={}
        if (socket.pduChanges===undefined) socket.pduChanges={}
        if (socket.pduLast===undefined) socket.pduLast={}
        if (socket.pduLastData===undefined) socket.pduLastData={}
        if (socket.pduChanges[key]===undefined) socket.pduChanges[key]=1
          else socket.pduChanges[key]++
        socket.pduData[key]=val
        // maybe a timer would be good
        if (ref.activeSockets.indexOf(socket)==-1) {
          ref.activeSockets.push(socket)
        }
      }
      ref.dispatch()
    })
    return true
  }

  this.clear=function(key, now) {
    // key
    if (key==undefined) key='default'
    // no params
    if (now==undefined) now=Date.now()
    if (!this.store[key]) {
      return false
    }
    this.store[key]=''
    var ref=this
    this.getSubscribers({ key: key, val: '', store: this.store }, function(sockets, keys) {
      //console.log('PDU::getSubscribers - returned', sockets.length, 'sockets')
      for(var i in sockets) {
        var socket=sockets[i]
        // purge all buffers and push p packet
        socket.pduQueue=[{ t: 'p', c: 0, k: key, sk: keys[i] }]
        if (socket.pduData===undefined) socket.pduData={}
        socket.pduData[key]=''
      }
      ref.dispatch()
    })
    return true
  }

  this.updateState=function(key, msg) {
    if (msg===undefined) {
      msg=key
      key='default'
    }
    if (this.previousCommands[key]===undefined) this.previousCommands[key]=[]
    this.previousCommands[key].push(msg)
    //console.log('PDU::updateState(', key, msg, ')')
    switch(msg.t) {
      case 'ia': // 1
      case 'ra': // 3
        this.state[key]=msg.s
      break
      case 'da': // 2
        this.state[key]=''
      break
      case 'is': // 4
        this.state[key]=msg.s+this.state[key]
      break
      case 'ds': // 5
        // we two bytes now
        //console.log('delete start', msg.c, 'state', this.state[key], 'attempt', this.state[key].substr(msg.c*2))
        this.state[key]=this.state[key].substr(msg.c)
        //console.log('delete start after state', this.state[key])
      break
      case 'rs': // 6
        this.state[key]=msg.s+this.state[key].substr(msg.c)
      break;
      case 'ie': // 7
        this.state[key]+=msg.s
      break
      case 'de': // 8
        this.state[key]=this.state[key].substr(0, this.state[key].length-msg.c)
      break
      case 're': // 9
        // replace ending
        if (msg.s) {
          var pos=this.state[key].length-msg.s.length
          this.state[key]=this.state[key].substr(0, pos)+msg.s
        }
      break
      case 'i': // 10
        this.state[key]=this.state[key].substr(0, msg.p)+msg.s+this.state[key].substring(msg.p)
      break
      case 'd': // 11
        this.state[key]=this.state[key].substr(0, msg.p)+this.state[key].substring(msg.p+msg.c)
      break
      case 'r': // 12
        this.state[key]=this.state[key].substr(0, msg.p)+msg.s+this.state[key].substring(msg.p+msg.s.length)
      break
      case 'p': // 13
        // nothing to be done
      break
      case 'h':
        if (this.state[key]!=msg.s) {
          console.log('HASH MISMATCH. local:', this.state[key], '!=remote:', msg.s)
          console.log('commands up since last match', this.previousCommands[key])
          this.previousCommands[key]=[]
        } else {
          this.previousCommands[key]=[]
        }
      break;
      case 's': // 14
        key='state'
        this.state[key]=msg.c
      break
      default:
        console.log('PDU::updateState - unknown type', msg.t)
        //process.exit()
      break
    }
    return this.state[key]
  }
}

// browser support
;
(function(module){
  module.exports = PDU
})(typeof module === 'undefined'? this['webPDU']={}: module);