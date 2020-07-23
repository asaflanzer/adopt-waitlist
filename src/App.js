import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
// compontents
import Landing from './components/landing';
import ContactForm from './components/form';
import Status from './components/status';
import Queue from './components/admin/queue';
// ant design
import 'antd/dist/antd.css';
import FirebaseProvider from './firebase/firebaseConfig';

const App = () => {
  return (
    <FirebaseProvider>
      <div
        className='container'
        style={{ minHeight: '100vh', position: 'relative' }}
      >
        <BrowserRouter>
          <Switch>
            <Route exact path='/'>
              {localStorage.getItem('inQueue') ? (
                <Redirect to='/status' />
              ) : (
                <Landing />
              )}
            </Route>
            <Route path='/form'>
              {localStorage.getItem('inQueue') ? (
                <Redirect to='/status' />
              ) : (
                <ContactForm />
              )}
            </Route>
            <Route path='/status'>
              {localStorage.getItem('inQueue') ? (
                <Status />
              ) : (
                <Redirect to='/' />
              )}
            </Route>
            <Route path='/queue'>
              <Queue />
            </Route>
          </Switch>
        </BrowserRouter>
      </div>
    </FirebaseProvider>
  );
};

export default App;
