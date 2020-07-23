import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { db } from '../../firebase/firebaseConfig';
import './styled.scss';
// import firebase from 'firebase/app';
// ant design
import { Result, Typography, Spin, Divider } from 'antd';
import { Modal, Card } from 'antd';
import { Statistic, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// const useStorage = (storageName) => {
//   const checkStorage = (key) => {
//     const storedData = localStorage.getItem(key);
//     if (!storedData) console.log('Local storage is empty');
//   };

//   useEffect(() => {
//     // when app loaded
//     checkStorage('inQueue');

//     // when storage updated
//     const handler = ({ key }) => checkStorage(key);
//     window.addEventListener('storage', handler);
//     return () => window.removeEventListener('storage', handler);
//   }, []);
// };

const Status = () => {
  const [userStatus, setUserStatus] = useState([]);
  const [queueLength, setQueueLength] = useState();
  const [nextQueue, setNextQueue] = useState();
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  // Get user queue number from localStorage
  const [inQueue, setInQueue] = useState(
    localStorage.getItem('inQueue') || 'none found'
  );

  useEffect(() => {
    // if (inQueue !== null) {

    setTimeout(() => {
      db.collection('queue')
        .doc(localStorage.getItem('inQueue') || '999999')
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
              setInQueue(localStorage.getItem('inQueue'));
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

    return () => {
      //history.push('/');
    };
  }, [history, inQueue]);

  useEffect(() => {
    // Get the first upcoming number in queue
    db.collection('queue')
      .where('status', 'in', ['pending', 'notified'])
      .limit(1)
      .onSnapshot(
        (querySnapshot) => {
          // const queue = [];
          querySnapshot.forEach((doc) => {
            setNextQueue(doc.id);
          });
        },
        (err) => {
          console.log(err);
        }
      );
  }, [nextQueue]);

  useEffect(() => {
    // Get total queue size
    db.collection('queue')
      .where('status', 'in', ['pending', 'notified'])
      .onSnapshot(
        (querySnapshot) => {
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

    // firebase
    //   .database()
    //   .ref('users/')
    //   .once('value', (snapshot) => {
    //     console.log(snapshot.numChildren());
    //     setQueueLength(snapshot.numChildren());
    //   });
  }, [queueLength]);

  useEffect(() => {
    // Once each user reachs number 5 in line, update status and send email via BE function
    console.log(queueLength - nextQueue);
    if (queueLength - nextQueue === 50) {
      // CHANGE TO 10 for PRODUCTION
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
  }, [queueLength, nextQueue, userStatus, inQueue]);

  const handleModal = () => {
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
        console.log('OK');
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  return (
    <div
      style={{
        margin: '50px auto 0',
        textAlign: 'center',
        padding: '0 15px',
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
                  {`${userStatus.name} שלום`}
                  <p>הצרפת בהצלחה לרשימת ההמתנה ליום אימוץ של אדופט</p>
                </div>
              }
              style={{
                width: '95%',
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
                  <Statistic title='הבא בתור' value={`${nextQueue}`} />
                  {/* {`ADP${nextQueue}`} */}
                </Col>
                <Col span={8}>
                  <Statistic
                    title='מזמן המתנה משוער'
                    value={(queueLength - nextQueue - 1) * 3}
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
              </Row>
              <Divider />
              <Typography.Text>
                {userStatus
                  ? dayjs(userStatus.timestamp).format('DD/MM/YYYY HH:mm')
                  : ''}
              </Typography.Text>
              <p>
                ישלח לך הודעה במייל כאשר המספר בתור שלך מתקרב ועליך יהיה לשוב
                לגינת האימוץ
              </p>
              <Link to='/' onClick={handleModal}>
                ביטול התור
              </Link>
              {/* <Modal
              title='Title'
              visible={visible}
              onOk={this.handleOk}
              confirmLoading={confirmLoading}
              onCancel={this.handleCancel}
            >
              <p>{ModalText}</p>
            </Modal> */}
            </Card>
          </>
        )
      )}
    </div>
  );
};

export default Status;
