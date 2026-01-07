import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  IconButton,
  Button,
  Divider,
  useColorModeValue,
  Avatar,
  Flex,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody
} from '@chakra-ui/react';
import { FiBell, FiMoreVertical, FiCheck, FiTrash2, FiFilter } from 'react-icons/fi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  // Mock notification data
  const mockNotifications = [
    {
      _id: 'notif1',
      title: 'Bus BUS001 is running late',
      message: 'North Campus Express is running 15 minutes late due to traffic.',
      type: 'alert',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      sender: {
        name: 'System',
        avatar: null
      }
    },
    {
      _id: 'notif2',
      title: 'Student Attendance',
      message: 'Rahul Sharma has boarded the bus.',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
      sender: {
        name: 'System',
        avatar: null
      }
    },
    {
      _id: 'notif3',
      title: 'Route Change',
      message: 'Bus route for BUS002 has been temporarily changed due to road construction.',
      type: 'important',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: false,
      sender: {
        name: 'Dr. Anil Kumar',
        avatar: null
      }
    },
    {
      _id: 'notif4',
      title: 'Payment Reminder',
      message: 'Please complete the pending transportation fee payment for this semester.',
      type: 'reminder',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      read: false,
      sender: {
        name: 'Admin',
        avatar: null
      }
    },
    {
      _id: 'notif5',
      title: 'System Maintenance',
      message: 'The system will be under maintenance from 2 AM to 4 AM tomorrow.',
      type: 'system',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      read: true,
      sender: {
        name: 'System Admin',
        avatar: null
      }
    }
  ];

  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll use mock data
    setNotifications(mockNotifications);
  }, []);

  const handleMarkAsRead = (notificationId) => {
    setNotifications(notifications.map(notif => 
      notif._id === notificationId ? { ...notif, read: true } : notif
    ));
    toast({
      title: 'Notification marked as read',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(notifications.filter(notif => notif._id !== notificationId));
    toast({
      title: 'Notification deleted',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    toast({
      title: 'All notifications marked as read',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast({
      title: 'All notifications cleared',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const getNotificationTypeColor = (type) => {
    switch(type) {
      case 'alert': return 'red';
      case 'important': return 'orange';
      case 'info': return 'blue';
      case 'reminder': return 'purple';
      case 'system': return 'gray';
      default: return 'blue';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const filteredNotifications = activeTab === 0 
    ? notifications 
    : activeTab === 1 
      ? notifications.filter(notif => !notif.read) 
      : notifications.filter(notif => notif.read);

  return (
    <Box p={4}>
      <Flex align="center" mb={6}>
        <Heading size="lg">Notifications</Heading>
        <Spacer />
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FiFilter />}
            variant="ghost"
            aria-label="Filter notifications"
            mr={2}
          />
          <MenuList>
            <MenuItem onClick={handleMarkAllAsRead}>Mark all as read</MenuItem>
            <MenuItem onClick={handleClearAll}>Clear all notifications</MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      <Tabs colorScheme="blue" onChange={(index) => setActiveTab(index)}>
        <TabList mb={4}>
          <Tab>All ({notifications.length})</Tab>
          <Tab>Unread ({notifications.filter(n => !n.read).length})</Tab>
          <Tab>Read ({notifications.filter(n => n.read).length})</Tab>
        </TabList>

        <TabPanels>
          {[0, 1, 2].map((tabIndex) => (
            <TabPanel key={tabIndex} p={0}>
              {filteredNotifications.length > 0 ? (
                <VStack spacing={4} align="stretch">
                  {filteredNotifications.map((notification) => (
                    <Card 
                      key={notification._id} 
                      bg={notification.read ? cardBg : hoverBg}
                      borderWidth="1px" 
                      borderColor={borderColor}
                      borderLeft="4px solid"
                      borderLeftColor={`${getNotificationTypeColor(notification.type)}.500`}
                      shadow="sm"
                      _hover={{ shadow: 'md' }}
                    >
                      <CardBody>
                        <Flex>
                          <Avatar 
                            size="sm" 
                            name={notification.sender.name} 
                            src={notification.sender.avatar} 
                            mr={3} 
                          />
                          <Box flex="1">
                            <HStack mb={1}>
                              <Heading size="sm">{notification.title}</Heading>
                              {!notification.read && (
                                <Badge colorScheme="red" variant="solid" fontSize="xs">
                                  New
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="sm" mb={2}>{notification.message}</Text>
                            <HStack>
                              <Text fontSize="xs" color="gray.500">
                                {formatTimestamp(notification.timestamp)}
                              </Text>
                              <Badge colorScheme={getNotificationTypeColor(notification.type)} variant="subtle">
                                {notification.type.toUpperCase()}
                              </Badge>
                            </HStack>
                          </Box>
                          <HStack spacing={1}>
                            {!notification.read && (
                              <IconButton
                                icon={<FiCheck />}
                                aria-label="Mark as read"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkAsRead(notification._id)}
                              />
                            )}
                            <IconButton
                              icon={<FiTrash2 />}
                              aria-label="Delete notification"
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDeleteNotification(notification._id)}
                            />
                          </HStack>
                        </Flex>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              ) : (
                <Box textAlign="center" py={10}>
                  <Box as={FiBell} fontSize="3xl" mb={3} opacity={0.5} />
                  <Text fontSize="lg" fontWeight="medium">No notifications</Text>
                  <Text color="gray.500">You're all caught up!</Text>
                </Box>
              )}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Notifications;
