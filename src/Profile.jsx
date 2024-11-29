import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  padding: 2rem;
`;

const Form = styled.form`
  background: white;
  padding: 4rem;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  background-color: white; /* Ensure the background is white */
  color: #333; /* Text color */
  box-sizing: border-box;
  &:focus {
    outline-color: #1e3a8a; /* Royal Blue outline on focus */
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 1rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  resize: vertical;
  background-color: white; /* Set background to white */
  color: #333; /* Text color */
  box-sizing: border-box;
  &:focus {
    outline-color: #1e3a8a; /* Royal Blue outline on focus */
  }
`;


const Button = styled.button`
  width: 100%;
  padding: 1rem;
  margin: 1rem 0;
  border: none;
  border-radius: 5px;
  background: #1e3a8a;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background: #3b82f6;
  }
`;

const BackButton = styled(Button)`
  background: #2563eb;
  width: auto;
  margin-top: 2rem;
  &:hover {
    background: #3b82f6;
  }
`;

const Title = styled.h1`
  color: white;
  margin-bottom: 2rem;
`;

const Error = styled.p`
  color: red;
  font-size: 0.9rem;
`;

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    mobileNumber: '',
    gender: '',
    maritalStatus: '',
    email: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(firestore, `users/${user.uid}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'email') {
      validateEmail(value);
    }
  };

  const validateEmail = (email) => {
    if (!email.endsWith('@gmail.com')) {
      setEmailError('Email must end with @gmail.com');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user && !emailError) {
      const docRef = doc(firestore, `users/${user.uid}`);
      await updateDoc(docRef, formData);
      alert('Profile updated successfully!');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Title>Profile</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />
        <Input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
        />
        <Input
          type="tel"
          name="mobileNumber"
          placeholder="Mobile Number"
          value={formData.mobileNumber}
          onChange={handleChange}
        />

        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          disabled
        />
        {emailError && <Error>{emailError}</Error>}

        <Textarea
          name="address"
          placeholder="Address"
          rows="4"
          value={formData.address}
          onChange={handleChange}
        />

        <Button type="submit">Update Profile</Button>
      </Form>

      {/* Blue Back Button to redirect to the Donation page */}
      <BackButton onClick={() => navigate('/donation')}>Back to Donations</BackButton>
    </Container>
  );
};

export default Profile;
