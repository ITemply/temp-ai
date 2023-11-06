import harperdb, os

from flask import Flask, request, render_template, redirect, abort

app = Flask(__name__)

from dotenv import load_dotenv
load_dotenv()

db = harperdb.HarperDB(url=os.environ["DB_URL"], username=os.environ["DB_USER"], password=os.environ["DB_PASSWORD"])

@app.route('/', methods=['GET', 'POST'])
def index():
  return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
  if request.method == 'GET':
    return render_template('login.html')
  elif request.method == 'POST':
    return '{"response": "posted new"}'
  else:
    return 'requets type not availibe'

if __name__ == '__main__':
  app.run(host='0.0.0.0')
