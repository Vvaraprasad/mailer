import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );
      setUserId(res.data.userId);
      setShowOtp(true);
      setResendMsg('OTP sent to your email.');
      toast.success('OTP sent to your email.'); 
    } catch (err) {
      toast.error('Invalid credentials or error sending OTP.'); 
    }
  };

  const handleVerify = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-otp`,
        {
          userId,
          otp,
        }
      );
      localStorage.setItem('token', res.data.token);
      toast.success('Login successful'); 
      navigate('/dashboard');
    } catch (err) {
      toast.error('OTP verification failed.'); 
    }
  };

  const resendOtp = () => {
    handleSendOtp();
  };

  return (
    <div className='flex items-center justify-center h-screen bg-gray-100'>
      <div className='bg-white p-8 rounded shadow-md w-96'>
        <h2 className='text-2xl font-semibold mb-4'>Login</h2>
        <input
          className='input mb-2'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Email'
        />
        <input
          type='password'
          className='input mb-2'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Password'
        />
        {!showOtp ? (
          <>
            <button onClick={handleSendOtp} className='btn'>
              Send OTP
            </button>
            <p className='mt-2 text-sm'>
              Don't have an account?{' '}
              <Link to='/register' className='text-blue-500'>
                Register
              </Link>
            </p>
          </>
        ) : (
          <>
            <input
              className='input mb-2 mt-2'
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder='Enter OTP'
            />
            <button onClick={handleVerify} className='btn'>
              Verify
            </button>
            <button onClick={resendOtp} className='text-sm text-blue-600 mt-2'>
              Resend OTP
            </button>
            <p className='text-green-500 text-sm mt-1'>{resendMsg}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
