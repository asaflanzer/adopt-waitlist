import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FirebaseContext } from '../../firebase/firebaseConfig';
import 'firebase/firestore';
import './styled.scss';
// ant design
import { Result, Typography, Spin, Divider } from 'antd';
import { Modal, Card } from 'antd';
import { Statistic, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const Status = () => {
  const firebase = useContext(FirebaseContext);
  const [userStatus, setUserStatus] = useState([]);
  const [queueLength, setQueueLength] = useState();
  const [nextQueue, setNextQueue] = useState();
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const db = firebase.firestore();

  // Get user queue number from localStorage
  const [inQueue, setInQueue] = useState(
    localStorage.getItem('inQueue') || 'none found'
  );

  if (inQueue === null) {
    history.push('/');
  }

  useEffect(() => {
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

    // return () => {
    //   history.push('/');
    // };
  }, [inQueue, db]);

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
            localStorage.removeItem('inQueue');
            window.location.reload();
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
        margin: '0 auto',
        textAlign: 'center',
        padding: '50 15px 0',
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
