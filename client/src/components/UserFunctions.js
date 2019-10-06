import axios from 'axios'

export const register = newUser => {
    return axios
        .post("users/register", {
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            password: newUser.password
        })
        .then(response => {
            console.log("Registered")
            return response.data.error
        })
}

export const login = user => {
    return axios
        .post("users/login", {
            email: user.email,
            password: user.password
        })
        .then(response => {
            console.log (response.data)
            if(response.data.error === "Invalid username and password" || response.data.result === "No results found"){
              return "error"
            }
            else{
              localStorage.setItem('usertoken', response.data.token)
              return response.data.token
            }
        })
        .catch(err => {
            console.log(err)
        })
}

export const findISBNs = fetchISBNs => {
    return axios
        .post("users/profile", {
            email: fetchISBNs.email,
            action: fetchISBNs.action
        })
        .then(response => {
            console.log(response.data.isbn_list)
            return response.data.isbn_list
        })
        .catch(err => {
            console.log(err)
        })
}

export const searchDatabase = searchElements => {
    //the response must be a json format. The json should have to format:
    //{"resBook": [{"title" : "mpla", "author": ....klp, "state": "found"}]}
    //the json must have a field state to denote if found
    return axios
        .post("users/profile", {
            email: searchElements.email,
            action: searchElements.action,
            inputString: searchElements.inputString,
            searchBy: searchElements.searchBy
        })
        .then(response => {
          //response is a json with cvs data
            console.log(response.data.resBook[0]);
            return response.data
        })
        .catch(err => {
            console.log(err)
        })
}

export const buy = buyInfo => {
    return axios
        .post("users/profile", {
            email: buyInfo.email,
            action: buyInfo.action,
            bookIsbn: buyInfo.bookISBN
        })
        .then(response => {
            console.log("BookBought")
            return response.data
        })
}

export const tone = toneInfo => {
    return axios
        .post("users/profile", {
            email: toneInfo.email,
            action: toneInfo.action,
            bookTitle: toneInfo.bookTitle
        })
        .then(response => {
            console.log("ToneInfo")
            //console.log(response.data)
            return response.data
        })
}
