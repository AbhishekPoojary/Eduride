import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Avatar,
  AvatarBadge,
  IconButton,
  Divider,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge
} from '@chakra-ui/react';
import { FiEdit, FiCamera, FiKey, FiUser, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: user?.phone || '+91 9876543210',
    role: user?.role || 'admin'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleProfileEdit = () => {
    setIsEditing(true);
  };

  const handlePasswordChange = () => {
    setIsChangingPassword(true);
  };

  const handleProfileSave = () => {
    // In a real app, this would be an API call
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setIsEditing(false);
  };

  const handlePasswordSave = () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // In a real app, this would be an API call
    toast({
      title: 'Password updated',
      description: 'Your password has been updated successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handlePasswordDataChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    // Reset form data
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>My Profile</Heading>
      
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab><Box as={FiUser} mr={2} /> Profile Information</Tab>
          <Tab><Box as={FiKey} mr={2} /> Security</Tab>
        </TabList>
        
        <TabPanels mt={4}>
          {/* Profile Information Tab */}
          <TabPanel p={0}>
            <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} shadow="md" mb={6}>
              <CardHeader>
                <HStack spacing={4} align="center">
                  <Avatar 
                    size="xl" 
                    name={profileData.name} 
                    src="https://bit.ly/broken-link"
                  >
                    <AvatarBadge boxSize="1.25em" bg="green.500" border="2px solid white" />
                  </Avatar>
                  <VStack align="start" spacing={1}>
                    <Heading size="md">{profileData.name}</Heading>
                    <Badge colorScheme="blue">{profileData.role.toUpperCase()}</Badge>
                    <Text color="gray.500">{profileData.email}</Text>
                  </VStack>
                  {!isEditing && (
                    <IconButton
                      icon={<FiEdit />}
                      aria-label="Edit profile"
                      variant="ghost"
                      ml="auto"
                      onClick={handleProfileEdit}
                    />
                  )}
                </HStack>
              </CardHeader>
              <CardBody>
                <Divider my={4} />
                
                {isEditing ? (
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Full Name</FormLabel>
                      <Input 
                        name="name" 
                        value={profileData.name} 
                        onChange={handleProfileChange} 
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Email Address</FormLabel>
                      <Input 
                        name="email" 
                        type="email" 
                        value={profileData.email} 
                        onChange={handleProfileChange} 
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Phone Number</FormLabel>
                      <Input 
                        name="phone" 
                        value={profileData.phone} 
                        onChange={handleProfileChange} 
                      />
                    </FormControl>
                    <HStack spacing={4} justify="flex-end" mt={4}>
                      <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                      <Button colorScheme="blue" onClick={handleProfileSave}>Save Changes</Button>
                    </HStack>
                  </VStack>
                ) : (
                  <VStack spacing={4} align="stretch">
                    <HStack>
                      <Text fontWeight="bold" width="150px">Full Name:</Text>
                      <Text>{profileData.name}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="bold" width="150px">Email:</Text>
                      <Text>{profileData.email}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="bold" width="150px">Phone:</Text>
                      <Text>{profileData.phone}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="bold" width="150px">Role:</Text>
                      <Badge colorScheme="blue">{profileData.role.toUpperCase()}</Badge>
                    </HStack>
                  </VStack>
                )}
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Security Tab */}
          <TabPanel p={0}>
            <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} shadow="md">
              <CardHeader>
                <HStack>
                  <Box as={FiShield} fontSize="xl" mr={2} />
                  <Heading size="md">Security Settings</Heading>
                  {!isChangingPassword && (
                    <Button
                      leftIcon={<FiKey />}
                      ml="auto"
                      colorScheme="blue"
                      variant="outline"
                      onClick={handlePasswordChange}
                    >
                      Change Password
                    </Button>
                  )}
                </HStack>
              </CardHeader>
              <CardBody>
                <Divider my={4} />
                
                {isChangingPassword ? (
                  <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                      <FormLabel>Current Password</FormLabel>
                      <Input 
                        name="currentPassword" 
                        type="password" 
                        value={passwordData.currentPassword} 
                        onChange={handlePasswordDataChange} 
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>New Password</FormLabel>
                      <Input 
                        name="newPassword" 
                        type="password" 
                        value={passwordData.newPassword} 
                        onChange={handlePasswordDataChange} 
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Confirm New Password</FormLabel>
                      <Input 
                        name="confirmPassword" 
                        type="password" 
                        value={passwordData.confirmPassword} 
                        onChange={handlePasswordDataChange} 
                      />
                    </FormControl>
                    <HStack spacing={4} justify="flex-end" mt={4}>
                      <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                      <Button colorScheme="blue" onClick={handlePasswordSave}>Update Password</Button>
                    </HStack>
                  </VStack>
                ) : (
                  <VStack spacing={4} align="stretch">
                    <HStack>
                      <Text fontWeight="bold" width="150px">Password:</Text>
                      <Text>u2022u2022u2022u2022u2022u2022u2022u2022</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="bold" width="150px">Last Updated:</Text>
                      <Text>30 days ago</Text>
                    </HStack>
                    <Text color="gray.500" fontSize="sm" mt={2}>
                      It's a good practice to change your password regularly for security reasons.
                    </Text>
                  </VStack>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Profile;
