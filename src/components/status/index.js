import React, { useEffect, useContext } from 'react';
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
// custom hooks
import useQueue from '../hooks/useQueue';
import useGetUser from '../hooks/useGetUser';
// Cookies
import Cookies from 'universal-cookie';
const cookies = new Cookies();

const Status = () => {
  const { queueLength, nextQueue, lastServed } = useQueue();
  const { loading, userStatus } = useGetUser();
  const firebase = useContext(FirebaseContext);
  const db = firebase.firestore();
  const history = useHistory();

  useEffect(() => {
    // Once each user reachs number 10 in line, update status and send email via BE function
    if (queueLength === 10) {
      //update user status to NOTIFIED
      db.collection('queue')
        .doc(cookies.get('inQueue'))
        .update({
          status: 'notified',
        })
        .then(() => {
          console.log('user is being notified');
        });
    }
  }, [queueLength, db]);

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
      {loading === true ? (
        <div>
          <Spin />
        </div>
      ) : cookies.get('inQueue') === undefined ? (
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
              {userStatus.number && (
                <h2 style={{ fontSize: 50 }}>{`${userStatus.number}`}</h2>
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
