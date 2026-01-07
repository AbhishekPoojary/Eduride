import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Flex,
  Image,
  useColorModeValue
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const sanitizedEmail = (email || '').trim().toLowerCase();
      const result = await login(sanitizedEmail, password);
      
      if (result.success) {
        toast({
          title: 'Login Successful',
          description: 'Welcome to EduRide!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: result.error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred during login',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box
        bg={bgColor}
        p={8}
        rounded="lg"
        shadow="lg"
        borderWidth="1px"
        borderColor={borderColor}
        w={{ base: '90%', md: '450px' }}
      >
        <VStack spacing={4} align="center" mb={8}>
          <Image src="/mite_logo.png" alt="MITE Logo" boxSize="120px" objectFit="contain" fallbackSrc="https://via.placeholder.com/120?text=MITE" />
          <Heading as="h2" size="md" color={useColorModeValue('gray.700', 'gray.300')}>
            MITE - Invent Solutions
          </Heading>
          <Heading as="h1" size="xl" color="brand.500" mt={2}>
            EduRide
          </Heading>
          <Text fontSize="lg" color="gray.600">
            College Bus Tracking System
          </Text>
        </VStack>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </FormControl>
            
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    icon={showPassword ? <FiEyeOff /> : <FiEye />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              w="full"
              isLoading={isLoading}
              loadingText="Logging in"
              mt={4}
              bg="brand.500"
              _hover={{ bg: 'brand.600' }}
            >
              Login
            </Button>
          </VStack>
        </form>
        
        <Text mt={6} textAlign="center">
          Don't have an account?{' '}
          <Link as={RouterLink} to="/register" color="brand.500" fontWeight="medium">
            Register
          </Link>
        </Text>
      </Box>
    </Flex>
  );
};

export default Login;
