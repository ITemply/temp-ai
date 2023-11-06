import harperdb, os, json

from flask import Flask, request, render_template, redirect, abort

app = Flask(__name__)

from dotenv import load_dotenv
load_dotenv()

schema = f"book_repo"

db = harperdb.HarperDB(url=os.environ["DB_URL"], username=os.environ["DB_USER"], password=os.environ["DB_PASSWORD"])

class BookModel:
    def create(self, book_list):
        return db.insert(schema, 'books', book_list)
    
    def update(self, book_list):
        return db.update(schema, 'books', book_list)

    def delete(self, id):
        return db.delete(schema, 'books', [id])
    
    def get(self, id):
        return db.search_by_hash(schema, 'books', [id], get_attributes=['*'])

    def get_all(self):
        return db.sql(f"select book_name, author, pages from {schema}.{'books'}")

@app.route('/', methods=['GET', 'POST'])
def index():
  return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
  if request.method == 'GET':
    return render_template('login.html')
  elif request.method == 'POST':
    print(request.get_json(force=True))
    BookModel.create(schema, json.loads(str(request.get_json())))
    return '{"response": "posted new"}'
  else:
    return 'requets type not availibe'

if __name__ == '__main__':
  app.run(host='0.0.0.0', port='8080')
