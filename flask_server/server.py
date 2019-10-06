from flask import Flask, jsonify, request, json, send_file
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from datetime import datetime
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_jwt_extended import create_access_token
from rdflib import Graph
import base64


app = Flask(__name__)

app.config['MONGO_DBNAME'] = 'bookstore'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/bookstore'
app.config['JWT_SECRET_KEY'] = 'secret'

mongo = PyMongo(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

CORS(app)

@app.route('/users/register', methods=["POST"])
def register():
    users = mongo.db.users
    first_name = request.get_json()['first_name']
    last_name = request.get_json()['last_name']
    email = request.get_json()['email']
    password = bcrypt.generate_password_hash(request.get_json()['password']).decode('utf-8')
    created = datetime.utcnow()
    result = ""

    #user should not use the same email
    response = users.find_one({'email': email})


    if response:
        result = jsonify({"error":"This email has an account"})
        return result
    else:
        user_id = users.insert({
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'password': password,
            'created': created,
            'ISBNs' : [],
            'rating': []
        })

        new_user = users.find_one({'_id': user_id})

        result = {'email': new_user['email'] + ' registered'}

        return jsonify({'result' : result})

@app.route('/users/login', methods=['POST'])
def login():
    users = mongo.db.users
    email = request.get_json()['email']
    password = request.get_json()['password']
    result = ""

    response = users.find_one({'email': email})
    if response:
        if bcrypt.check_password_hash(response['password'], password):
            access_token = create_access_token(identity = {
                'first_name': response['first_name'],
                'last_name': response['last_name'],
                'email': response['email']
            })
            result = jsonify({'token':access_token, "error": "", "result": "" })
        else:
            result = jsonify({"error":"Invalid username and password", "result": ""})
    else:
        result = jsonify({"result":"No results found", "error": ""})
    return result

@app.route('/users/profile', methods=['POST'])
def searchDatabase():
    # profile sends two types of request. For search(we define action 1),
    # for books bought (action 2) and for buying (action 3)
    action = request.get_json()['action']


    if action == 'action1':

        #search database to fetch ISBN for book bought
        inputString = request.get_json()['inputString']
        searchBy = request.get_json()['searchBy']
        #search triple store, return result json
        #the response must be a json format. The json should have to format:
        #{"resBook": [{"title" : "mpla", "author": ....klp, "state": "found"}]}
        #the json must have a field state to denote if found
        #here set variables to be displayed
        #result = jsonify({'field1...':})
        #return result
        #return {"resBook": [{"title" : "titleA", "author": "authorB", "isbn": "ffff", "state": "found"}]}
        g = Graph()

        g.parse('ani_integer_sparql_trig.trig', format='turtle')

        if searchBy == "title":
             authorFound = ''
             x = ''
             y = "^^xsd:string"
             z = '"' + inputString + '"' + y
             qres = g.query(
                """
                SELECT ?titleurl ?author ?isbns
                WHERE {
                    ?titleurl dvocab:b_title """+z+""" .
        	        ?titleurl dvocab:author ?author .
        	        ?titleurl dvocab:b_isbn ?isbns
                    }
                """)
             isbnFound = []
             counter = 0
             for row in qres:
                   authorFound = row.author[32:]
                   isbnFound.append(row.isbns)
                   x = inputString
                   counter = counter + 1
             if authorFound == '':
                 return {"resBook": [{"title" : x, "author": authorFound, "isbn": [], "state": "notfound", "avgres": ''}]}
             else:
                 z = '"' + isbnFound[0] + '"' + y
                 qres = g.query(
                    """
                    SELECT ?titleurl (AVG(?sum) as ?p)
                    WHERE {
                        ?titleurl dvocab:b_isbn """+z+""" .
                        ?titleurl dvocab:b_rating ?sum}
                    """)
                 for row in qres:
                     avgres = row.p
                 return {"resBook": [{"title" : x, "author": authorFound, "isbn": isbnFound, "state": "found", "avgres": avgres}]}
        elif searchBy == "ISBN":
             titleFound = ''
             authorFound = ''
             x = ''
             y = "^^xsd:string"
             z = '"' + inputString + '"' + y
             qres = g.query(
                """
                SELECT ?titleurl ?author ?title (AVG(?sum) as ?p)
                WHERE {
                    ?titleurl dvocab:b_isbn """+z+""" .
                    ?titleurl dvocab:b_title ?title .
        	        ?titleurl dvocab:author ?author}
                """)

             for row in qres:
                 authorFound = row.author[32:]
                 titleFound = row.title
                 x = inputString
                 break

             if authorFound == '':
                 return {"resBook": [{"title" : titleFound, "author": authorFound, "isbn": [], "state": "notfound", "avgres": ''}]}
             else:
                 qres = g.query(
                    """
                    SELECT ?titleurl (AVG(?sum) as ?p)
                    WHERE {
                        ?titleurl dvocab:b_isbn """+z+""" .
                        ?titleurl dvocab:b_rating ?sum}
                    """)
                 for row in qres:
                     avgres = row.p
                 return {"resBook": [{"title" : titleFound, "author": authorFound, "isbn": [inputString], "state": "found", "avgres": avgres}]}
        elif searchBy == "author":
             x = ''
             titleFound = ''
             qres = g.query(
                """
                SELECT ?titleurl ?isbns ?title
                WHERE {
                    ?titleurl dvocab:author ddata:"""+inputString+""" .
                    ?titleurl dvocab:b_isbn ?isbns .
                    ?titleurl dvocab:b_title ?title}
                """)
             # prosoxi prepei na nai array to isbn
             isbnFound = []
             w = 0
             for row in qres:
                 if w == 0:
                     firstTitle = row.title
                     w = 1
                     print("hi")
                 print(row.title)
             for row in qres:
                 if firstTitle == row.title:
                     isbnFound.append(row.isbns)
                     titleFound = row.title
                     x = inputString
                 print(row.title)
             if titleFound == '':
                 return {"resBook": [{"title" : titleFound, "author": x, "isbn": [], "state": "notfound", "avgres": ''}]}
             else:
                 y = "^^xsd:string"
                 z = '"' + isbnFound[0] + '"' + y
                 qres = g.query(
                    """
                    SELECT ?titleurl (AVG(?sum) as ?p)
                    WHERE {
                        ?titleurl dvocab:b_isbn """+z+""" .
                        ?titleurl dvocab:b_rating ?sum}
                    """)
                 for row in qres:
                     avgres = row.p
                 return {"resBook": [{"title" : titleFound, "author": x, "isbn": isbnFound, "state": "found", "avgres": avgres}]}
        else:
             return {"resBook": [{"title" : "", "author": "", "isbn": "", "state": "error", "avgres": ''}]}

    elif action == 'action2':
        #search database to fetch ISBN for book bought
        #users is the collection where we store users
        users = mongo.db.users
        #below we store the input from the post request
        email = request.get_json()['email']
        result = ""

        response = users.find_one({'email': email})
        #the else statement is redundant as the bought button can only be
        #pressed since the user is already signed in
        if response:
            #the user exists. get ISBNs. ISBNs is an array
            result = jsonify({'isbn_list': response['ISBNs']})
            return result
        else:
            result = jsonify({"result":"No results found"})
            return result
    elif action == "action3":
        #now action is 3. so we should add bought book to ISBN list
        #the action of payment is not implemented
        users = mongo.db.users
        email = request.get_json()['email']
        isbn = request.get_json()['bookIsbn']
        result = ""

        response = users.find_one({'email': email})
        #the else statement is redundant as the bought button can only be
        #pressed since the user is already signed in
        if response:
            #the user exists. add ISBN to the array and the average rating
            #the average rating is based on all versions of the book
            g = Graph()
            g.parse('ani_integer_sparql_trig.trig', format='turtle')
            y = "^^xsd:string"
            z = '"' + isbn[0] + '"' + y
            qres = g.query(
               """
               SELECT (AVG(?sum) as ?p) ?titleurl
               WHERE {
                   ?titleurl dvocab:b_isbn """+z+""" .
                   ?titleurl dvocab:b_rating ?sum}
               """)
            for row in qres:
                avg = row.p
            # sto frontend epistrefoyme mono to ISBN gia na proste9ei sti lista
            # me ta agoramsena. Alla stin vasi apo9ikeuoume ISBN+avgrating
            result = jsonify({'isbn_list': response['ISBNs']})
            #first update ISBN list then update rating array
            users.update({'email': email}, { '$push': { 'ISBNs': isbn }})
            users.update({'email': email}, { '$push': { 'rating': avg }})
            return result
        else:
            result = jsonify({"result":"No results found"})
            return result
    elif action == 'action4':
        #extra code for image test. action is 4
        users = mongo.db.users
        email = request.get_json()['email']
        title = request.get_json()['bookTitle']
        filename='%s.jpg' % title
        with open(filename, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read())
        return encoded_string
    else:
        result = jsonify({"result":"Wrong request"})
        return result

if __name__ == '__main__':
    app.run(debug=True)
