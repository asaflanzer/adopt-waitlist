import { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import { FirebaseContext } from '../../firebase/firebaseConfig';
import 'firebase/firestore';
// Cookies
import Cookies from 'universal-cookie';
const cookies = new Cookies();

const useGetUser = () => {
  const firebase = useContext(FirebaseContext);
  const db = firebase.firestore();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState([]);

  useEffect(() => {
    // Get user data
    const fetchData = async () => {
      db.collection('queue')
        .doc(cookies.get('inQueue') || 'not found')
        .onSnapshot(
          (querySnapshot) => {
            if (querySnapshot.exists) {
              setUserStatus({
                id: querySnapshot.id,
                name: querySnapshot.data().name,
                timestamp: querySnapshot.data().timestamp,
                number: querySnapshot.data().number,
              });
              setLoading(false);
            } else {
              setLoading(false);
            }
          },
          (err) => {
            console.log(err);
          }
        );

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
    };

    if (cookies.get('inQueue') !== null) {
      fetchData();
    } else {
      history.push('/');
    }
  }, [history, db]);

  return { loading, userStatus };
};

export default useGetUser;
