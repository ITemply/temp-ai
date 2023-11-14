# Initialization 

import os, json, requests, hashlib, re, cryptography

from flask import Flask, request, render_template, redirect, abort, url_for, session, copy_current_request_context
from cryptography.fernet import Fernet
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect
from threading import Lock

app = Flask(__name__)
socketio = SocketIO(app)
thread = None
thread_lock = Lock()

from dotenv import load_dotenv
load_dotenv()

enkey = os.environ['EN_KEY'].encode()

# Functions

def cleantext(text):
  outputString = re.sub('<[^<]+?>', '', text)
  return outputString

def bencode(inputstring):
  enco = Fernet(enkey)
  returning = enco.encrypt(inputstring.encode())
  returnString = returning.decode()
  return returnString

def bdecode(inputstring):
  enco = Fernet(enkey)
  returning = enco.decrypt(inputstring.encode())
  returnString = returning.decode()
  return returnString

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
      return 'Invalid Username'
  
  find = executeSQL(f'SELECT * FROM accounts.accountData WHERE checkusername="{newUsername.lower()}"')
  if not find.json():
    return 'Accept'
  else:
    return 'Taken'

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

# Flask

@app.route('/', methods=['GET', 'POST'])
def index():
  return render_template('index.html', async_mode=socketio.async_mode)

@app.route('/signup', methods=['GET', 'POST'])
def login():
  if request.method == 'GET':
    return render_template('signup.html', async_mode=socketio.async_mode)
  elif request.method == 'POST':
    jsonData = request.get_json(force=True)
    username = jsonData['username']
    if checkUsername(username) == 'Accept':
      userid =  getUserId()
      password = jsonData['password']
      encodedPassword = encodestring(password)
      executeSQL(f"INSERT INTO accounts.accountData (username, checkusername, password, userid, status) VALUE ('{username}', '{username.lower()}', '{encodedPassword}', {userid}, 'User')")
      return '{"response": "Signed Up"}'
    elif checkUsername(username) == 'Invalid Username':
      return '{"response": "IA"}'
    elif checkUsername(username) == 'Taken':
      return '{"response": "T"}'
    else:
      return '{"response": "ACF"}'
  else:
    return '{"response": "Request Type Not Supported"}'

@app.route('/signin', methods=['GET', 'POST'])
def signin():
  if request.method == 'GET':
    return render_template('signin.html', async_mode=socketio.async_mode)
  elif request.method == 'POST':
    jsonData = request.get_json(force=True)
    username = jsonData['username'].lower()
    password = encodestring(jsonData['password'])
    find = executeSQL(f'SELECT * FROM accounts.accountData WHERE checkusername="{username}"')
    try:
      returnedJson = find.json()[0]
      userPass = returnedJson['password']
      usernameChcek = returnedJson['checkusername']
      if username == usernameChcek and password == userPass:
        return '{"response": "SL", "password": "' + bencode(userPass) + '", "checkusername": "' + usernameChcek + '"}'
      else:
        return '{"response": "FAL"}'
      return '{"response": "UTP"}'
    except Exception:
      return '{"response": "ANF"}'
  else:
    return '{"response": "Request Type Not Supported"}'

@app.route('/home', methods=['GET', 'POST'])
def home():
  if request.method == 'GET':
    return render_template('home.html', async_mode=socketio.async_mode)
  elif request.method == 'POST':
    jsonData = request.get_json()
    print(jsonData)
    return '{"response": "Posted"}'
  else:
    return '{"response": "Request Type Not Supported"}'

# Socket IO



# Flask

if __name__ == '__main__':
  socketio.run(app, host='0.0.0.0', port=3000)