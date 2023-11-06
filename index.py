import harperdb, os, json, requests, base64

from flask import Flask, request, render_template, redirect, abort

app = Flask(__name__)

from dotenv import load_dotenv
load_dotenv()

def executeSQL(SQLData):
  url = os.environ['DB_URL']

  payload = json.dumps({
    "operation": "sql",
    "sql": SQLData
  })

  headers = {
    'Content-Type': 'application/json',
    "authorization": "Basic " + os.environ['DB_AUTH'],
    "cache-control": "no-cache"
  }

  requests.request("POST", url, headers=headers, data=payload)

@app.route('/', methods=['GET', 'POST'])
def index():
  return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
  if request.method == 'GET':
    return render_template('login.html')
  elif request.method == 'POST':
    jsonData = request.get_json(force=True)
    username = jsonData['username']
    password = jsonData['password']
    executeSQL(f"INSERT INTO accounts.accountData (username, password) VALUE ('{username}', '{password}')")
    return '{"response": "posted new"}'
  else:
    return 'requets type not availibe'

if __name__ == '__main__':
  app.run(host='0.0.0.0', port='8080')
