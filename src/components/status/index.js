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

const Status = () => {
  const firebase = useContext(FirebaseContext);
  const [userStatus, setUserStatus] = useState([]);
  const [queueLength, setQueueLength] = useState();
  const [nextQueue, setNextQueue] = useState();
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const db = firebase.firestore();

  const cookies = new Cookies();

  // Get user queue number from localStorage
  const [inQueue, setInQueue] = useState(
    cookies.get('inQueue') || 'none found'
  );

  useEffect(() => {
    setTimeout(() => {
      if (inQueue === null) {
        history.push('/');
      }
      db.collection('queue')
        .doc(cookies.get('inQueue') || '999999')
        .onSnapshot(
          (querySnapshot) => {
            if (querySnapshot.exists) {
              setUserStatus({
                id: querySnapshot.id,
                name: querySnapshot.data().name,
                timestamp: querySnapshot.data().timestamp,
              });
              setLoading(false);
            } else {
              setInQueue(cookies.get('inQueue'));
              setLoading(false);
            }
          },
          (err) => {
            console.log(err);
          }
        );
    }, 1000);

    // .then((doc) => {
    //   if (doc.exists) {
    //     setUserStatus({
    //       id: doc.id,
    //       name: doc.data().name,
    //       timestamp: doc.data().timestamp,
    //     });
    //   } else {
    //     //setLoaded(false);
    //   }
    // })
    // .catch((error) => {
    //   console.log(error);
    // });

    // firebase
    //   .database()
    //   .ref(`users/${inQueue}`)
    //   .once('value', (snapshot) => {
    //     setUserStatus({
    //       id: snapshot.val().id,
    //       name: snapshot.val().name,
    //       number: snapshot.ref.key,
    //     });
    //   });

    // Axios.get(
    //   `https://europe-west1-virtual-line.cloudfunctions.net/api/user/${inQueue}`
    // )
    //   .then((res) => {
    //     console.log('user', res.data);
    //     setUserStatus(res.data);
    //   })
    //   .catch((err) => console.log(err));

    // return () => {
    //   history.push('/');
    // };
  }, [inQueue, history, db, cookies]);

  useEffect(() => {
    // Get the first upcoming number in queue
    db.collection('queue')
      .where('status', 'in', ['pending', 'notified'])
      .limit(1)
      .onSnapshot(
        (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            setNextQueue(doc.id);
          });
        },
        (err) => {
          console.log(err);
        }
      );
  }, [nextQueue, db]);

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
    if (queueLength - nextQueue === 10) {
      //update user status to NOTIFIED
      db.collection('queue')
        .doc(inQueue)
        .update({
          status: 'notified',
        })
        .then(() => {
          console.log('user is being notified');
          setLoading(false);
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
            // window.location.reload();
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
      {loading ? (
        <div>
          <Spin />
        </div>
      ) : userStatus.length === 0 ? (
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
              {userStatus.id ? (
                <h2 style={{ fontSize: 50 }}>{`${userStatus.id}`}</h2>
              ) : (
                // {`ADP${userStatus.id}`}
                <h2 style={{ fontSize: 50 }}>{`${inQueue}`}</h2>
                // {`ADP${inQueue}`}
              )}
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title='זמן המתנה משוער'
                    value={(queueLength - nextQueue - 1) * 2}
                    prefix={`'דק`}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title='ממתינים לפניך'
                    value={queueLength - nextQueue - 1}
                    prefix={<UserOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title='אחרונים שנכנסו'
                    value={`${nextQueue}`}
                    className='last-in'
                  />
                  {/* {`ADP${nextQueue}`} */}
                </Col>
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
