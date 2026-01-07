import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  useToast,
  Badge,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stack
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Payment = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const startPayment = async () => {
    try {
      const res = await axios.post('/api/stripe/create-checkout-session', {});
      const { url } = res.data;
      if (url) {
        window.location.href = url;
      } else {
        toast({ title: 'Stripe Error', description: 'No checkout URL returned', status: 'error' });
      }
    } catch (e) {
      toast({ title: 'Payment Error', description: e.response?.data?.message || e.message, status: 'error' });
    }
  };

  if (!isAuthenticated) {
    return (
      <Flex minH="50vh" align="center" justify="center"><Text>Please login to pay.</Text></Flex>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={2}>Bus Fee Payment</Heading>
      <Text color="gray.600" mb={6}>Pay securely using Razorpay.</Text>

      <Stack spacing={6}>
        {user?.paymentStatus !== 'paid' && user?.paymentStatus !== 'exempt' && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Payment Pending</AlertTitle>
              <AlertDescription>
                Please clear your bus fee to avoid access being denied at the bus door.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        <VStack align="start" spacing={4} borderWidth="1px" borderRadius="md" p={5}>
          <Box>
            <Text fontWeight="bold">Current Status:</Text>
            <Badge colorScheme={user?.paymentStatus === 'paid' || user?.paymentStatus === 'exempt' ? 'green' : 'orange'}>
              {user?.paymentStatus || 'pending'}
            </Badge>
          </Box>

          <Button colorScheme="blue" onClick={startPayment} isDisabled={user?.paymentStatus === 'paid'}>
            {user?.paymentStatus === 'paid' ? 'Already Paid' : 'Pay Bus Fee (Stripe)'}
          </Button>
        </VStack>

        <Box borderWidth="1px" borderRadius="md" p={5}>
          <Heading size="md" mb={3}>Last Bus Scan</Heading>
          {user?.lastScan?.time ? (
            <VStack align="start" spacing={2}>
              <Badge colorScheme={user.lastScan.doorAction === 'open' ? 'green' : 'red'}>
                {user.lastScan.doorAction === 'open' ? 'Door Unlocked' : 'Door Locked'}
              </Badge>
              <Text><strong>Result:</strong> {user.lastScan.result || 'N/A'}</Text>
              <Text><strong>Bus:</strong> {user.lastScan.busId || 'N/A'}</Text>
              <Text>
                <strong>Time:</strong> {new Date(user.lastScan.time).toLocaleString()}
              </Text>
              <Text color="gray.600">{user.lastScan.message}</Text>
            </VStack>
          ) : (
            <Text color="gray.500">No scans recorded yet.</Text>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default Payment;
