console.log('hello world')

async function log(datatype, collectdata) {
  const sendinglogdata = {name: 'jay'}

  try {
    const senddata = await fetch('/log', {
      method: 'POST',
      body: JSON.stringify(sendinglogdata),
      cache: 'default'
    })
    alert(senddata.JSON)
  } catch (error) {
    console.error("Error:", error);
  }
}
