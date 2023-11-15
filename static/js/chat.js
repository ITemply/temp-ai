const socket = io()

socket.on('newMessage', (messageData) => {
  console.log(messageData)
});

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
  
function logError(errorText) {
  let errorElement = document.getElementById('error')
  errorElement.innerHTML = errorText
  errorElement.style.display = 'block'
}

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
}