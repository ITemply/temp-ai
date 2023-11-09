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

    if (information == 'Signed In') {
      const signinKey = information.signinKey
      alert(signinKey)
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
