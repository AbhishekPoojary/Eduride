import React from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Card,
  CardBody,
  Flex,
  Image,
  Skeleton
} from '@chakra-ui/react';
import { FiTruck, FiUsers, FiUserCheck, FiUserPlus, FiMapPin, FiTrendingUp } from 'react-icons/fi';
import AdminStatCard from '../../components/AdminStatCard';

const AdminDashboard = () => {
  const cardBg = useColorModeValue('white', 'gray.800');

  const stats = [
    {
      label: 'Total Buses',
      value: '12',
      icon: FiTruck,
      color: 'blue',
      helpText: 'Overall fleet size'
    },
    {
      label: 'Active Buses',
      value: '8',
      icon: FiMapPin,
      color: 'teal',
      helpText: 'Currently operational'
    },
    {
      label: 'Total Students',
      value: '450',
      icon: FiUsers,
      color: 'green',
      helpText: 'Enrolled students'
    },
    {
      label: 'Total Faculty',
      value: '35',
      icon: FiUserCheck,
      color: 'purple',
      helpText: 'Staff members'
    },
    {
      label: 'Total Parents',
      value: '380',
      icon: FiUserPlus,
      color: 'orange',
      helpText: 'Registered guardians'
    }
  ];

  const attendanceData = {
    overallPercentage: 88,
  };
  const isLoading = false;

  return (
    <Box p={6}>
      <Flex alignItems="center" mb={8}>
        <Image src="/bus-logo.svg" alt="Bus Logo" boxSize="50px" mr={4} />
        <Box>
          <Heading size="lg" mb={1}>Mangalore Institute of Technology and Engineering</Heading>
          <Text color="gray.600">Admin Dashboard</Text>
        </Box>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6} mb={8}>
        {stats.map((stat, index) => (
          <AdminStatCard
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            helpText={stat.helpText}
            isLoading={isLoading}
          />
        ))}
      </SimpleGrid>

      <Card bg={cardBg} mb={8} boxShadow="sm">
        <CardBody>
          <Flex align="center" mb={4}>
            <Box p={3} bg={useColorModeValue('pink.100', 'pink.700')} borderRadius="lg" mr={4}>
              <Icon as={FiTrendingUp} boxSize={6} color={useColorModeValue('pink.500', 'pink.200')} />
            </Box>
            <Heading size="md">Attendance Overview</Heading>
          </Flex>
          <Skeleton isLoaded={!isLoading}>
            <Text fontSize="4xl" fontWeight="bold" color={useColorModeValue('pink.500', 'pink.300')}>
              {attendanceData.overallPercentage}%
            </Text>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>Overall student attendance</Text>
          </Skeleton>
          <Text mt={4} fontStyle="italic" color={useColorModeValue('gray.500', 'gray.400')}>
            More detailed attendance analytics coming soon.
          </Text>
        </CardBody>
      </Card>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        <Card bg={cardBg}>
          <CardBody>
            <Heading size="md" mb={4}>Quick Actions</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box p={4} borderRadius="lg" border="1px" borderColor="gray.200">
                <Icon as={FiUsers} boxSize={6} color="blue.500" mb={2} />
                <Text fontWeight="bold">Manage Students</Text>
                <Text fontSize="sm" color="gray.600">Add, edit, or remove student records</Text>
              </Box>
              <Box p={4} borderRadius="lg" border="1px" borderColor="gray.200">
                <Icon as={FiTruck} boxSize={6} color="green.500" mb={2} />
                <Text fontWeight="bold">Manage Buses</Text>
                <Text fontSize="sm" color="gray.600">Update bus routes and schedules</Text>
              </Box>
              <Box p={4} borderRadius="lg" border="1px" borderColor="gray.200">
                <Icon as={FiUserCheck} boxSize={6} color="purple.500" mb={2} />
                <Text fontWeight="bold">Manage Faculty</Text>
                <Text fontSize="sm" color="gray.600">Handle faculty assignments</Text>
              </Box>
              <Box p={4} borderRadius="lg" border="1px" borderColor="gray.200">
                <Icon as={FiUserPlus} boxSize={6} color="orange.500" mb={2} />
                <Text fontWeight="bold">Manage Parents</Text>
                <Text fontSize="sm" color="gray.600">Update parent information</Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Heading size="md" mb={4}>System Status</Heading>
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text>GPS Tracking System</Text>
                <Text color="green.500">Active</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text>RFID System</Text>
                <Text color="green.500">Active</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text>Notification Service</Text>
                <Text color="green.500">Active</Text>
              </Flex>
              <Flex justify="space-between">
                <Text>Database</Text>
                <Text color="green.500">Connected</Text>
              </Flex>
            </Box>
          </CardBody>
        </Card>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
