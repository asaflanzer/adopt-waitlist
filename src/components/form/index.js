import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { FirebaseContext } from '../../firebase/firebaseConfig';
import 'firebase/firestore';
import './styled.scss';
// ant design
import { Typography } from 'antd';
import { Form, Input, Checkbox } from 'antd';
import { Modal } from 'antd';
// Cookies
import Cookies from 'universal-cookie';
// custom hooks
import useQueue from '../hooks/useQueue';

const { Title } = Typography;

const ContactForm = () => {
  const { queueLength } = useQueue();
  const firebase = useContext(FirebaseContext);
  const [formData, setFormData] = useState([]);
  const [readDoc, setReadDoc] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const history = useHistory();

  const db = firebase.firestore();

  const cookies = new Cookies();

  const updateInput = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    formData.name !== '' && formData.email !== '' && formData.phone !== ''
      ? setDisabled(false)
      : setDisabled(true);
  };

  const handleCheck = () => {
    setReadDoc(!readDoc);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    let generatePad = pad(queueLength + 1, 3);

    // new way
    const batch = db.batch();
    const docRef = db.collection('queue').doc();

    batch.set(docRef, {
      ...formData,
      status: 'pending',
      timestamp: new Date().toISOString(),
      number: generatePad,
    });

    batch.commit().then(() => {
      cookies.set('inQueue', docRef.id, { path: '/' });
      setFormData([]);
      history.push(`/status/${docRef.id}`);
    });

    // old way
    // db.collection('queue')
    //   .add({
    //     ...formData,
    //     status: 'pending',
    //     timestamp: new Date().toISOString(),
    //     number: generatePad,
    //   })
    //   .then(function (docRef) {
    //     cookies.set('inQueue', docRef.id, { path: '/' });
    //     setFormData([]);
    //     history.push(`/status/${docRef.id}`);
    //   })
    //   .catch(function (error) {
    //     console.error('Error adding document: ', error);
    //   });

    // db.collection('queue')
    //   .doc(generatePad)
    //   .set({
    //     ...formData,
    //     status: 'pending',
    //     timestamp: new Date().toISOString(),
    //   })
    //   .then(() => {
    //     cookies.set('inQueue', generatePad, { path: '/' });
    //     // console.log('user joined queue successfully');
    //     //localStorage.setItem('inQueue', generatePad);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
  };

  const pad = (n, width, z) => {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  };

  const info = () => {
    Modal.info({
      title: (
        <div style={{ textAlign: 'right', marginBottom: 10, paddingRight: 30 }}>
          הבהרות בנוגע ליום האימוץ
        </div>
      ),
      content: (
        <div style={{ margin: '0 auto', textAlign: 'right' }}>
          <p>
            - האימוץ יתקיים בנוכחות כל דיירי הבית
            <br /> כולל ילדים וכלבים
          </p>
          <p>
            לא כל הקודם זוכה - אנחנו נדבר עם כולם
            <br />
            ורק כשיסתיים התור יתקבלו החלטות
          </p>
          <p>
            ההמתנה יכולה לקחת זמן ויכול להיות שנחרוג
            <br />
            בשעת הסיום, נשמח שתתאזרו בסבלנות
          </p>
          <p>
            אין חובה להישאר עד תורכם אך יש להגיע
            <br />
            בזמן לפי עדכוני האפליקציה
          </p>
        </div>
      ),
      okText: 'אני מסכים/ה',
      onOk() {
        setReadDoc(true);
      },
    });
  };
  return (
    <div>
      <Form
        onSubmit={handleSubmit}
        style={{
          margin: '0 auto',
          textAlign: 'center',
          maxWidth: 768,
          minWidth: 300,
          paddingTop: 50,
        }}
      >
        <div style={{ margin: '0 auto', textAlign: 'center' }}>
          <Title level={3}>הכנס/י פרטים</Title>
        </div>
        <div style={{ marginTop: 30, textAlign: 'right' }}>
          <Form.Item>
            <Input
              dir='rtl'
              type='text'
              name='name'
              placeholder='שם מלא'
              onChange={updateInput}
              value={formData.name || ''}
            />
          </Form.Item>
          <Form.Item>
            <Input
              dir='rtl'
              type='email'
              name='email'
              placeholder='כתובת מייל לעדכון מיקומך בתור'
              onChange={updateInput}
              value={formData.email || ''}
            />
          </Form.Item>
          <Form.Item>
            <Input
              dir='rtl'
              type='tel'
              pattern='[0-9]*'
              name='phone'
              placeholder='מספר טלפון לעדכונים'
              onChange={updateInput}
              value={formData.phone || ''}
            />
          </Form.Item>
          <Typography.Text>קראתי ואני מסכימ/ה לגבי{` `}</Typography.Text>
          <Typography.Link onClick={info}>ההבהרות ליום אימוץ</Typography.Link>
          {` `}
          <Checkbox
            oname='agreement'
            onChange={handleCheck}
            checked={readDoc}
          />
        </div>

        <button
          type='submit'
          disabled={disabled || !readDoc ? 'disabled' : false}
          onClick={handleSubmit}
        >
          קח/י מספר
        </button>
      </Form>
    </div>
  );
};

export default ContactForm;
