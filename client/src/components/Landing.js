import React, { Component } from 'react'

class Landing extends Component {
    render () {
        return (
            <div className="container" style={{backgroundColor: "lightblue"}}>
                <div className="jumbotron mt-5" style={{backgroundColor: "lightblue"}}>
                    <div className="col-sm-8 mx-auto" style={{backgroundColor: "lightblue"}}>
                        <h1 className="text-center">Welcome to our bookstore</h1>
                        <h2 className="text-center">Here you can browse and buy books</h2>
                    </div>
                </div>
            </div>
        )
    }
}

export default Landing
