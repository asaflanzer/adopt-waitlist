import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FirebaseContext } from '../../firebase/firebaseConfig';
import 'firebase/firestore';
import './styled.scss';
// ant design
import { Result, Typography, Spin } from 'antd';
import { Timeline, Modal, Card } from 'antd';
import { Statistic, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
// Cookies
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const useGetStatus = (inQueue) => {
  const firebase = useContext(FirebaseContext);
  const db = firebase.firestore();
  // const [loading, setLoading] = useState(true);
  const history = useHistory();
  const [userStatus, setUserStatus] = useState([]);

  useEffect(() => {
    //setTimeout(() => {

    async function fetchStatus() {
      try {
        const user = await db.collection('queue').doc(inQueue);

        user.onSnapshot(
          (querySnapshot) => {
            if (querySnapshot.exists) {
              setUserStatus({
                id: querySnapshot.id,
                name: querySnapshot.data().name,
                timestamp: querySnapshot.data().timestamp,
                number: querySnapshot.data().number,
              });
              //setLoading(false);
            } else {
              //setInQueue(cookies.get('inQueue'));
              //setLoading(false);
            }
          },
          (err) => {
            console.log(err);
          }
        );
      } catch (error) {}
    }
    if (inQueue !== null) {
      fetchStatus();
    } else {
      history.push('/');
    }

    // if (userStatus.status === 'served') {
    //   db.collection('queue')
    //     .doc(userStatus.id)
    //     .delete()
    //     .then(() => {
    //       cookies.remove('inQueue');
    //       history.push('/');
    //       console.log('User deleted successfully');
    //     });
    // }

    //}, 1000);
  }, [inQueue, history, db]);

  return userStatus;
};
const Status = () => {
  const firebase = useContext(FirebaseContext);
  const db = firebase.firestore();
  // const [loading, setLoading] = useState(true);
  const history = useHistory();

  const [queueLength, setQueueLength] = useState();
  const [lastServed, setLastServed] = useState('');
  const [nextQueue, setNextQueue] = useState('');
  // Get user queue number from cookies
  const [inQueue] = useState(cookies.get('inQueue'));
  const userStatus = useGetStatus(cookies.get('inQueue'));

  useEffect(() => {
    // Get the first upcoming number in queue
    db.collection('queue')
      .where('status', 'in', ['pending', 'notified'])
      .limit(1)
      .onSnapshot(
        (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            setNextQueue(doc.data().number);
          });
        },
        (err) => {
          console.log(err);
        }
      );

    db.collection('queue')
      .where('status', '==', 'served')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .onSnapshot(
        (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            setLastServed(doc.data().number);
          });
        },
        (err) => {
          console.log(err);
        }
      );
  }, [nextQueue, lastServed, db]);

  useEffect(() => {
    // Get total queue size
    db.collection('queue')
      .where('status', 'in', ['pending', 'notified'])
      .onSnapshot(
        (querySnapshot) => {
          setQueueLength(querySnapshot.size);
        },
        (err) => {
          console.log(err);
        }
      );

    // firebase
    //   .database()
    //   .ref('users/')
    //   .once('value', (snapshot) => {
    //     console.log(snapshot.numChildren());
    //     setQueueLength(snapshot.numChildren());
    //   });
  }, [queueLength, db]);

  useEffect(() => {
    // Once each user reachs number 10 in line, update status and send email via BE function
    if (queueLength === 10) {
      //update user status to NOTIFIED
      console.log(inQueue);
      db.collection('queue')
        .doc(userStatus.id)
        .update({
          status: 'notified',
        })
        .then(() => {
          console.log('user is being notified');
        });
    }
  }, [queueLength, nextQueue, userStatus, inQueue, db]);

  const handleModal = (e) => {
    e.preventDefault();
    Modal.confirm({
      title: (
        <div style={{ textAlign: 'right', marginBottom: 10, paddingRight: 30 }}>
          יציאה
        </div>
      ),
      icon: <ExclamationCircleOutlined />,
      content: (
        <div style={{ margin: '0 auto', textAlign: 'right' }}>
          <p>?האם את/ה בטוח שאת/ה רוצה לבטל את תורך</p>
        </div>
      ),
      okText: 'כן, בטל את תורי',
      okType: 'danger',
      cancelText: 'חזור',
      onOk() {
        db.collection('queue')
          .doc(userStatus.id)
          .delete()
          .then(() => {
            cookies.remove('inQueue');
            history.push('/');
            console.log('User deleted successfully');
          });
      },
      onCancel() {
        return true;
      },
    });
  };

  return (
    <div
      style={{
        margin: '15px auto',
        textAlign: 'center',
        padding: '5px 20px 0 20px',
        maxWidth: 768,
      }}
    >
      {userStatus === null ? (
        <div>
          <Spin />
        </div>
      ) : userStatus === 0 ? (
        <div>
          <Result
            title='נראה שאין לכם מספר בתור'
            extra={<Link to='/'>חזרו אחורה לקחת מספר</Link>}
          />
        </div>
      ) : (
        nextQueue !== '' &&
        queueLength !== '' && (
          <>
            <Card
              title={
                <div>
                  <p>{` ,שלום ${userStatus.name}`}</p>
                  <p>הצטרפת בהצלחה לרשימת ההמתנה</p>
                  <p>ליום האימוץ של אדופט</p>
                </div>
              }
              style={{
                width: '100%',
                margin: '0 auto',
                border: '1px solid #000',
                borderRadius: 4,
              }}
            >
              <p>מספרך בתור</p>
              {userStatus.number ? (
                <h2 style={{ fontSize: 50 }}>{`${userStatus.number}`}</h2>
              ) : (
                // {`ADP${userStatus.id}`}
                <h2 style={{ fontSize: 50 }}>{`${inQueue}`}</h2>
                // {`ADP${inQueue}`}
              )}
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title='זמן המתנה משוער'
                    value={queueLength * 2}
                    prefix={`'דק`}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title='ממתינים לפניך'
                    value={queueLength}
                    prefix={<UserOutlined />}
                  />
                </Col>
                {lastServed !== '' && (
                  <Col span={8}>
                    <Statistic
                      title='אחרונים שנכנסו'
                      value={`${lastServed}`}
                      className='last-in'
                    />
                    {/* {`ADP${nextQueue}`} */}
                  </Col>
                )}
              </Row>
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
                  ההמתנה יכולה לקחת זמן ויכול להיות שנחרוג בשעת הסיום, נשמח
                  שתתאזרו בסבלנות
                </Timeline.Item>
                <Timeline.Item>
                  אין חובה להישאר עד תורכם אך יש להגיע
                  <br />
                  בזמן לפי עדכוני האפליקציה
                </Timeline.Item>
              </Timeline>
              <Typography.Text type='secondary'>
                {userStatus ? dayjs(userStatus.timestamp).format('HH:mm') : ''}{' '}
                הצרפת לתור בשעה
              </Typography.Text>
              <p>כאשר מספרך יתקרב, תקבל מייל שיזכירך לשוב לגינת האימוץ</p>
              <Link to='/' onClick={handleModal}>
                ביטול התור
              </Link>
            </Card>
          </>
        )
      )}
    </div>
  );
};

export default Status;
