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
      alert('Account Creation Failure\nTry a different username or wait a bit.')
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
