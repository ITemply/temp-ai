# Initialization 

import os, json, requests, hashlib, re, cryptography, pytz, random

from flask import Flask, request, render_template, redirect, abort, url_for, session, copy_current_request_context
from cryptography.fernet import Fernet
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect, send
from threading import Lock
from datetime import datetime

app = Flask(__name__)
socketio = SocketIO(app)
thread = None
thread_lock = Lock()

from dotenv import load_dotenv
load_dotenv()

enkey = os.environ['EN_KEY'].encode()

# Functions

def checkUser(username, password):
  find = executeSQL(f'SELECT * FROM accounts.accountData WHERE checkusername="{username.lower()}"')
  if find.json()[0]:
    data = find.json()[0]
    checkUsername = data['checkusername']
    checkPassword = data['password']
    if checkUsername == username.lower() and checkPassword == password:
      return True
    else:
      return False
  else:
    return False

def generateRoomId():
    letters = string.ascii_letters
    random_string = ''.join(random.choice(letters) for i in range(25))
    return 'room-' + random_string

def checkPerms(username, password):
  find = executeSQL(f'SELECT * FROM accounts.accountData WHERE checkusername="{username.lower()}"')
  if find.json()[0]:
    data = find.json()[0]
    checkUsername = data['checkusername']
    checkPassword = data['password']
    status = data['status']
    if checkUsername == username.lower() and checkPassword == password:
      if status == 'Admin' or status == 'Moderator':
        return True
      else:
        return False
    else:
      return False
  else:
    return False

def checkCommand(text):
  commands = ['/clear']
  for command in range(len(commands)):
    currentCommand = commands[command]
    if currentCommand in text:
      return True
    else:
      return False

def executeCommand(command, data):
  if command == '/clear':
    table = data[0]
    executeSQL(f'DELETE FROM {table}')
    emit('clearCommand', '{"room": "' + table + '"}', broadcast=True)

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
  response = executeSQL(f"UPDATE accounts.accountCount SET numberCount={int(count) + 1}")
  return count + 1

def getMessageId():
  find = executeSQL(f'SELECT * FROM chats.messageCount')
  jsonData = find.json()[0]
  count = jsonData['numberCount']
  response = executeSQL(f"UPDATE chats.messageCount SET numberCount={int(count) + 1}")
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
    username = jsonData['username']
    password = encodestring(jsonData['password'])
    find = executeSQL(f'SELECT * FROM accounts.accountData WHERE checkusername="{username.lower()}"')
    try:
      returnedJson = find.json()[0]
      userPass = returnedJson['password']
      usernameChcek = returnedJson['checkusername']
      id = returnedJson['userid']
      if username.lower() == usernameChcek and password == userPass:
        return '{"response": "SL", "password": "' + bencode(userPass) + '", "checkusername": "' + username + '", "id": "' + str(id) + '"}'
      else:
        return '{"response": "FAL"}'
      return '{"response": "UTP"}'
    except Exception as e:
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

@app.route('/chat', methods=['GET', 'POST'])
def chat():
  if request.method == 'GET':
    return render_template('chat.html', async_mode=socketio.async_mode)
  elif request.method == 'POST':
    return '{"response": "Posted"}'
  else:
    return '{"response": "Request Type Not Supported"}'

@app.route('/random-chat', methods=['GET', 'POST'])
def randomchat():
  if request.method == 'GET':
    return render_template('random-chat.html', async_mode=socketio.async_mode)
  elif request.method == 'POST':
    return '{"response": "Posted"}'
  else:
    return '{"response": "Request Type Not Supported"}'

# Socket IO

openRooms = []
lookingForRoom = []

@socketio.on('sendMessage')
def sendMessage(messageData):
  message = messageData['text']
  username = messageData['username']
  password = bdecode(messageData['password'])
  messageType = messageData['type']

  if messageType == 'mainRoom':
    if checkUser(username, password):
      messageId = getMessageId()
      newMessage = cleantext(message)
      if not checkCommand(newMessage):
        tz_NY = pytz.timezone('America/New_York') 
        datetime_NY = datetime.now(tz_NY)
        currentTime = datetime_NY.strftime('%H:%M')
        executeSQL(f"INSERT INTO chats.mainRoom (sendinguser, messagetext, messageid, messagetime, messagetype) VALUE ('{str(username)}', '{str(newMessage)}', {str(int(messageId))}, '{str(currentTime)}', 'mainRoom')")

        messageBackData = '{"sendinguser": "' + username + '", "messagetext": "' + newMessage + '", "messageid": "' + str(messageId) + '", "messagetime": "' + currentTime + '", "messagetype": "mainRoom"}'
        emit('newMessage', messageBackData, broadcast=True)
      else:
        if checkPerms(username, password):
          if ';' in newMessage:
            commandSplit = newMessage.split(';')
            commandData = []
            for entry in range(1, len(commandSplit)):
              commandData.append(commandSplit[entry])
              executeCommand(commandSplit[0], commandData)
          else:
            pass
        else:
          tz_NY = pytz.timezone('America/New_York') 
          datetime_NY = datetime.now(tz_NY)
          currentTime = datetime_NY.strftime('%H:%M')
          executeSQL(f"INSERT INTO chats.mainRoom (sendinguser, messagetext, messageid, messagetime, messagetype) VALUE ('{str(username)}', '{str(newMessage)}', {str(int(messageId))}, '{str(currentTime)}', 'text')")

          messageBackData = '{"sendinguser": "' + username + '", "messagetext": "' + newMessage + '", "messageid": "' + str(messageId) + '", "messagetime": "' + currentTime + '", "messagetype": "text"}'
          emit('newMessage', messageBackData, broadcast=True)
    else:
      emit('response', 'Failed To Send')
  else:
    print('newroom')

@socketio.on('getMessages')
def getMessages(getMessageData):
  room = getMessageData['room']

  if room == 'mainRoom':
    sendingString = ''
    find = executeSQL('SELECT * FROM chats.mainRoom ORDER BY messageid')
    jsonData = find.json()
    for entry in range(len(jsonData)):
      currentData = jsonData[entry]
      sendinguser = currentData['sendinguser']
      messagetext = currentData['messagetext']
      messagetime = currentData['messagetime']
      messageid = currentData['messageid']
      messagetype = currentData['messagetype']
      sendingString = sendingString + sendinguser + ';' + messagetext + ';' + messagetime + ';' + str(messageid) + ';' + messagetype + '>'
    loadBackData = '{"messages": "' + sendingString + '"}'
    emit('loadMessages', loadBackData)

@socketio.on('join')
def joinRoom(joinRoomData):
  uid = joinRoomData['room']
  if len(lookingForRoom) == 0:
    lookingForRoom.append(uid)
  else:
    for entry in range(len(lookingForRoom)):
      if str(lookingForRoom[entry]) == str(uid):
        pass
      else:
        lookingForRoom.append(uid)
  print(lookingForRoom, '\n\n')
  try:
    usercount = 0
    for userid in range(len(lookingForRoom)):
      usercount = usercount + 1
    if usercount < 1:
      emit('notEnoughUsers', '{"userCount": "' + str(usercount) + '"}')
    else:
      myid = uid
      inter = random.randint(0, len(lookingForRoom))
      otherid = lookingForRoom[inter]
      if myid == otherid:
        einter = random.randint(0, len(lookingForRoom))
        otherid = lookingForRoom[einter]
      print(myid, otherid)
  except Exception as e:
    emit('failedToConnect', '{"reason": "Failed To Create Room"}')
    print(e)

@socketio.on('clientDisconnecting')
def userLeaving(clientDisconnectingData):
  uid = clientDisconnectingData['uid']
  lookingForRoom.remove(uid)

# Flask

if __name__ == '__main__':
  socketio.run(app, host='0.0.0.0', port=3000)