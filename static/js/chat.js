const socket = io()

function logError(errorText) {
  let errorElement = document.getElementById('error')
  errorElement.innerHTML = errorText
  errorElement.style.display = 'block'
}

socket.on('connect', () => {
  document.getElementById('mainchat').innerHTML = ''
  const getMessageData = {room: 'mainRoom'}

  socket.emit('getMessages', getMessageData)
})

socket.on('newMessage', (messageData) => {
  const jsonData = JSON.parse(messageData)
  const username = jsonData.sendinguser
  const text = jsonData.messagetext
  const id = jsonData.messageid
  const time = jsonData.messagetime
  const type = jsonData.messagetype

  if (type == 'mainRoom') {
    if (text.includes('base64')) {
      const objDiv = document.getElementById('mainchat')
      var bottom = false
      if (objDiv.scrollHeight - objDiv.scrollTop === objDiv.clientHeight) {
        bottom = true
      }
      const newElement = '<span class="message" id="' + id + '">' + time + ' <b>' + username + '</b>: <img src="' + text + '" style="width: 27.5%; height: auto;"></span><br>'
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
      const newElement = '<span class="message" id="' + id + '">' + time + ' <b>' + username + '</b>: ' + text + '</span><br>'
      document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
      if (bottom) {
        objDiv.scrollTop = objDiv.scrollHeight
      }
    }
  }
})

socket.on('clearCommand', (clearCommandData) => {
  const jsonData = JSON.parse(clearCommandData)
  if (jsonData.room == 'chats.mainRoom') {
    document.getElementById('mainchat').innerHTML = ''
  }
})

socket.on('mutedList', (mutedListData) => {
  const jsonData = JSON.parse(mutedListData)
  const users = jsonData.messagetext
  const newElement = '<span class="message" id="NotFound"><b>SERVER</b>: ' + users + ' are muted.</span><br>'
  document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
})

socket.on('mutedUser', (mutedListData) => {
  const jsonData = JSON.parse(mutedListData)
  const users = jsonData.messagetext
  const newElement = '<span class="message" id="NotFound"><b>SERVER</b>: ' + users + '</span><br>'
  document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
})

socket.on('commandList', (mutedListData) => {
  const jsonData = JSON.parse(mutedListData)
  const users = jsonData.messagetext
  const newElement = '<span class="message" id="NotFound"><b>SERVER</b>: ' + users + '</span><br>'
  document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
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
    const splitMessage = splitMessages[messageI].split('?')
    const username = splitMessage[0]
    const message = splitMessage[1]
    const time = splitMessage[2]
    const id = splitMessage[3]
    const type = splitMessage[4]

    if (type == 'mainRoom') {
      if (message.includes('base64')) {
        const newElement = '<span class="message" id="' + id + '">' + time + ' <b>' + username + '</b>: <img src="' + message + '" style="width: 27.5%; height: auto;"></span><br>'
        document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
        const objDiv = document.getElementById('mainchat')
        objDiv.scrollTop = objDiv.scrollHeight
      } else {
        const newElement = '<span class="message" id="' + id + '">' + time + ' <b>' + username + '</b>: ' + message + '</span><br>'
        document.getElementById('mainchat').innerHTML = document.getElementById('mainchat').innerHTML + newElement
        const objDiv = document.getElementById('mainchat')
        objDiv.scrollTop = objDiv.scrollHeight
      }
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
  const type = 'mainRoom'

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

var base64File = null

function uploadMessage() {
  const fileinput = document.getElementById('uploadfileid').files[0]

  reader = new FileReader();

  reader.onloadend = function () {
    var b64 = reader.result
    response = confirm('Are you sure you want to upload the file, ' + fileinput.name + '?')

    if (response) {
      const username = localStorage.getItem('checkUsername')
      const password = localStorage.getItem('checkPassword')
      const type = 'mainRoom'

      const messageData = {text: b64, username: username, password: password, type: type}
  
      socket.emit('sendMessage', messageData)
    }
  }

  reader.readAsDataURL(fileinput);
}
