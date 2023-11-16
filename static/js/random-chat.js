const socket = io()

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

alert(sessionID)

var room = ''

function logError(errorText) {
  let errorElement = document.getElementById('error')
  errorElement.innerHTML = errorText
  errorElement.style.display = 'block'
}

socket.on('connect', () => {
  const joinRoomData = {room: sessionID}

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

  const newElement = '<span class="message" id="NotFound"><b>SERVER</b>: Not enought users to make a random room. Current user waiting count, ' + userCount + ' user(s) active.</span><br>'
  document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
})

socket.on('failedToConnect', (backData) => {
  const jsonData = JSON.parse(backData)
  const userCount = jsonData.reason

  const newElement = '<span class="message" id="NotFound"><b>SERVER</b>: ' + userCount + '</span><br>'
  document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
})

socket.on('newMessage', (messageData) => {
  const jsonData = JSON.parse(messageData)
  const username = jsonData.sendinguser
  const text = jsonData.messagetext
  const id = jsonData.messageid
  const time = jsonData.messagetime
  const type = jsonData.messagetype

  if (type == 'text') {
    const newElement = '<span class="message" id="' + id + '">' + time + ' <b>' + username + '</b>: ' + text + '</span><br>'
    document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
  }
})

socket.on('clearCommand', (clearCommandData) => {
  const jsonData = JSON.parse(clearCommandData)
  if (jsonData.room == 'chats.mainRoom') {
    document.getElementById('mainchat').innerHTML = ''
  }
})

socket.on('delMessage', (messageData) => {
  const jsonData = JSON.parse(messageData)
  const messageid = jsonData.messageid
  
  if (document.getElementById(toString(messageid))) {
    document.getElementById(toString(messageid)).remove()
  }
})

socket.on('loadMessages', (loadBackData) => {
  const jsonData = JSON.parse(loadBackData)
  const sendingStr = jsonData.messages

  const splitMessages = sendingStr.split('>')
  for (let messageI = 0; messageI < splitMessages.length; messageI++) {
    const splitMessage = splitMessages[messageI].split(';')
    const username = splitMessage[0]
    const message = splitMessage[1]
    const time = splitMessage[2]
    const id = splitMessage[3]
    const type = splitMessage[4]

    if (type == 'text') {
      const newElement = '<span class="message" id="' + id + '">' + time + ' <b>' + username + '</b>: ' + message + '</span><br>'
      document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
    }
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