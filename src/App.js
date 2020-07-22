import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
// import userContext from './context';
// import useAuth from './useAuth';
import Landing from './components/landing';
import ContactForm from './components/form';
import Status from './components/status';
import Queue from './components/admin/queue';
// ant design
import 'antd/dist/antd.css';

const App = () => {
  // useEffect(() => {
  //   callBackendAPI()
  //     .then((res) => console.log(res.express))
  //     .catch((err) => console.log(err));
  // });
  // // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  // const callBackendAPI = async () => {
  //   const response = await fetch('/express_backend');
  //   const body = await response.json();

  //   if (response.status !== 200) {
  //     throw Error(body.message);
  //   }
  //   return body;
  // };

  return (
    // <userContext.Provider value={{ user }}>
    <div
      className='container'
      style={{ minHeight: '100vh-50px', position: 'relative' }}
    >
      <BrowserRouter>
        <Switch>
          <Route exact path='/'>
            <Landing />
          </Route>
          <Route path='/form'>
            <ContactForm />
          </Route>
          <Route path='/status'>
            <Status />
          </Route>
          <Route path='/queue'>
            <Queue />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
    // </userContext.Provider>
  );
};

export default App;
