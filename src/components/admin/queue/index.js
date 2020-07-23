import React, { useState, useEffect, useContext } from 'react';
// import { useHistory } from 'react-router-dom';
import { FirebaseContext } from '../../../firebase/firebaseConfig';
import 'firebase/firestore';
import './styled.scss';
import dayjs from 'dayjs';
// ant design
import { Table, Tag, Modal } from 'antd';
import { Statistic, Row, Col } from 'antd';
import { Typography, Spin, Divider } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

const { Title } = Typography;

const columns = [
  {
    title: 'פעולה',
    dataIndex: 'actions',
    key: 'actions',
    render: (text, record) => (
      <>
        <a href={`tel:${record.phone}`} style={{ padding: 5 }}>
          טלפון
        </a>
        {` `}
        <a href={`mailto:${record.email}`} style={{ padding: 5 }}>
          מייל
        </a>
      </>
    ),
  },
  // {
  //   title: 'זמני המתנה',
  //   dataIndex: 'timestamp',
  //   key: 'elapsed',
  //   render: (text, record) => (
  //     <>
  //       <Row style={{ justifyContent: 'flex-end' }}>
  //         <Col>
  //           <Tag>
  //             {dayjs(record.timestamp).format('HH:mm')}{' '}
  //             <Typography.Text strong>:כניסה</Typography.Text>
  //           </Tag>
  //         </Col>
  //       </Row>
  //       <Row style={{ justifyContent: 'flex-end' }}>
  //         <Col>
  //           <Tag>
  //             {dayjs(record.timestamp).from(dayjs(), true)}{' '}
  //             <Typography.Text strong>:המתנה</Typography.Text>
  //           </Tag>
  //         </Col>
  //       </Row>
  //     </>
  //   ),
  // },
  {
    title: 'סטטוס',
    dataIndex: 'status',
    key: 'status',
    render: (stat) => (
      <>
        {stat === 'pending' ? (
          <Tag>המתנה</Tag>
        ) : stat === 'notified' ? (
          <Tag color='processing'>נשלח מייל</Tag>
        ) : stat === 'served' ? (
          <Tag color='success'>נכנס</Tag>
        ) : (
          ''
        )}
      </>
    ),
  },
  {
    title: 'מספר',
    dataIndex: 'id',
    key: 'id',
    render: (key) => <b>{key}</b>, //<b>ADP{key}</b>
  },
  {
    title: 'שם',
    dataIndex: 'name',
    key: 'name',
  },
  // {
  //   title: '',
  //   dataIndex: 'avatar',
  //   key: 'avatar',
  //   render: () => (
  //     <Avatar
  //       style={{
  //         color: '#f56a00',
  //         backgroundColor: '#fde3cf',
  //       }}
  //     >
  //       <UserOutlined />
  //     </Avatar>
  //   ),
  // },
];

const Queue = () => {
  const firebase = useContext(FirebaseContext);
  const [usersList, setUsersList] = useState([]);
  const [servedList, setServedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalInQueue, setTotalInQueue] = useState([]);
  const [totalServed, setTotalServed] = useState([]);
  const [lastServed, setLastServed] = useState('');
  // const [nextQueue, setNextQueue] = useState('');

  const db = firebase.firestore();

  useEffect(() => {
    db.collection('queue')
      .where('status', 'in', ['pending', 'notified'])
      .orderBy('timestamp', 'asc')
      .limit(5)
      .onSnapshot(
        (querySnapshot) => {
          const queue = [];
          querySnapshot.forEach((doc) => {
            queue.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          setUsersList(queue);
          setLoading(false);
        },
        (err) => {
          console.log(err);
        }
      );

    // firebase
    //   .database()
    //   .ref('users/')
    //   .orderByChild('status')
    //   .equalTo('pending')
    //   .on('value', (snapshot) => {
    //     snapshot.forEach((child) => {
    //       console.log(child.key, child.val());
    //       queue.push({
    //         id: child.key,
    //         ...child.val(),
    //       });
    //     });
    //   });
    // setUsersList(queue);

    // Axios.get(
    //   'https://europe-west1-virtual-line.cloudfunctions.net/api/user'
    // ).then((result) => {
    //   const queue = result.data
    //     .filter((u) => u.status === 'pending')
    //     .map((user) => {
    //       return user;
    //     });
    //   // setUsersList(
    //   //   queue.sort((a, b) => {
    //   //     const dateA = new Date(a.timestamp);
    //   //     const dateB = new Date(b.timestamp);
    //   //     return dateA - dateB;
    //   //   })
    //   // );
    // });
  }, [loading, db]);

  useEffect(() => {
    db.collection('queue')
      .where('status', '==', 'served')
      .orderBy('timestamp', 'desc')
      .onSnapshot(
        (querySnapshot) => {
          const served = [];
          querySnapshot.forEach((doc) => {
            served.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          setServedList(served);
          setLoading(false);
        },
        (err) => {
          console.log(err);
        }
      );

    //   Axios.get(
    //     'https://europe-west1-virtual-line.cloudfunctions.net/api/user'
    //   ).then((result) => {
    //     const served = result.data
    //       .filter((u) => u.status === 'served')
    //       .map((user) => {
    //         return user;
    //       });
    //     setServedList(served);
    //   });
  }, [loading, db]);

  // useEffect(() => {
  //   // Get total queue size
  //   db.collection('queue')
  //     .where('status', '==', 'pending')
  //     .onSnapshot((querySnapshot) => {
  //       setTotalInQueue(querySnapshot.size);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // }, [totalInQueue]);

  useEffect(() => {
    // Get total queue size
    db.collection('queue')
      .where('status', 'in', ['pending', 'notified'])
      .onSnapshot(
        (querySnapshot) => {
          setTotalInQueue(querySnapshot.size);
        },
        (err) => {
          console.log(err);
        }
      );

    // Get total served size
    db.collection('queue')
      .where('status', '==', 'served')
      .onSnapshot(
        (querySnapshot) => {
          setTotalServed(querySnapshot.size);
        },
        (err) => {
          console.log(err);
        }
      );

    // If i need the first in queue
    // db.collection('queue')
    //   .where('status', 'in', ['pending', 'notified'])
    //   .limit(1)
    //   .get()
    //   .then((doc) => {
    //     doc.forEach((data) => {
    //       setNextQueue(data.id);
    //     });
    //   });

    db.collection('queue')
      .where('status', '==', 'served')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()
      .then((doc) => {
        doc.forEach((data) => {
          setLastServed(data.id);
        });
      });
  }, [db]);

  const handleNext = () => {
    //update user status
    db.collection('queue')
      .doc(usersList[0].id)
      .update({
        status: 'served',
      })
      .then(() => {
        console.log('user moved to served successfully');
        setLoading(false);
      });

    db.collection('queue')
      .where('status', 'in', ['pending', 'notified'])
      .orderBy('timestamp', 'asc')
      .limit(5)
      .onSnapshot(
        (querySnapshot) => {
          const queue = [];
          querySnapshot.forEach((doc) => {
            queue.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          setUsersList(queue);
          setLoading(false);
        },
        (err) => {
          console.log(err);
        }
      );

    db.collection('queue')
      .where('status', '==', 'served')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .onSnapshot(
        (querySnapshot) => {
          const served = [];
          querySnapshot.forEach((doc) => {
            served.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          setServedList(served);
          setLoading(false);
        },
        (err) => {
          console.log(err);
        }
      );

    // Axios.put(
    //   `https://europe-west1-virtual-line.cloudfunctions.net/api/user/${usersList[0].id}`,
    //   {
    //     ...usersList[0],
    //     status: 'served',
    //   }
    // )
    //   .then((res) => {
    //     usersList.slice(0, 1);
    //     setUsersList(usersList.slice(0, 1));
    //     console.log(usersList);
    //     console.log(res.config.data);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
  };

  const handleResetQueue = () => {
    // Open modal
    Modal.confirm({
      title: (
        <div style={{ textAlign: 'right', marginBottom: 10, paddingRight: 30 }}>
          איפוס התור
        </div>
      ),
      icon: <ExclamationCircleOutlined />,
      content: (
        <div style={{ margin: '0 auto', textAlign: 'right' }}>
          <p>?האם את/ה בטוח שאת/ה רוצה לאפס את כל התור</p>
        </div>
      ),
      okText: 'איפוס התור',
      okType: 'danger',
      cancelText: 'חזור',
      onOk() {
        // NEED TO CHANGE TO 'QUEUE' COLLECTION IN PRODUCTION!!!
        db.collection('queue')
          .get()
          .then((querySnapshot) => {
            // Once we get the results, begin a batch
            var batch = db.batch();

            querySnapshot.forEach((doc) => {
              // For each doc, add a delete operation to the batch
              batch.delete(doc.ref);
            });

            // Commit the batch
            return batch.commit();
          })
          .then(function () {
            console.log('Entire Queue Collection deleted successfully.');
          });
      },
      // onCancel() {
      // },
    });
  };

  return (
    <div
      style={{
        margin: '0 auto',
        textAlign: 'center',
        maxWidth: 768,
        paddingTop: 10,
      }}
    >
      {usersList.length === 0 ? (
        <div>
          <Spin />
        </div>
      ) : (
        <>
          <Row gutter={16} type='flex' style={{ margin: '10px 15px' }}>
            <Col span={6} xs={12}>
              <Statistic
                title='סיימו תהליך'
                value={`${totalServed}`}
                style={{ border: '1px solid #999', padding: 5 }}
              />
            </Col>
            <Col span={6} xs={12}>
              <Statistic
                title='נכנס אחרון'
                value={`${lastServed}`} //value={`ADP${lastServed}`}
                style={{ border: '1px solid #999', padding: 5 }}
              />
            </Col>
          </Row>
          <Row gutter={16} type='flex' style={{ margin: '10px 15px' }}>
            <Col span={6} xs={12}>
              <Statistic
                title='זמן המתנה משוער'
                value={`${totalInQueue * 2}`}
                prefix={`'דק`}
                style={{ border: '1px solid #999', padding: 5 }}
              />
            </Col>
            <Col span={6} xs={12}>
              <Statistic
                title='ממתינים בתור'
                value={totalInQueue}
                suffix={`/ ${totalInQueue + totalServed}`}
                style={{ border: '1px solid #999', padding: 5 }}
              />
              <button style={{ marginTop: 16 }} onClick={handleNext}>
                הכנס את הבא
              </button>
            </Col>
          </Row>
          <Divider />
        </>
      )}
      <Title level={3}>ממתינים בתור</Title>
      <Table
        columns={columns}
        dataSource={usersList}
        rowKey='id'
        pagination={false}
        expandable={{
          expandedRowRender: (record) => (
            <>
              <Tag>
                {dayjs(record.timestamp).from(dayjs(), true)}{' '}
                <Typography.Text strong>:המתנה</Typography.Text>
              </Tag>
              <Tag>
                {dayjs(record.timestamp).format('HH:mm')}{' '}
                <Typography.Text strong>:כניסה</Typography.Text>
              </Tag>
            </>
          ),
          rowExpandable: (record) => record.name !== 'Not Expandable',
        }}
        style={{ width: '100%', margin: '0 auto', textAlign: 'right ' }}
      />
      <Divider />
      <Title level={3}>נכנסו</Title>
      <Table
        columns={columns}
        dataSource={servedList}
        rowKey='id'
        pagination={false}
        expandable={{
          expandedRowRender: (record) => (
            <>
              <Tag>
                {dayjs(record.timestamp).from(dayjs(), true)}{' '}
                <Typography.Text strong>:המתנה</Typography.Text>
              </Tag>
              <Tag>
                {dayjs(record.timestamp).format('HH:mm')}{' '}
                <Typography.Text strong>:כניסה</Typography.Text>
              </Tag>
            </>
          ),
          rowExpandable: (record) => record.name !== 'Not Expandable',
        }}
        style={{ width: '100%', margin: '0 auto', textAlign: 'right ' }}
      />
      <br />
      <button onClick={handleResetQueue}>איפוס התור</button>
      <br />
      <br />
    </div>
  );
};

export default Queue;
