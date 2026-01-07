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
  Select,
  Flex,
  Image,
  useColorModeValue
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Remove confirmPassword from data sent to API
      const { confirmPassword, ...registerData } = formData;
      
      const result = await register(registerData);
      
      if (result.success) {
        toast({
          title: 'Registration Successful',
          description: 'Welcome to EduRide!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Registration Failed',
          description: result.error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred during registration',
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
        w={{ base: '90%', md: '500px' }}
      >
        <VStack spacing={6} align="center" mb={8}>
          <Flex align="center">
            <Box boxSize="50px" mr={3}>
              <Image src="/logo.png" alt="EduRide Logo" fallbackSrc="https://via.placeholder.com/50?text=ER" />
            </Box>
            <Heading as="h1" size="xl" color="brand.500">
              EduRide
            </Heading>
          </Flex>
          <Text fontSize="lg" color="gray.600">
            Create your account
          </Text>
        </VStack>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl id="name" isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input 
                type="text" 
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </FormControl>
            
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input 
                type="email" 
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </FormControl>
            
            <FormControl id="phone">
              <FormLabel>Phone Number</FormLabel>
              <Input 
                type="tel" 
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </FormControl>
            
            <FormControl id="role" isRequired>
              <FormLabel>Role</FormLabel>
              <Select value={formData.role} id="role" onChange={handleChange}>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="faculty">Faculty</option>
              </Select>
            </FormControl>
            
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input 
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
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
            
            <FormControl id="confirmPassword" isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <Input 
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
              />
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              w="full"
              isLoading={isLoading}
              loadingText="Registering"
              mt={4}
              bg="brand.500"
              _hover={{ bg: 'brand.600' }}
            >
              Register
            </Button>
          </VStack>
        </form>
        
        <Text mt={6} textAlign="center">
          Already have an account?{' '}
          <Link as={RouterLink} to="/login" color="brand.500" fontWeight="medium">
            Login
          </Link>
        </Text>
      </Box>
    </Flex>
  );
};

export default Register;
