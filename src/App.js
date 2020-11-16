import React, { useRef, useState } from 'react';
import { auth as Auth, firestore as Firestore, initializeApp } from 'firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import 'firebase/firestore';
import 'firebase/auth';

import './App.css';

initializeApp({
  ...{},
});

export const auth = Auth();
const firestore = Firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className='App'>
      <header>{user && <Signout />}</header>
      <section>{user ? <Chat /> : <Signin />}</section>
    </div>
  );
}

function Signin() {
  const sign = () => {
    auth.signInWithPopup(new Auth.GoogleAuthProvider());
  };
  return <button onClick={sign}>Sign with Google</button>;
}

function Signout() {
  return auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>;
}

function Chat() {
  const dummy = useRef();
  const [val, setVal] = useState('');
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const send = async (_) => {
    _.preventDefault();
    const value = val.trim();
    if (!value) {
      return;
    }
    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text: value,
      createdAt: Firestore.FieldValue.serverTimestamp(),
      uid,
      avatar: photoURL,
    });
    setVal('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div>
      <main>
        {messages && messages.map((msg) => <Message key={msg.id} message={msg} />)}
        <div ref={dummy} />
      </main>
      <form onSubmit={send}>
        <input value={val} onChange={(_) => setVal(_.target.value)} placeholder='Message...' />
        <button type='submit'>
          <span role='img' aria-label='send'>
            📮
          </span>
        </button>
      </form>
    </div>
  );
}

function Message({ message: { text, uid, avatar } }) {
  const cls = uid === auth.currentUser.uid ? 's' : 'r';
  return (
    <div className={`m ${cls}`}>
      <img src={avatar} alt='user' />
      <p>{text}</p>
    </div>
  );
}

export default App;
