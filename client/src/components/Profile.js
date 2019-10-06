import React, { Component } from 'react'
import jwt_decode from 'jwt-decode'
import { searchDatabase } from './UserFunctions'
import { findISBNs } from './UserFunctions'
import { buy } from './UserFunctions'
import { tone } from './UserFunctions'

class Profile extends Component {
    constructor() {
        super()
        this.state = {
            first_name: '',
            last_name: '',
            email: '',
            //book has json format
            book: [],
            searchTerm: '',
            searchType: '',
            selectedOption: "ISBN",
            //action2 by default because when page load we want to bring ISBN
            //of books bought
            action: 'action2',
            isbn_bought: ["0123456789"],
            //search_results is an array containing json format
            search_results: [{"title": '', "author": '', "isbn" : ["0123456789"], "state": "", "avgres": ''}],
            no_results: '',
            buy_ISBN: '',
            isbn_notListed: '',
            res_bought: ''
        }
        this.search = this.search.bind(this);
        this.handleClickBuy = this.handleClickBuy.bind(this);
        this.handleClickTone = this.handleClickTone.bind(this);
    }

    componentDidMount = async() => {
        const token = localStorage.usertoken
        const decoded = jwt_decode(token)
        this.setState({
            first_name: decoded.identity.first_name,
            last_name: decoded.identity.last_name,
            email: decoded.identity.email
      }, this.getISBNs)
    }
    //ok done action2
    getISBNs = async() => {

        const fetchISBNs = {
            //we send email in order to find in database all ISBNs
            email: this.state.email,
            action: "action2"
        }

         findISBNs(fetchISBNs).then(res => {
          //res is a json of the form {"isbn_list": [array]}
            console.log(res)
            this.setState({
                isbn_bought: res
            });
        })
    }

    handleChange = event => {
        this.setState({
            searchTerm: event.target.value
        });
    };

    handleOptionChange = changeEvent => {
        this.setState({
            selectedOption: changeEvent.target.value
        });
    };

    handleOptionISBN = changeEvent => {
        this.setState({
            buy_ISBN: changeEvent.target.value
        });
    };

    search = event => {
        event.preventDefault();
        console.log(this.state.search_results[0].isbn.length)
        console.log("mpika" + this.state.selectedOption);
        const searchElements = {
            //we send email in ordeer to find in database
            email: this.state.email,
            action: "action1",
            inputString: this.state.searchTerm,
            searchBy: this.state.selectedOption
        }

        searchDatabase(searchElements).then(res => {
            //the response must be a json format. The json should have to format:
            //{"resBook": [{"title" : "mpla", "author": ....klp, "state": "found"}]}
            //the json must have a field state to denote if found
            //here set variables to be displayed
            console.log(res.resBook[0].state);
            if(res.resBook[0].state === "notfound"){
              console.log("kk");
              this.setState({
                  no_results: "No results"
              });
            }
            else{
              this.setState({
                  search_results: res.resBook,
                  no_results: ''
              });
            }
        })
    };

    handleClickBuy = async(event) => {
        event.preventDefault();
        if (this.state.search_results[0].isbn.indexOf(this.state.buy_ISBN) === -1) {
            console.log("The chosen ISBN is not icluded in the ISBN list");
            this.setState({
                //add new ISBN to ISBN list of bought books.
                isbn_notListed: "The chosen ISBN is not icluded in the ISBN list",
                res_bought: ''

            });
        }
        else {
            const buyInfo = {
                //we send email in order to find in database
                email: this.state.email,
                action: "action3",
                bookISBN: this.state.buy_ISBN
            }

            buy(buyInfo).then(res => {
                //the response must be a json format. The json should have to format:
                //{"resBook": [{"title" : "mpla", "author": ....klp, "state": "found"}]}
                //the json must have a field state to denote if found
                //here set variables to be displayed
                this.setState({
                    //add new ISBN to ISBN list of bought books.
                    isbn_bought: [...this.state.isbn_bought, this.state.buy_ISBN],
                    isbn_notListed: '',
                    res_bought: 'Book Bought'

                });
            })
       }
    }

    handleClickTone = async(event) => {
        event.preventDefault();
        console.log("isbn" + this.state.search_results[0].isbn[0])
        const toneInfo = {
            //we send email in order to find in database
            email: this.state.email,
            action: "action4",
            bookTitle: this.state.search_results[0].title
        }

        tone(toneInfo).then(res => {
          console.log(res)
          var image = new Image();
          image.src = "data:image/jpg;base64," + res;
          console.log(image.src);
          var w = window.open("");
          w.document.write(image.outerHTML);
        })
    }

    render () {
        const isEmptyIsbns = (this.state.isbn_bought.length > 0 ) ? (<p>List of ISBN of books Bought</p>) : null  ;
        const list_of_Isbns = this.state.isbn_bought.map((item, key) =>
            <li key={key}>{item}
            </li>
        );
        //SHOW THE RESULTs more can be added
        var loopFoundIsbn = (this.state.search_results[0].isbn.length >1) ? (this.state.search_results[0].isbn.map((item, key) =>
              <li key={key}>{item}
              </li>
            )) : (this.state.search_results[0].isbn)
        var searchBookInfo =   (<div> Search Results <br /> Book Title: {this.state.search_results[0].title} <br /> Book Author: {this.state.search_results[0].author}  <br /> Book ISBN:  <br /><ul>{loopFoundIsbn}</ul><br /> Book Average Ratings:  <br />{this.state.search_results[0].avgres}</div>);
        var chooseISBN = (<form onSubmit={(e) => this.handleClickBuy(e)}>
            <label>
              Give ISBN:
              <input type="text" placeholder="ISBN" value={this.state.buy_ISBN} onChange={this.handleOptionISBN} />
            </label>
            <button>Buy</button>
            </form>)
        var buyButton = (this.state.search_results[0].state === "found") ? ( <div>{searchBookInfo}{chooseISBN}{this.state.isbn_notListed}</div>) : null ;
        var results = (this.state.no_results === "No results") ? <p>No results</p> : null
        var toneButton = (this.state.search_results[0].state === "found") ? ( <div><button onClick={(e) => this.handleClickTone(e)}>Get sentiment analysis graph</button></div>) : null ;
        return (
            <div className="container" style={{backgroundColor: "#FFF8DC"}}>
                <div className="jumbotron mt-5" style={{backgroundColor: "#FFF8DC"}}>
                    <div className="col-sm-8 mx-auto" style={{backgroundColor: "#FFF8DC"}}>
                        <h1 className="text-center">User Profile</h1>
                    </div>
                    <table className="table col-md-6 mx-auto">
                        <tbody>
                            <tr>
                                <td>First Name</td>
                                <td>{this.state.first_name}</td>
                            </tr>
                            <tr>
                                <td>Last Name</td>
                                <td>{this.state.last_name}</td>
                            </tr>
                            <tr>
                                <td>Email</td>
                                <td>{this.state.email}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="renderIsbnsBought">
                    {isEmptyIsbns}
                    <ul>{list_of_Isbns}</ul>
                    </div><br /><br/>
		            <div className="searchBook">
                    <p>Search for book</p>
                    <form onSubmit={this.search}>
                        <input value={this.state.searchTerm}
                            placeholder="Search for a book"
                            onChange={this.handleChange}
                        />
                        <div className="form-check">
                          <label>
                            <input
                              type="radio"
                              name="react-tips"
                              value="ISBN"
                              checked={this.state.selectedOption === "ISBN"}
                              onChange={this.handleOptionChange}
                              className="form-check-input"
                            />
                            ISBN
                          </label>
                        </div>
                        <div className="form-check">
                          <label>
                            <input
                              type="radio"
                              name="react-tips"
                              value="author"
                              checked={this.state.selectedOption === "author"}
                              onChange={this.handleOptionChange}
                              className="form-check-input"
                            />
                            Author
                          </label>
                        </div>
                        <div className="form-check">
                          <label>
                            <input
                              type="radio"
                              name="react-tips"
                              value="title"
                              checked={this.state.selectedOption === "title"}
                              onChange={this.handleOptionChange}
                              className="form-check-input"
                            />
                            Title
                          </label>
                        </div>
                        <button>
                            Press
                        </button>
                    </form><br /><br />
                    <div className="renderSearchResults">
                    {results}
                    {buyButton}
                    <br />{this.state.res_bought}
                    <br/ >{toneButton}
                    </div>
	   	          </div>
                </div>
            </div>
        )
    }
}

export default Profile
