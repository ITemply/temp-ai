const socket = io()

var audio = new Audio('static/js/sounds/mixkit-gaming-lock-2848.wav')
audio.volume = 0.2

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

var sessionID = ''

if (localStorage.getItem('sessionId') == null) {
  localStorage.setItem('sessionId', makeid(25))
  sessionID = localStorage.getItem('sessionId')
  let date = new Date()
  localStorage.setItem('sessionCreationTime', date.getTime())
} else {
  if (localStorage.getItem('sessionCreationTime') == null) {
    let adate = new Date()
    localStorage.setItem('sessionCreationTime', adate.getTime())
    sessionID = localStorage.getItem('sessionId')
  } else {
    let newdate = new Date()
    if (parseFloat(localStorage.getItem('sessionCreationTime')) < (parseFloat(newdate.getTime())- 10000000)) {
      alert('Your session ID has been changed due to it being outdated.')
      localStorage.setItem('sessionCreationTime', newdate.getTime())
      localStorage.setItem('sessionId', makeid(25))
      sessionID = localStorage.getItem('sessionId')
    } else {
      sessionID = localStorage.getItem('sessionId')
    }
  }
}

var room = ''
var inroom = 'false'

function logError(errorText) {
  let errorElement = document.getElementById('error')
  errorElement.innerHTML = errorText
  errorElement.style.display = 'block'
}

socket.on('connect', () => {
  document.getElementById('mainchat').innerHTML = ''
  const joinRoomData = {room: sessionID, inroom: inroom}

  socket.emit('join', joinRoomData)
})

function leaveRoom() {
  socket.emit('clientDisconnecting', {'uid': sessionID})

  setTimeout(function(){
    window.location.reload(true)
  }, 250);
}

socket.on('notEnoughUsers', (backData) => {
  const jsonData = JSON.parse(backData)
  const userCount = jsonData.userCount

  const newElement = '<span class="message" id="NotFound"><b>SERVER</b>: Not enought users to make a random room. Current user waiting count, ' + userCount + ' user(s) active.</span>'
  document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
})

socket.on('failedToConnect', (backData) => {
  const jsonData = JSON.parse(backData)
  const userCount = jsonData.reason

  const newElement = '<span class="message" id="NotFound"><b>SERVER</b>: ' + userCount + '</span>'
  document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
})

socket.on('newMessage', (messageData) => {
  const jsonData = JSON.parse(messageData)
  const username = jsonData.sendinguser
  const text = jsonData.messagetext
  const id = jsonData.messageid
  const time = jsonData.messagetime
  const type = jsonData.messagetype

  if (type == room){
    if (text.includes('@'+ localStorage.getItem('checkUsername'))) {
      audio.play()
      const objDiv = document.getElementById('mainchat')
      var bottom = false
      if (objDiv.scrollHeight - objDiv.scrollTop === objDiv.clientHeight) {
        bottom = true
      }
      const newElement = '<div class="highlight-message"><span class="message" style="left: 0.5%;" id="' + id + '">' + time + ' <b>' + username + '</b>: ' + text + '</span></div>'
      document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
      if (bottom) {
        objDiv.scrollTop = objDiv.scrollHeight
      }
    } else {
      const objDiv = document.getElementById('mainchat')
      var bottom = false
      if (objDiv.scrollHeight - objDiv.scrollTop === objDiv.clientHeight) {
        bottom = true
      }
      const newElement = '<span class="message" id="' + id + '">' + time + ' <b>' + username + '</b>: ' + text + '</span>'
      document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
      if (bottom) {
        objDiv.scrollTop = objDiv.scrollHeight
      }
    }
  } else if (type == 'announcement') {
    audio.play()
    const objDiv = document.getElementById('mainchat')
    var bottom = false
    if (objDiv.scrollHeight - objDiv.scrollTop === objDiv.clientHeight) {
      bottom = true
    }
    const newElement = '<span class="highlight-message" id="NONE"><center><h1><b>' + text + '</b></h1></center></span>'
    document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
    if (bottom) {
      objDiv.scrollTop = objDiv.scrollHeight
    }
  }
})

socket.on('clearCommand', (clearCommandData) => {
  const jsonData = JSON.parse(clearCommandData)
  if (jsonData.room == 'chats.randomRoomChats') {
    document.getElementById('mainchat').innerHTML = ''
  }
})

socket.on('mutedList', (mutedListData) => {
  const jsonData = JSON.parse(mutedListData)
  const users = jsonData.messagetext
  const newElement = '<span class="message" id="NotFound"><b>SERVER</b>: ' + users + ' are muted.</span>'
  document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
})

socket.on('mutedUser', (mutedListData) => {
  const jsonData = JSON.parse(mutedListData)
  const users = jsonData.messagetext
  const newElement = '<span class="message" id="NotFound"><b>SERVER</b>: ' + users + '</span>'
  document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
})

socket.on('commandList', (mutedListData) => {
  const jsonData = JSON.parse(mutedListData)
  const users = jsonData.messagetext
  const newElement = '<span class="message" id="NotFound"><b>SERVER</b>: ' + users + '</span>'
  document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
})

socket.on('delMessage', (messageData) => {
  const jsonData = JSON.parse(messageData)
  const messageid = jsonData.messageid
  
  if (document.getElementById(toString(messageid))) {
    document.getElementById(toString(messageid)).remove()
  }
})

socket.on('joinRoom', (joiningRoomData) => {
  const jsonData = JSON.parse(joiningRoomData)
  const myuid = localStorage.getItem('sessionId')
  const users = jsonData.users
  const myroom = jsonData.room

  if (users.includes(myuid)) {
    room = myroom
    inroom = 'true'
    document.getElementById('mainchat').innerHTML = ''
    const newElement = '<span class="message" id="NotFound"><b>SERVER</b>: You have joined a chat! Connected to: ' + room + '</span>'
    document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
  }
})

socket.on('inRoom', (inRoomData) => {
  const jsonData = JSON.parse(inRoomData)
  const myroom = jsonData.roomid

  room = myroom
  inroom = 'true'
  document.getElementById('mainchat').innerHTML = ''
  const newElement = '<span class="message" id="NotFound"><b>SERVER</b>: You have joined a chat! Connected to: ' + room + '</span>'
  document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
})

socket.on('leaveRoom', (leavingRoomData) => {
  const jsonData = JSON.parse(leavingRoomData)
  const myroom = jsonData.room

  if (myroom == room) {
    setTimeout(function(){
      const newElement = '<span class="message" id="NotFound"><b>SERVER</b>: Other user has skipped!</span>'
      document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
    }, 1000);
    setTimeout(function(){
      window.location.reload(true)
    }, 2500);
  }
})

function checkLogin() {
  const username = localStorage.getItem('checkUsername')
  const password = localStorage.getItem('checkPassword')
  
  const location = window.location.href
  
  if (username && password) {
    if (location.includes('/signup') || location.includes('/signin')) {
      window.location.href = '/home'
    }
  } else {
    if (location.includes('/home') || location.includes('/chat')) {
      window.location.href = '/'
    }
  }
}
  
checkLogin()

function sendMessage() {
  const messageText = document.getElementById('inputtextchat').value

  if (messageText == '' || messageText == ' ') {
    logError('Text Error, please input text in your message.')
    return
  }

  const username = localStorage.getItem('checkUsername')
  const password = localStorage.getItem('checkPassword')
  const type = room

  const messageData = {text: messageText, username: username, password: password, type: type}
  
  socket.emit('sendMessage', messageData)

  document.getElementById('inputtextchat').value = ''
  logError('')
}

document.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
   sendMessage()
  } 
})