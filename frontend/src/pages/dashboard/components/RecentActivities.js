import React from 'react';
import {
  VStack,
  Box,
  Text,
  Flex,
  Icon,
  Avatar,
  Badge,
  Divider,
  Skeleton,
  SkeletonCircle,
  useColorModeValue
} from '@chakra-ui/react';
import { FiTruck, FiUser, FiClock, FiAlertCircle } from 'react-icons/fi';

const RecentActivities = ({ isLoading }) => {
  // Mock data for recent activities
  const activities = [
    {
      id: 1,
      type: 'entry',
      student: 'Rahul Sharma',
      busId: 'BUS001',
      time: '08:32 AM',
      timestamp: '10 mins ago'
    },
    {
      id: 2,
      type: 'exit',
      student: 'Priya Patel',
      busId: 'BUS002',
      time: '08:45 AM',
      timestamp: '15 mins ago'
    },
    {
      id: 3,
      type: 'entry',
      student: 'Amit Kumar',
      busId: 'BUS001',
      time: '08:50 AM',
      timestamp: '20 mins ago'
    },
    {
      id: 4,
      type: 'alert',
      message: 'Bus #BUS003 delayed by 15 minutes',
      timestamp: '25 mins ago'
    },
    {
      id: 5,
      type: 'entry',
      student: 'Sneha Reddy',
      busId: 'BUS002',
      time: '09:05 AM',
      timestamp: '30 mins ago'
    },
    {
      id: 6,
      type: 'exit',
      student: 'Vikram Singh',
      busId: 'BUS001',
      time: '09:10 AM',
      timestamp: '35 mins ago'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'entry':
        return { icon: FiUser, color: 'green.500' };
      case 'exit':
        return { icon: FiUser, color: 'red.500' };
      case 'alert':
        return { icon: FiAlertCircle, color: 'orange.500' };
      default:
        return { icon: FiClock, color: 'blue.500' };
    }
  };

  const getActivityBadge = (type) => {
    switch (type) {
      case 'entry':
        return { text: 'Entry', colorScheme: 'green' };
      case 'exit':
        return { text: 'Exit', colorScheme: 'red' };
      case 'alert':
        return { text: 'Alert', colorScheme: 'orange' };
      default:
        return { text: 'Info', colorScheme: 'blue' };
    }
  };

  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <VStack spacing={0} align="stretch" maxH="500px" overflowY="auto" pr={2}>
      {isLoading ? (
        // Loading skeletons
        Array(5).fill(0).map((_, index) => (
          <Box key={index}>
            <Flex py={3}>
              <SkeletonCircle size="10" mr={3} />
              <Box flex="1">
                <Skeleton height="20px" mb={2} width="80%" />
                <Skeleton height="15px" width="60%" />
              </Box>
            </Flex>
            {index < 4 && <Divider />}
          </Box>
        ))
      ) : (
        // Actual activities
        activities.map((activity, index) => {
          const { icon, color } = getActivityIcon(activity.type);
          const badge = getActivityBadge(activity.type);
          
          return (
            <Box key={activity.id}>
              <Flex py={3}>
                <Flex
                  w="40px"
                  h="40px"
                  borderRadius="full"
                  bg={`${color}20`}
                  align="center"
                  justify="center"
                  mr={3}
                  flexShrink={0}
                >
                  <Icon as={icon} color={color} boxSize={5} />
                </Flex>
                
                <Box flex="1">
                  {activity.type === 'alert' ? (
                    <Text fontWeight="medium" mb={1}>{activity.message}</Text>
                  ) : (
                    <Flex align="center" mb={1}>
                      <Text fontWeight="medium" mr={2}>{activity.student}</Text>
                      <Badge colorScheme={badge.colorScheme} fontSize="xs">
                        {badge.text}
                      </Badge>
                    </Flex>
                  )}
                  
                  <Flex fontSize="sm" color="gray.500" align="center">
                    {activity.type !== 'alert' && (
                      <>
                        <Icon as={FiTruck} mr={1} />
                        <Text mr={2}>{activity.busId}</Text>
                        <Icon as={FiClock} mr={1} />
                        <Text mr={2}>{activity.time}</Text>
                      </>
                    )}
                    <Text>{activity.timestamp}</Text>
                  </Flex>
                </Box>
              </Flex>
              {index < activities.length - 1 && <Divider />}
            </Box>
          );
        })
      )}
    </VStack>
  );
};

export default RecentActivities;
