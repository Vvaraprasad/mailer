import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Templates() {
  const [templates, setTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({ subject: '', body: '' });

  const loadTemplates = async () => {
    const res = await axios.get('http://localhost:5000/api/template', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setTemplates(res.data);
  };

  const createTemplate = async () => {
    await axios.post('http://localhost:5000/api/template', newTemplate, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setNewTemplate({ subject: '', body: '' });
    loadTemplates();
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div className='p-6'>
      <h2 className='text-xl font-bold mb-4'>Manage Templates</h2>
      <input
        type='text'
        placeholder='Subject'
        value={newTemplate.subject}
        onChange={(e) =>
          setNewTemplate({ ...newTemplate, subject: e.target.value })
        }
        className='input input-bordered w-full mb-2'
      />
      <textarea
        placeholder='Body'
        value={newTemplate.body}
        onChange={(e) =>
          setNewTemplate({ ...newTemplate, body: e.target.value })
        }
        className='textarea textarea-bordered w-full mb-2'
      />
      <button onClick={createTemplate} className='btn btn-success'>
        Save Template
      </button>

      <div className='mt-6'>
        {templates.map((t) => (
          <div key={t._id} className='border p-4 mb-2'>
            <h3 className='font-bold'>{t.subject}</h3>
            <p>{t.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Templates;