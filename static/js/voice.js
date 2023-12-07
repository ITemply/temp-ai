const socket = io()

socket.on('connect', () => {
    alert('connected')
})

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

function checkLogin() {
  const username = localStorage.getItem('checkUsername')
  const password = localStorage.getItem('checkPassword')
    
  const location = window.location.href
    
  if (username && password) {
    if (location.includes('/signup') || location.includes('/signin')) {
      window.location.href = '/home'
    }
  } else {
    if (location.includes('/home') || location.includes('/chat') || location.includes('/random-chat') || location.includes('/voice')) {
      window.location.href = '/'
    }
  }
}

var sessionID = ''

if (localStorage.getItem('voiceSessionId') == null) {
  localStorage.setItem('voiceSessionId', makeid(25))
  sessionID = localStorage.getItem('voiceSessionId')
  let date = new Date()
  localStorage.setItem('voiceSessionCreationTime', date.getTime())
} else {
  if (localStorage.getItem('voiceSessionCreationTime') == null) {
    let adate = new Date()
    localStorage.setItem('voiceSessionCreationTime', adate.getTime())
    sessionID = localStorage.getItem('voiceSessionId')
  } else {
    let newdate = new Date()
    if (parseFloat(localStorage.getItem('voiceSessionCreationTime')) < (parseFloat(newdate.getTime())- 10000000)) {
      alert('Your session ID has been changed due to it being outdated.')
      localStorage.setItem('voiceSessionCreationTime', newdate.getTime())
      localStorage.setItem('voiceSessionId', makeid(25))
      sessionID = localStorage.getItem('voiceSessionId')
    } else {
      sessionID = localStorage.getItem('voiceSessionId')
    }
  }
}