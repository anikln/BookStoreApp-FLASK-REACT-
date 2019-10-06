# Bookstore App that fetch results stored in triples

This project contains an application for a Bookstore and it was implemented as part
of a semester's assignment for the graduate course "Artificial Intelligence and
Data Analytics".
A user can make an account using his email to sign in. After sign in the user
can browse the for a book either by its title or by its ISBN. He can also search
by the author's name and find out the available books in the bookstore's database
that are written by that author. For simplicity and just for demonstration, when
a user search by author name the application returns only the first result but
this can be easily changed to return all books. Moreover a user can get a a sentiment
analysis for a chosen book which was created using IBM's Tone Analyzer Service.
The app has the following components:
* a nodejs backend server that listens to request and sends a single page application.
  it is implemented using crete-react-app
* a frontend with a single page application that communicates with a proxy server.
  From the frontend the user can create an account, sign in, and browse for books
  that are stored in the bookstore's database. The frontend code is written in Javascript
  and it uses React library
* a proxy server where the bookstore's data are stored. The server is build using
  Flask web framework and so it is written in Python programming language. Its
  purpose is to store user's credential in a MongoDB database and to fetch provide
  data about books to the frontend. Information about the books where gathered
  from the OpenLibrary, dbpedia and wikidata. The dataset is stored as a triple
  store, so the server can execute queries in sparql to fetch data. Also the server
  stores for each book the plots produced from the sentiment analysis results
  that were produced using IBM's Tone Analyzer Service.
* a MongoDB database that store user's credential and Information, line his email,
  password, and the list of the books he has bought

## Application Demo

<img src="/Application_Images/1v2.jpg"><img src="/Application_Images/2v2.jpg"><img src="/Application_Images/3v2.jpg"><img src="/Application_Images/4v2.jpg"><img src="/Application_Images/5v2.jpg"><img src="/Application_Images/6v2.jpg"><img src="/Application_Images/7v2.jpg"><img src="/Application_Images/8v2.jpg">

## Authors

* **Kleinaki Athina Styliani** -  [AniKln](https://github.com/anikln)
