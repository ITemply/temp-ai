function checkLogin() {
  const username = localStorage.getItem('checkUsername')
  const password = localStorage.getItem('checkPassword')

  const location = window.location.href

  if (username && password) {
    if (location.includes('/signup') || location.includes('/signin')) {
      window.location.href = '/home'
    }
  } else {
    if (location.includes('/home') || location.includes('/chat') || location.includes('/random-chat')) {
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

async function createAccount() {
  const accountUsername = document.getElementById('username').value
  const accountPassword = document.getElementById('password').value

  const sendinglogdata = {username: accountUsername, password: accountPassword}

  try {
    const senddata = await fetch('/signup', {
      method: 'POST',
      body: JSON.stringify(sendinglogdata),
      cache: 'default'
    })
    const respondjson = await senddata.json()
    const newjson = JSON.stringify(respondjson)
    const newstatus = JSON.parse(newjson)
    const information = newstatus.response

    if (information == 'Signed Up') {
      window.location.href = '/signin'
    } else if (information == 'ACF') {
      logError('Unable to create account at this time.')
    } else if (information == 'IA') {
      logError('Invalid Username, please try again.')
    } else if (information == 'T') {
      logError('Username Taken, please try a different username. ')
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function signIn() {
  const accountUsername = document.getElementById('username').value
  const accountPassword = document.getElementById('password').value

  const sendinglogdata = {username: accountUsername, password: accountPassword}

  if (accountUsername == '' || accountUsername == ' ') {
    logError('Enter Username, please enter a username and try again.')
    return 
  }

  if (accountPassword == '' || accountPassword == ' ') {
    logError('Enter Password, please enter a password and try again.')
    return 
  }

  try {
    const senddata = await fetch('/signin', {
      method: 'POST',
      body: JSON.stringify(sendinglogdata),
      cache: 'default'
    })

    const respondjson = await senddata.json()
    const newjson = JSON.stringify(respondjson)
    const newstatus = JSON.parse(newjson)
    const information = newstatus.response

    console.log(newstatus)

    if (information == 'SL') {
      const signinUsername = newstatus.checkusername
      const signinPassword = newstatus.password
      const signinId = newstatus.id
      
      localStorage.setItem('checkUsername', signinUsername)
      localStorage.setItem('checkPassword', signinPassword)
      localStorage.setItem('checkId', signinId)

      window.location.href = '/home'
    } else if (information == 'ANF') {
      logError('Account Not Found, please create an account and try again.')
    } else if (information == 'FAL') {
      logError('Invalid Username Or Password, enter a new username or password and try again.')
    } else if (information == 'UTP') {
      logError('Unable To Process Request, the server was unable to process your request properly, please try again.')
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

function signOut() {
  localStorage.removeItem('checkUsername')
  localStorage.removeItem('checkPassword')

  window.location.href = '/'
}