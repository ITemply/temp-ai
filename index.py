import os, json, requests, hashlib, re

from flask import Flask, request, render_template, redirect, abort, url_for

app = Flask(__name__)

from dotenv import load_dotenv
load_dotenv()

def cleantext(text):
  outputString = re.sub('<[^<]+?>', '', text)
  return outputString

def encodestring(inputstring):
  result = hashlib.sha512(inputstring.encode()) 
  return result.hexdigest()

def checkUsername(username):
  validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  newUsername = cleantext(username)
  listUsername = list(newUsername)
  for uChar in range(len(listUsername)):
    if listUsername[uChar] in validChars:
      pass
    else:
      return False
  
  find = executeSQL(f'SELECT * FROM accounts.accountData WHERE checkusername="{newUsername.lower()}"')
  if not find.json():
    return True
  else:
    return False

def getUserId():
  find = executeSQL(f'SELECT * FROM accounts.accountCount')
  jsonData = find.json()[0]
  count = jsonData['numberCount']
  id = jsonData['accountCountID']
  response = executeSQL(f"UPDATE accounts.accountCount SET numberCount={int(count) + 1}")
  return count + 1

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

  response = requests.request("POST", url, headers=headers, data=payload)
  return response

@app.route('/', methods=['GET', 'POST'])
def index():
  return render_template('index.html')

@app.route('/signup', methods=['GET', 'POST'])
def login():
  if request.method == 'GET':
    return render_template('signup.html')
  elif request.method == 'POST':
    jsonData = request.get_json(force=True)
    username = jsonData['username']
    if checkUsername(username):
      userid =  getUserId()
      password = jsonData['password']
      encodedPassword = encodestring(password)
      executeSQL(f"INSERT INTO accounts.accountData (username, checkusername, password, userid, status) VALUE ('{username}', '{username.lower()}', '{encodedPassword}', {userid}, 'User')")
      return '{"response": "Signed Up"}'
    else:
      return '{"response": "ACF"}'
  else:
    return '{"response": "Request Type Not Supported"}'

@app.route('/signin', methods=['GET', 'POST'])
def signin():
  return 'sign in'

if __name__ == '__main__':
  app.run(host='0.0.0.0')
