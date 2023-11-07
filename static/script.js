async function createAccount() {
  alert('started')
  const accountUsername = document.getElementById('username').value
  const accountPassword = document.getElementById('password').value

  const sendinglogdata = {username: accountUsername, password: accountPassword, status: 'User'}

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

    alert(information)
  } catch (error) {
    console.error("Error:", error);
  }
}
