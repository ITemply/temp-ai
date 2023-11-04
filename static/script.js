console.log('hello world')

async function log(datatype, collectdata) {
  const sendinglogdata = {name: 'jay'}

  try {
    const senddata = await fetch('/log', {
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
