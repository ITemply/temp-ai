import os, json, requests

from flask import Flask, request, render_template, redirect, abort
from cryptography.fernet import Fernet

app = Flask(__name__)

from dotenv import load_dotenv
load_dotenv()

def cleantext(text):
  outputString = re.sub('<[^<]+?>', '', text)
  return outputString

def encodestring(inputstring):
  cipher_suite = Fernet(os.environ['DB_ENKEY'].encode('utf-8'))
  ciphered_text = cipher_suite.encrypt(inputstring.encode('utf-8'))
  returnString = str(ciphered_text.decode())
  return returnString

def decodestring(inputstring):
  cipher_suite = Fernet(os.environ['DB_ENKEY'].encode('utf-8'))
  unciphered_text = (cipher_suite.decrypt(inputstring))
  returnString = str(unciphered_text.decode())
  return returnString

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

@app.route('/signup', methods=['GET', 'POST'])
def login():
  if request.method == 'GET':
    return render_template('signup.html')
  elif request.method == 'POST':
    jsonData = request.get_json(force=True)
    username = jsonData['username']
    password = jsonData['password']
    encodedPassword = encodestring(password)
    print(jsonData)
    status = jsonData['status']
    executeSQL(f"INSERT INTO accounts.accountData (username, password, status) VALUE ('{username}', '{encodedPassword}', '{status}')")
    return '{"response": "Signed Up"}'
  else:
    return '{"response": "Request Type Not Supported"}'

if __name__ == '__main__':
  app.run(host='0.0.0.0')
