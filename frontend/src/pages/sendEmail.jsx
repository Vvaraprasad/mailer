import React, { useState } from 'react';
import axios from 'axios';

function SendEmail() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = async () => {
    await axios.post(
      'http://localhost:5000/api/email/send-single',
      { to: email, subject, body },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    alert('Email sent!');
  };

  return (
    <div className='p-6'>
      <h2 className='text-xl font-bold mb-4'>Send Single Email</h2>
      <input
        type='email'
        placeholder='To'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className='input input-bordered w-full mb-2'
      />
      <input
        type='text'
        placeholder='Subject'
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className='input input-bordered w-full mb-2'
      />
      <textarea
        placeholder='Body'
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className='textarea textarea-bordered w-full mb-2'
      />
      <button onClick={handleSend} className='btn btn-primary'>
        Send Email
      </button>
    </div>
  );
}

export default SendEmail;
