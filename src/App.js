import React, { useState } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
// compontents
import Landing from './components/landing';
import ContactForm from './components/form';
import Status from './components/status';
import Login from './components/admin/login';
import Queue from './components/admin/queue';
// ant design
import 'antd/dist/antd.css';
import FirebaseProvider from './firebase/firebaseConfig';
// Cookies
import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const AuthContext = React.createContext(null);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <FirebaseProvider>
      <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
        <div className='container' style={{ position: 'relative' }}>
          <BrowserRouter>
            <Switch>
              <Route exact path='/'>
                {cookies.get('inQueue') !== undefined ? (
                  <Redirect to='/status' />
                ) : (
                  <Landing />
                )}
              </Route>
              <Route path='/form'>
                {cookies.get('inQueue') !== undefined ? (
                  <Redirect to='/status' />
                ) : (
                  <ContactForm />
                )}
              </Route>
              <Route path='/status'>
                <Status />
              </Route>
              <Route path='/login'>
                <Login />
              </Route>
              <Route path='/queue' component={Queue} />
              <Redirect to='/' />
            </Switch>
          </BrowserRouter>
        </div>
      </AuthContext.Provider>
    </FirebaseProvider>
  );
};

export default App;
