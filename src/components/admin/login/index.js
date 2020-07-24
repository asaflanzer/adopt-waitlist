import React, { useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import logo from '../../../static/adopt_logo.png';
import { FirebaseContext } from '../../../firebase/firebaseConfig';
import 'firebase/auth';
import 'firebase/firestore';
import './styled.scss';
// ant design
import { Typography } from 'antd';
import { Form, Input } from 'antd';
import { Row, Col } from 'antd';

const { Title } = Typography;

const Login = () => {
  const firebase = useContext(FirebaseContext);
  const [formData, setFormData] = useState([]);
  const history = useHistory();
  //   const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(true);

  const handleLogin = (e) => {
    e.preventDefault();
    firebase
      .auth()
      .signInWithEmailAndPassword(formData.email, formData.password)
      .then((res) => {
        if (res.user) {
          console.log('Login successful');
          console.log(res.user);
          history.push('/queue');
        }
      })
      .catch((err) => console.log(err));
  };

  //   const handleLogout = () => {
  //     return firebase.auth().signOut();
  //   };

  const updateInput = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    formData.name !== '' && formData.email !== '' && formData.phone !== ''
      ? setDisabled(false)
      : setDisabled(true);
  };

  return (
    <div
      style={{
        margin: '0 auto',
        textAlign: 'center',
        maxWidth: 768,
        paddingTop: 30,
      }}
    >
      <Form
        onSubmit={handleLogin}
        autoComplete='off'
        style={{
          margin: '0 auto',
          textAlign: 'center',
          maxWidth: 768,
          minWidth: 300,
          paddingTop: 50,
        }}
      >
        <Row>
          <Col span={24}>
            <img
              src={logo}
              heigth='100'
              width='100'
              alt='logo'
              style={{ marginBottom: 10 }}
            />
            <Title level={3}>כניסת צוות</Title>
            <Row gutter={16}>
              <Col span={2} />
              <Col span={20}>
                <Form.Item>
                  <Input
                    dir='rtl'
                    type='email'
                    name='email'
                    placeholder='אימייל'
                    onChange={updateInput}
                    value={formData.email || ''}
                    autoComplete='off'
                  />
                </Form.Item>
                <Form.Item>
                  <Input
                    dir='rtl'
                    type='password'
                    name='password'
                    placeholder='סיסמה'
                    onChange={updateInput}
                    value={formData.password || ''}
                    autoComplete='new-password'
                  />
                </Form.Item>
                <div style={{ marginTop: 15 }}>
                  <button
                    type='primary'
                    onClick={handleLogin}
                    disabled={disabled}
                  >
                    התחברות
                  </button>
                </div>
              </Col>
              <Col span={2} />
            </Row>
          </Col>
        </Row>
        <br />
        <Link to='/'>חזור אחורה</Link>
      </Form>
    </div>
  );
};

export default Login;
