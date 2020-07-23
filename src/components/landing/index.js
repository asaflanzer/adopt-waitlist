import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import logo from '../../static/adopt_logo.png';
import { FirebaseContext } from '../../firebase/firebaseConfig';
import 'firebase/firestore';
import './styled.scss';
// import firebase from 'firebase/app';
// ant design
import { Typography } from 'antd';
import { Timeline } from 'antd';
import { Statistic, Row, Col } from 'antd';
import { Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Landing = () => {
  const firebase = useContext(FirebaseContext);
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [disabled] = useState(false); // Change to true for PRODUCTION
  const [queueLength, setQueueLength] = useState('');

  const db = firebase.firestore();

  if (localStorage.getItem('inQueue') !== null) {
    history.push('/status');
  }

  useEffect(() => {
    // if (date.hour() === 15 && date.minute() > 30) {
    //   setDisabled(true);
    // }
    // UNCOmMENT FOR PRODUCTION
    // if (date.day() === 5 && date.hour() >= 11 && date.hour() < 15) {
    //   setDisabled(false);
    // } else {
    //   setDisabled(true);
    // }
  }, []);

  useEffect(() => {
    // firebase
    //   .database()
    //   .ref('users/')
    //   .once('value', (snapshot) => {
    //     console.log(snapshot.numChildren());
    //     setQueueLength(snapshot.numChildren());
    //   });

    // Get total queue size
    db.collection('queue')
      .get()
      .then((snapshot) => {
        setQueueLength(snapshot.size);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });

    // Axios.get(
    //   'https://europe-west1-virtual-line.cloudfunctions.net/api/user'
    // ).then((result) => {
    //   setQueueLength(result.data.length);
    // });
  }, [db]);

  return (
    <div
      style={{
        margin: '0 auto',
        textAlign: 'center',
        maxWidth: 768,
        marginTop: 50,
      }}
    >
      <Row>
        <Col span={2} />
        <Col span={20}>
          <img src={logo} heigth='100' width='100' alt='logo' />
          <Title level={3}>ברוכים הבאים ליום אימוץ של בית המחסה אדופט</Title>
          <Timeline mode='right' className='landing-timeline'>
            <Timeline.Item>חובה שכל דיירי הבית יהיו נוכחים</Timeline.Item>
            <Timeline.Item>ימי אימוץ הם רק ביום שישי בין 12-16</Timeline.Item>
            <Timeline.Item>לא כל הקודם זוכה</Timeline.Item>
          </Timeline>
          <Row gutter={16}>
            <Col span={2} />
            {queueLength !== '' ? (
              <>
                <Col span={10}>
                  <Statistic
                    title='מזמן המתנה משוער'
                    value={`${queueLength * 3}`}
                    prefix={`'דק`}
                  />
                </Col>
                <Col span={10}>
                  <Statistic
                    title='ממתינים בתור'
                    value={queueLength}
                    prefix={<UserOutlined />}
                  />
                </Col>
              </>
            ) : (
              <>
                <Col span={12}>
                  <div className='loading'>
                    <Spin />
                  </div>
                </Col>
              </>
            )}
            <Col span={2} />
          </Row>
          <div style={{ marginTop: 50 }}>
            {disabled ? (
              <button type='primary' disabled='disabled'>
                אין יותר תורים, נתראה שבוע הבא
              </button>
            ) : loading ? (
              ''
            ) : (
              <button type='primary' onClick={(e) => history.push('/form')}>
                הצטרפו לתור
              </button>
            )}
          </div>
          <div style={{ marginTop: 30 }}>
            <Text>
              הצטרפתם כבר לתור? <Link to='/status'>בדקו את מיקומכם</Link>
            </Text>
          </div>
        </Col>
        <Col span={2} />
      </Row>
    </div>
  );
};

export default Landing;
