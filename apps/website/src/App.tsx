import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'

import './App.css'

import Home from './pages/Home'
import Speakers from './pages/Speakers'
import Team from './pages/Team'
import Contact from './pages/Contact'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

import Loading from './components/Loading/Loading'
import Title from './components/Title/Title'

import AppContextProvider from './AppContextProvider'
import { AppContext } from './AppContext'

export class App extends Component {
  render() {
    return (
      <AppContextProvider>
        <article>
          <Router>
            
          <header>
            <div className="container">
              <div className="logo">
                <Title/>
              </div>
              
              <input type="checkbox" ref="sidebarToggle" id="sidebar-toggle" hidden/>
              <label htmlFor="sidebar-toggle" className="hamburger"><span></span></label>
              
              <div className="sidebar">
                <nav className="sidebar-nav">
                  <Link to={'/'}>About</Link>
                  <Link to={'/speakers'}>Speakers</Link>
                  <Link to={'/team'}>Team</Link>
                  <Link to={'/contact'}>Contact</Link>
                  <Link to={'/register'}>Register</Link>
                </nav>
              </div>

              <div className="sidebar-shadow" id="sidebar-shadow"/>
              
              <nav className="desktop-nav">
                <Link to={'/'}>About</Link>
                <Link to={'/speakers'}>Speakers</Link>
                <Link to={'/team'}>Team</Link>
                <Link to={'/contact'}>Contact</Link>
                <Link to={'/register'}>Register</Link>
              </nav>
            </div>
          </header>

            <AppContext.Consumer>
              {
                appContext => (
                  <div>
                    {
                      appContext.state.ongoingAppTransition ? <Loading/> : null
                    }
                  </div>
                )
              }
            </AppContext.Consumer>

            <Switch>
              <Route exact path="/" component={Home}/>
              <Route path="/team" component={Team}/>
              <Route path="/speakers" component={Speakers}/>
              <Route path="/contact" component={Contact}/>
              <Route path="/register" component={Register}/>
              
              <Route path="/dashboard" component={Dashboard}/>
              
              <Route component={Home}/>
            </Switch>
            
            <footer>
              TEDxJMI 2019 Official Website <br/>
              Operating under license from TED
            </footer>
          </Router>
        </article>
      </AppContextProvider>      
    )
  }
}

export default App