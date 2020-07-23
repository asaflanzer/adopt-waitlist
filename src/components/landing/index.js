import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import logo from '../../static/adopt_logo.png';
import { FirebaseContext } from '../../firebase/firebaseConfig';
import 'firebase/firestore';
import './styled.scss';
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

  // useEffect(() => {
  //   // //Enable queue till 15:30
  //   // if (date.hour() === 15 && date.minute() > 30) {
  //   //   setDisabled(true);
  //   // }
  //   //UNCOmMENT FOR PRODUCTION
  //   //Enable queue on FRI between 11-15
  //   if (date.day() === 5 && date.hour() >= 11 && date.hour() < 15) {
  //     setDisabled(false);
  //   } else {
  //     setDisabled(true);
  //   }
  // }, []);

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
      .where('status', 'in', ['pending', 'notified'])
      .onSnapshot(
        (querySnapshot) => {
          setLoading(false);
          setQueueLength(querySnapshot.size);
          // const queue = [];
          // querySnapshot.forEach((doc) => {
          //   setNextQueue(doc.id);
          // });
        },
        (err) => {
          console.log(err);
        }
      );
    // Axios.get(
    //   'https://europe-west1-virtual-line.cloudfunctions.net/api/user'
    // ).then((result) => {
    //   setQueueLength(result.data.length);
    // });
    return () => {
      setQueueLength('');
      setLoading(false);
    };
  }, [db]);

  return (
    <div
      style={{
        margin: '0 auto',
        textAlign: 'center',
        maxWidth: 768,
        paddingTop: 30,
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
          <Title level={3}>
            ברוכים הבאים ליום האימוץ של אדופט - בית מחסה לכלבים
          </Title>
          <Timeline mode='right' className='landing-timeline'>
            <Timeline.Item>
              - האימוץ יתקיים בנוכחות כל דיירי הבית
              <br /> כולל ילדים וכלבים
            </Timeline.Item>
            <Timeline.Item>
              לא כל הקודם זוכה - אנחנו נדבר עם כולם
              <br />
              ורק כשיסתיים התור יתקבלו החלטות
            </Timeline.Item>
            <Timeline.Item>
              ההמתנה יכולה לקחת זמן ויכול להיות שנחרוג
              <br />
              בשעת הסיום, נשמח שתתאזרו בסבלנות
            </Timeline.Item>
            <Timeline.Item>
              אין חובה להישאר עד תורכם אך יש להגיע
              <br />
              בזמן לפי עדכוני האפליקציה
            </Timeline.Item>
          </Timeline>
          <Row gutter={16}>
            <Col span={2} />
            {queueLength !== '' ? (
              <>
                <Col span={10}>
                  <Statistic
                    title='זמן המתנה משוער'
                    value={`${queueLength * 2}`}
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
                <Col span={20}>
                  <div className='loading'>
                    <Spin />
                  </div>
                </Col>
              </>
            )}
            <Col span={2} />
          </Row>
          <div style={{ marginTop: 15 }}>
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
      </Row>
    </div>
  );
};

export default Landing;
