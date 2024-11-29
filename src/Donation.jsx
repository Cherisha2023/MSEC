import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faBank, faMobileAlt } from '@fortawesome/free-solid-svg-icons';
import GooglePayButton from '@google-pay/button-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #1e3a8a; /* Royal Blue Background */
  min-height: 100vh;
  padding-top: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  padding: 1rem;
  background-color: #1e3a8a; /* Royal Blue Navbar Background */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
`;

const LogoutButton = styled.button`
  background-color: #2563eb; /* Slightly lighter blue for contrast */
  border: none;
  color: white;
  font-weight: bold;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-left: 1rem;
  transition: background-color 0.3s;
  &:hover {
    background-color: #3b82f6; /* Lighter shade on hover */
  }
`;


const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  margin-top: 5rem;
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


const Button = styled.button`
  width: 100%;
  padding: 1rem;
  margin: 1rem 0;
  border: none;
  border-radius: 5px;
  background: #1e3a8a; /* Royal Blue Button */
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
  &:hover {
    background: #3b82f6;
  }
`;

const PaymentModes = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin: 1rem 0;
`;

const PaymentOption = styled.div`
  text-align: center;
  cursor: pointer;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 30%;
  background: ${({ selected }) => (selected ? '#3b82f6' : 'white')};
  color: ${({ selected }) => (selected ? 'white' : 'black')};
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background 0.3s;
  &:hover {
    background: ${({ selected }) => (selected ? '#2563eb' : '#f1f5f9')};
  }
`;

const Icon = styled(FontAwesomeIcon)`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const Donation = () => {
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    navigate('/login');
  }

  const selectPaymentMode = (mode) => setPaymentMode(mode);

  const handleLogout = () => {
    auth.signOut().then(() => {
      alert('You have been logged out.');
      navigate('/');
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount === '') {
      alert('Please enter the amount');
      return;
    }

    if (paymentMode === '') {
      alert('Please select a payment mode');
      return;
    }

    if (paymentMode === 'card' || paymentMode === 'netbanking') {
      const options = {
        key: 'rzp_test_XdJ18xJhFvpuOD',
        amount: amount * 100,
        currency: 'INR',
        name: 'non-profit',
        handler: async (response) => {
          alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
          const db = getFirestore();
          await addDoc(collection(db, 'donations'), {
            donorName: user.displayName || 'Anonymous',
            amount: parseInt(amount, 10),
            paymentMode,
            date: new Date(),
            paymentId: response.razorpay_payment_id,
          });
          navigate('/payment-success', { state: { amount, paymentMode } });
        },
        prefill: {
          name: user.displayName || 'Anonymous',
          email: user.email || '',
        },
        theme: { color: '#1e3a8a' },
      };
      const pay = new window.Razorpay(options);
      pay.open();
    }
  };

  return (
    <Container>
      <Header>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </Header>
      <Form onSubmit={handleSubmit}>
        <h1 style={{ color: '#1e3a8a' }}>Donate</h1>
        <label htmlFor="amount">Select Amount:</label>
        <Input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
        />
        <PaymentModes>
          <PaymentOption selected={paymentMode === 'netbanking'} onClick={() => selectPaymentMode('netbanking')}>
            <Icon icon={faBank} />
            Netbanking
          </PaymentOption>
          <PaymentOption selected={paymentMode === 'upi'} onClick={() => selectPaymentMode('upi')}>
            <Icon icon={faMobileAlt} />
            UPI (Google Pay)
          </PaymentOption>
          <PaymentOption selected={paymentMode === 'card'} onClick={() => selectPaymentMode('card')}>
            <Icon icon={faCreditCard} />
            Card
          </PaymentOption>
        </PaymentModes>

        {paymentMode === 'upi' && (
          <GooglePayButton
            environment="TEST"
            paymentRequest={{
              apiVersion: 2,
              apiVersionMinor: 0,
              allowedPaymentMethods: [
                {
                  type: 'CARD',
                  parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['MASTERCARD', 'VISA'],
                  },
                  tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: { gateway: 'example', gatewayMerchantId: 'exampleMerchantId' },
                  },
                },
              ],
              merchantInfo: { merchantId: '12345678901234567890', merchantName: 'Demo Merchant' },
              transactionInfo: { totalPriceStatus: 'FINAL', totalPrice: amount, currencyCode: 'INR' },
            }}
            onLoadPaymentData={(paymentData) => {
              alert('Payment successful via Google Pay!');
              navigate('/payment-success', { state: { amount, paymentMode: 'UPI' } });
            }}
            buttonColor="black"
            buttonType="buy"
          />
        )}

        <Button type="submit">Donate</Button>
      </Form>
    </Container>
  );
};

export default Donation;
