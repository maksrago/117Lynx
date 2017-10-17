// all config defaults here
var megudConfig={}

// host settings
megudConfig.webSocketHost='mewch.net'
megudConfig.webSocketPort=8000
megudConfig.webSocketPortnginx=8003
megudConfig.webSocketProtocol='megud' // probably won't need to change this
megudConfig.webSocketPath='megud' // probably could set this to '' if desired

// Post Form settings
megudConfig.postFormCommentsSelector='#fieldMessage'

// Quick Reply Form settings
megudConfig.quickReplyCommentsSelector='#qrbody'

// Realtime output settings
megudConfig.outputQuerySelector='#megudSupport'

// User Opt In Settings
megudConfig.UserOptIn=true
megudConfig.UserOptInCheckBoxLabel='Enable realtime'
megudConfig.UserOptInQuerySelector='.clearer'

// Read boardUri ID
megudConfig.boardIdentifierSelector='#boardIdentifier'
