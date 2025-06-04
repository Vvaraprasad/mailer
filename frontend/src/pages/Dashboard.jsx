import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// import jwtDecode from 'jwt-decode'; // fixed import
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast'; // added toast

const Dashboard = () => {
  const navigate = useNavigate();
  const [token] = useState(localStorage.getItem('token'));
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({ name: '', subject: '', body: '' });
  const [platform, setPlatform] = useState('gmail');
  const [smtpSettings, setSmtpSettings] = useState({ email: '', key: '' });
  const [storedSettings, setStoredSettings] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [recipientData, setRecipientData] = useState({});
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!token) return navigate('/login');
    const user = jwtDecode(token);
    setUserId(user.id);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    axios
      .get(
        `${import.meta.env.VITE_API_BASE_URL}/email/templates/user/${user.id}`
      )
      .then((res) => setTemplates(res.data || []))
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load templates');
      });

    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/email/settings/${user.id}`)
      .then((res) => {
        const settings = res.data || {};
        setStoredSettings(settings);
        if (settings[platform]) setSmtpSettings(settings[platform]);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load SMTP settings');
      });
  }, [token, navigate, platform]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateTemplate = () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast.error('Please fill all template fields');
      return;
    }
    axios
      .post(`${import.meta.env.VITE_API_BASE_URL}/email/templates`, {
        ...formData,
        userId,
      })
      .then(() => {
        toast.success('Template created successfully');
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to create template');
      });
  };

  const handleDeleteTemplate = (id) => {
    axios
      .delete(`${import.meta.env.VITE_API_BASE_URL}/email/templates/${id}`)
      .then(() => {
        setTemplates((prev) => prev.filter((t) => t._id !== id));
        toast.success('Template deleted');
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to delete template');
      });
  };

  const handleSettingsUpdate = () => {
    if (!smtpSettings.email || !smtpSettings.key) {
      toast.error('Please enter valid SMTP Email and Key');
      return;
    }
    const payload = {
      smtp: {
        host: smtpSettings.host || 'smtp.gmail.com',
        port: Number(smtpSettings.port) || 587,
        secure: smtpSettings.secure || false,
        auth: {
          user: smtpSettings.email,
          pass: smtpSettings.key,
        },
      },
      parseKeys: ['Name', 'Email', 'Phone'],
      platform,
    };

    axios
      .put(
        `${import.meta.env.VITE_API_BASE_URL}/email/settings/${userId}`,
        payload
      )
      .then(() => toast.success('Settings updated'))
      .catch((err) => {
        console.error(err);
        toast.error('Failed to update settings');
      });
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleBulkSend = () => {
    if (!selectedFile) return toast.error('Please select a file');
    if (!selectedTemplate || !userId || !platform)
      return toast.error('Missing required details');

    const data = new FormData();
    data.append('file', selectedFile);
    data.append('userId', userId);
    data.append('templateId', selectedTemplate);
    data.append('platform', platform);

    axios
      .post(`${import.meta.env.VITE_API_BASE_URL}/email/send-bulk`, data)
      .then((res) => toast.success(res.data.message))
      .catch((err) => {
        console.error(err);
        toast.error('Failed to send bulk emails');
      });
  };

  const handleSingleSend = () => {
    if (!selectedTemplate || !userId)
      return toast.error('Missing required fields');
    if (!recipientData.Name || !recipientData.Email) {
      return toast.error('Please fill recipient Name and Email');
    }
    axios
      .post(`${import.meta.env.VITE_API_BASE_URL}/email/send-single`, {
        userId,
        templateId: selectedTemplate,
        recipient: recipientData,
        platform,
      })
      .then((res) => toast.success(res.data.message))
      .catch((err) => {
        console.error(err);
        toast.error('Failed to send email');
      });
  };

  const selectedTemplateBody =
    templates.find((t) => t._id === selectedTemplate)?.body || '';

  return (
    <div className='p-6 max-w-6xl mx-auto space-y-6'>
      <div className='flex justify-between items-center border-b pb-3'>
        <h1 className='text-3xl font-bold text-gray-800'>
          Bulk Mailer Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded'
        >
          Logout
        </button>
      </div>

      <section className='bg-white p-6 rounded-xl shadow-md space-y-4'>
        <h2 className='text-xl font-semibold text-gray-700'>
          SMTP & Parse Key Settings
        </h2>
        <div className='grid md:grid-cols-4 sm:grid-cols-2 gap-4'>
          <select
            value={platform}
            onChange={(e) => {
              const newPlatform = e.target.value;
              setPlatform(newPlatform);
              setSmtpSettings(
                storedSettings[newPlatform] || { email: '', key: '' }
              );
            }}
            className='border p-2 rounded'
          >
            <option value='gmail'>Gmail</option>
            <option value='outlook'>Outlook</option>
          </select>
          <input
            type='email'
            placeholder='Email'
            value={smtpSettings.email}
            
            onChange={(e) =>
              setSmtpSettings({ ...smtpSettings, email: e.target.value })
            }
            className='border p-2 rounded'
          />
          <input
            type='text'
            placeholder='SMTP/API Key'
            value={smtpSettings.key}
            onChange={(e) =>
              setSmtpSettings({ ...smtpSettings, key: e.target.value })
            }
            className='border p-2 rounded'
          />
          <button
            onClick={handleSettingsUpdate}
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded'
          >
            Save
          </button>
        </div>
      </section>

      <section className='bg-white p-6 rounded-xl shadow-md'>
        <h2 className='text-xl font-semibold text-gray-700 mb-4'>
          Create Email Template
        </h2>
        <input
          type='text'
          placeholder='Template Name'
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className='border p-2 mb-2 w-full rounded'
        />
        <input
          type='text'
          placeholder='Subject'
          value={formData.subject}
          onChange={(e) =>
            setFormData({ ...formData, subject: e.target.value })
          }
          
          className='border p-2 mb-2 w-full rounded'
        />
        <ReactQuill
          value={formData.body}
          onChange={(value) => setFormData({ ...formData, body: value })}
          className='mb-2'
        />
        <button
          onClick={handleCreateTemplate}
          className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded'
        >
          Create Template
        </button>
      </section>

      <section className='bg-white p-6 rounded-xl shadow-md'>
        <h2 className='text-xl font-semibold text-gray-700 mb-4'>
          Saved Templates
        </h2>
        {templates.length === 0 ? (
          <p className='text-gray-500'>No templates found.</p>
        ) : (
          <div className='space-y-4'>
            {templates.map((t) => (
              <div key={t._id} className='border p-4 rounded-md shadow-sm'>
                <div className='flex justify-between items-center'>
                  <div>
                    <h3 className='font-bold text-lg'>{t.name}</h3>
                    <p className='text-sm text-gray-600'>{t.subject}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteTemplate(t._id)}
                    className='text-red-500 hover:text-red-700 text-sm'
                  >
                    Delete
                  </button>
                </div>
                <div
                  className='mt-2 text-sm text-gray-700'
                  dangerouslySetInnerHTML={{ __html: t.body }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className='bg-white p-6 rounded-xl shadow-md'>
        <h2 className='text-xl font-semibold text-gray-700 mb-4'>
          Send Bulk Emails
        </h2>

        <div className='mb-4'>
          <label className='block text-gray-600 mb-1'>Select Template</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className='border p-2 rounded w-full'
          >
            <option value=''>-- Select a Template --</option>
            {templates.map((template) => (
              <option key={template._id} value={template._id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div className='flex items-center gap-4'>
          <input
            type='file'
            onChange={handleFileChange}
            className='border p-2 rounded w-full'
          />
          <button
            onClick={handleBulkSend}
            className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded'
          >
            Send Bulk
          </button>
        </div>
      </section>

      <section className='bg-white p-6 rounded-xl shadow-md'>
        <h2 className='text-xl font-semibold text-gray-700 mb-4'>
          Send Single Email
        </h2>
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className='border p-2 mb-4 w-full rounded'
        >
          <option value=''>Select Template</option>
          {templates.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        {selectedTemplate && (
          <>
            <h3 className='font-semibold text-gray-600 mb-2'>Recipient Info</h3>
            {['Name', 'Email', 'Phone'].map((field) => (
              <input
                key={field}
                type='text'
                placeholder={field}
                value={recipientData[field] || ''}
                onChange={(e) =>
                  setRecipientData({
                    ...recipientData,
                    [field]: e.target.value,
                  })
                }
                className='border p-2 mb-2 w-full rounded'
              />
            ))}

            <h3 className='font-semibold text-gray-600 mb-2'>Email Preview</h3>
            <div
              className='border p-4 bg-gray-50 rounded text-sm'
              dangerouslySetInnerHTML={{ __html: selectedTemplateBody }}
            />

            <button
              onClick={handleSingleSend}
              className='mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded'
            >
              Send Single Email
            </button>
          </>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
