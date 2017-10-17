// protocolManager.js

// protocol manager

// manages packet types

function protocolManager() {
  this.header=false
  this.readLookup={}
  this.writeLookup={}
  this.structureLookup={}

  this.setHeader=function(structure) {
    this.header=structure
  }
  // registry number to structure binding (typetype is like ui8)
  this.register=function(types, structures) {
    for(var shortCode in types) {
      var typeNum=types[shortCode]
      if (this.readLookup[typeNum]===undefined) {
        this.readLookup[typeNum]={}
        this.writeLookup[shortCode]={}
      }
      this.readLookup[typeNum]=shortCode
      this.writeLookup[shortCode]=typeNum
      this.structureLookup[shortCode]=structures
    }
  }
  this.getStructuresSize=function(obj, structures) {
    var size=0
    for(var i in structures) {
      switch(structures[i][1]) {
        case 'ui8':
          size+=1
        break
        case 'ui16':
          size+=2
        break
        case 'string':
          size+=obj[structures[i][0]].length*2 // ucs2 is 2 bytes per char
        break
        default:
          console.log('protocolManager::getStructuresSize - unknown type', structures[i][1])
        break
      }
    }
    return size
  }
  this.writeShort=function(byteView, pos, shortNum) {
    // BE: high, low
    byteView[pos]=((shortNum >> 8) & 0xFF) // high
    pos++
    byteView[pos]=(shortNum & 0xFF) // low
    pos++
    return pos
  }
  this.writeStructures=function(byteView, pos, obj, structures) {
    for(var i in structures) {
      var sName=structures[i][0]
      switch(structures[i][1]) {
        case 'ui8':
          byteView[pos]=obj[sName]
          pos++
        break
        case 'ui16':
          pos=this.writeShort(byteView, pos, obj[sName])
        break
        case 'string':
          var ref=this
          var shorts=obj[sName].split('').map(function(c){
            var shortNum=c.charCodeAt(0) // UCS2 code (2 bytes)
            pos=ref.writeShort(byteView, pos, shortNum)
            return 1
          })
          pos+=shorts.length*2
        break
        default:
          console.log('protocolManager::writeStructures - unknown type', structures[i][1])
        break
      }
    }
    return pos
  }
  this.packetify=function(shortCode, obj) {
    var typeNum=this.writeLookup[shortCode]
    if (typeNum===undefined) {
      var buffer=new ArrayBuffer(0)
      var byteView=new Uint8Array(buffer)
      console.log('protocolManager::packetify - unknown type', shortCode)
      return byteView
    }
    var size=1
    // first get total size
    if (this.header) {
      // size header
      size+=this.getStructuresSize(obj, this.header)
    }
    // size rest
    var structures=this.structureLookup[shortCode]
    size+=this.getStructuresSize(obj, structures)
    // build buffer and views
    var buffer=new ArrayBuffer(size)
    var byteView=new Uint8Array(buffer)
    var pos=0
    // write type
    byteView[pos]=typeNum
    pos++
    if (this.header) {
      pos=this.writeStructures(byteView, pos, obj, this.header)
    }
    //console.log('protocolManager::packetify - obj', obj)
    pos=this.writeStructures(byteView, pos, obj, structures)
    //var doubleCheck=this.parse(byteView.buffer)
    //console.log('protocolManager::packetify - doubleCheck', doubleCheck)
    return byteView
  }
  this.readStructures=function(dv, pos, obj, structures) {
    for(var i in structures) {
      var sName=structures[i][0]
      if (sName=='t') {
        console.log('protocolManager::readStructures - would stomp type .t skipping', structures[i])
      }
      switch(structures[i][1]) {
        case 'ui8':
          obj[sName]=dv.getUint8(pos)
          pos+=1
        break
        case 'ui16':
          obj[sName]=dv.getUint16(pos) // BE
          pos+=2
        break
        case 'string':
          var left=dv.byteLength-pos
          obj[sName]=""
          for(var j=0; j<left; j+=2) {
            var shortNum=dv.getUint16(pos)
            if (shortNum>=0xD800 && shortNum<=0xDBFF) {
              var shortNum2=dv.getUint16(pos+2)
              if (shortNum2>=0xD800 && shortNum2<=0xDBFF) {
                obj[sName]+=String.fromCharCode(shortNum, shortNum2)
                pos+=2
              } else {
                obj[sName]+=String.fromCharCode(shortNum)
              }
            } else {
              obj[sName]+=String.fromCharCode(shortNum)
            }
            pos+=2
          }
        break
      }
    }
    return pos
  }
  this.parse=function(binary) {
    var dv = new DataView(binary)
    // read type
    var pos=0
    var typeNum=dv.getUint8(pos); pos++
    var type=this.readLookup[typeNum]
    var obj={ t: type }
    if (this.header) {
      // read header
      pos=this.readStructures(dv, pos, obj, this.header)
    }
    // read rest
    pos=this.readStructures(dv, pos, obj, this.structureLookup[type])
    return obj
  }
}

// browser support
;
(function(module){
  module.exports = protocolManager
})(typeof module === 'undefined'? this['webProtocolManager']={}: module);