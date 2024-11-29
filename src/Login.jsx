import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #4169e1, #1e3a8a);
`;

const Form = styled(motion.form)`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: left;
  text-align: left;
`;

const Input = styled(motion.input)`
  width: 100%;
  padding: 1rem;
  margin: 0.5rem 0;
  border: 1px solid #4169e1;
  border-radius: 5px;
  font-size: 1rem;
  color: #333;
  background-color: white;
  box-sizing: border-box;
  &:focus {
    outline-color: #1e3a8a;
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  margin: 1rem 0;
  border: none;
  border-radius: 5px;
  background: #4169e1;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background: #1e3a8a;
  }
`;

const Header = styled.h1`
  text-align: center;
  margin-bottom: 1rem;
  color: #4169e1;
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the logged-in user is an admin
      if (email === 'admin@example.com') {
        navigate('/admin-dashboard'); // Navigate to the admin dashboard
      } else {
        navigate('/donation'); // Navigate to the donation page for regular users
      }

      alert('Login successful!');
    } catch (error) {
      alert('Error logging in: ' + error.message);
    }

    // Clear input fields
    setEmail('');
    setPassword('');
  };

  return (
    <Container>
      <Form
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit}
      >
        <Header>Login</Header>
        <label htmlFor="email" style={{ color: '#4169e1' }}>Email</label>
        <Input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          whileFocus={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        />
        <label htmlFor="password" style={{ color: '#4169e1' }}>Password</label>
        <Input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          whileFocus={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        />
        <Button type="submit">Login</Button>
        <Link to="/register" style={{ color: '#4169e1' }}>Don't have an account? Register here</Link>
      </Form>
    </Container>
  );
};

export default Login;
