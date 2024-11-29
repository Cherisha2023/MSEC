import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore, storage } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

const royalBlue = '#4169e1'; // Royal blue color

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  background: #4169e1;  /* Solid Royal Blue Background */
  color: white; /* Text color white for better contrast */
`;


const NoteBox = styled.div`
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  text-align: center;
`;

const Form = styled(motion.form)`
  background: white;
  padding: 4rem;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  width: 70%;
  max-width: 1000px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  text-align: left;
  margin: 1rem auto;
`;

const Input = styled(motion.input)`
  width: 100%;
  padding: 1rem;
  margin: 0.5rem 0;
  border: 1px solid ${royalBlue};
  border-radius: 5px;
  font-size: 1rem;
  color: #333;
  background-color: white;
  &:focus {
    outline-color: ${royalBlue};
  }
`;

const Select = styled(motion.select)`
  width: 100%;
  padding: 1rem;
  margin: 0.5rem 0;
  border: 1px solid ${royalBlue};
  border-radius: 5px;
  font-size: 1rem;
  color: #333;
  background-color: white;
  &:focus {
    outline-color: ${royalBlue};
  }
`;

const Label = styled.label`
  display: block;
  margin: 0.5rem 0 0.2rem 0;
  font-size: 1rem;
  color: ${royalBlue};
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  margin: 1rem 0;
  border: none;
  border-radius: 5px;
  background: ${royalBlue};
  color: white;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background: #1e3a8a; /* Darker shade of royal blue on hover */
  }
  &:disabled {
    background: #a0c4f3; /* Lighter royal blue when disabled */
  }
`;

const ImagePreview = styled.img`
  margin: 1rem 0;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
`;

const Header = styled.h1`
  text-align: center;
  margin-bottom: 1rem;
  color: ${royalBlue};
`;

const LoginLink = styled(Link)`
  display: block;
  margin-top: 1rem;
  color: ${royalBlue};
  text-decoration: none;
  font-size: 1rem;
  &:hover {
    text-decoration: underline;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  margin: 0.5rem 0;
  border: 1px solid ${royalBlue};
  border-radius: 5px;
  font-size: 1rem;
  resize: vertical;
  background-color: white;
  &:focus {
    outline-color: ${royalBlue};
  }
`;

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    mobileNumber: '',
    gender: '',
    ageGroup: '',
    maritalStatus: '',
    profileImage: null,
    email: '',
    newPassword: '',
    confirmNewPassword: '',
    address: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
    });
    setFormData({ ...formData, profileImage: compressedFile });
    setImagePreview(URL.createObjectURL(compressedFile));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Required Field Validation
    for (const key in formData) {
      if (formData[key] === '' && key !== 'profileImage') {
        alert(`Please fill out the ${key} field.`);
        setLoading(false);
        return;
      }
    }

    // Email Format Validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      alert('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // Password Strength Validation
    if (formData.newPassword.length < 8) {
      alert('Password should be at least 8 characters long.');
      setLoading(false);
      return;
    }

    // Mobile Number Format Validation
    const mobilePattern = /^\d{10}$/;
    if (!mobilePattern.test(formData.mobileNumber)) {
      alert('Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }

    // Password Match Validation
    if (formData.newPassword !== formData.confirmNewPassword) {
      alert('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.newPassword);
      const user = userCredential.user;

      // Upload the profile image and get the URL
      let profileImageUrl = null;
      if (formData.profileImage) {
        const imageRef = ref(storage, `profileImages/${user.uid}/${formData.profileImage.name}`);
        const snapshot = await uploadBytes(imageRef, formData.profileImage);
        profileImageUrl = await getDownloadURL(snapshot.ref);
      }

      // Store user details in Firestore
      await setDoc(doc(firestore, `users/${user.uid}`), {
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        mobileNumber: formData.mobileNumber,
        gender: formData.gender,
        ageGroup: formData.ageGroup,
        maritalStatus: formData.maritalStatus,
        profileImage: profileImageUrl,
        email: formData.email,
        address: formData.address,
      });

      alert('Registration successful!');
      navigate('/login'); // Navigate to login page after successful registration
    } catch (error) {
      console.error('Error registering:', error);
      alert('Error registering: ' + error.message);
    }

    // Reset form state
    setFormData({
      name: '',
      dateOfBirth: '',
      mobileNumber: '',
      gender: '',
      ageGroup: '',
      maritalStatus: '',
      profileImage: null,
      email: '',
      newPassword: '',
      confirmNewPassword: '',
      address: '',
    });
    setImagePreview(null);
    setLoading(false);
  };

  return (
    <Container>
      <Header>Register </Header>
      {/* Note Box */}
      <NoteBox>
        <p>Are you registering as an organization? <Link to="/organization-registration">Click here</Link> to register your organization.</p>
      </NoteBox>

      {/* User Registration Form */}
      <Form
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit}
      >
        {/* Left Grid Column */}
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            name="name"
            placeholder="Name"
            required
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            value={formData.name}
            onChange={handleChange}
          />
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            type="date"
            name="dateOfBirth"
            required
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
          <Label htmlFor="mobileNumber">Mobile Number</Label>
          <Input
            type="text"
            name="mobileNumber"
            placeholder="Mobile Number"
            required
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            value={formData.mobileNumber}
            onChange={handleChange}
          />
          <Label htmlFor="gender">Gender</Label>
          <Select
            name="gender"
            required
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Select>
          <Label htmlFor="ageGroup">Age Group</Label>
          <Select
            name="ageGroup"
            required
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            value={formData.ageGroup}
            onChange={handleChange}
          >
            <option value="">Select Age Group</option>
            <option value="18-25">18-25</option>
            <option value="26-35">26-35</option>
            <option value="36-45">36-45</option>
            <option value="46-60">46-60</option>
            <option value="60+">60+</option>
          </Select>
          <Label htmlFor="maritalStatus">Marital Status</Label>
          <Select
            name="maritalStatus"
            required
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            value={formData.maritalStatus}
            onChange={handleChange}
          >
            <option value="">Select Marital Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </Select>
        </div>

        {/* Right Grid Column */}
        <div>
          <Label htmlFor="profileImage">Profile Image</Label>
          <Input
            type="file"
            name="profileImage"
            accept="image/*"
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            onChange={handleImageChange}
          />
          {imagePreview && <ImagePreview src={imagePreview} alt="Profile Preview" />}
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            name="email"
            placeholder="Email"
            required
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            value={formData.email}
            onChange={handleChange}
          />
          <Label htmlFor="newPassword">Password</Label>
          <Input
            type="password"
            name="newPassword"
            placeholder="Password"
            required
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            value={formData.newPassword}
            onChange={handleChange}
          />
          <Label htmlFor="confirmNewPassword">Confirm Password</Label>
          <Input
            type="password"
            name="confirmNewPassword"
            placeholder="Confirm Password"
            required
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            value={formData.confirmNewPassword}
            onChange={handleChange}
          />
          <Label htmlFor="address">Address</Label>
          <TextArea
            name="address"
            placeholder="Address"
            required
            value={formData.address}
            onChange={handleChange}
          />
          <Button
            type="submit"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
          <LoginLink to="/">Already have an account? Login here.</LoginLink>
        </div>
      </Form>
    </Container>
  );
};

export default Register;
