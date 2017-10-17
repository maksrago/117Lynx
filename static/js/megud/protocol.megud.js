// protocol.megud.js

// node support
if (typeof(webProtocolManager)==='undefined') {
  var protocolManager=require('./class.protocolManager.js')
  //protocolManager=protocolBuilder
} else {
  protocolManager=webProtocolManager.exports
}

//FIXME: separate PDU protocol from app protocol
// or the app protocol is appended to the PDU protocol
// also PDU doesn't say what variable is changing
// also there are really 4 protocols tbh
// server.read, server.write, client.read, client.write

var protocolTemp=new protocolManager

// if server
//ptclMgr.setHeader([ [ 'i', 'ui16'] ])
// don't stomp on t
protocolTemp.register({
  "ia": 1,
  "ra": 3,
  "is": 4,
  "rs": 6,
  "ie": 7,
  "re": 9,
  "ban": 16,
}, [
  ['s', 'string']
])
protocolTemp.register({ "ds": 5, "de": 8  }, [ [ 'c', 'ui16' ] ])
protocolTemp.register({ "i": 10, "r": 12  }, [ [ 'p', 'ui16' ], [ 's', "string" ] ])
protocolTemp.register({ "d": 11  }, [ [ 'p', 'ui16' ], [ 'c', 'ui16' ] ])
protocolTemp.register({ "da": 2  }, [ ])
protocolTemp.register({ "h": 15  }, [ [ 'l', 'ui16' ], [ 's', "string" ] ])

// app stuff
protocolTemp.register({ "p": 13  }, [ [ 'c', 'ui8']  ])
protocolTemp.register({ "s": 14  }, [ [ 'c', 'ui16' ], [ 's', "string" ] ])

// browser support
;
(function(module){
  module.exports = protocolTemp
})(typeof module === 'undefined'? this['webProtocol']={}: module)
