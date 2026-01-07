import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Icon,
  useColorModeValue,
  Skeleton
} from '@chakra-ui/react';
import { FiTruck, FiUsers, FiCalendar, FiMapPin } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Components
import BusStatusCard from './components/BusStatusCard';
import RecentActivities from './components/RecentActivities';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeBuses: 0,
    totalStudents: 0,
    todayAttendance: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // In a real application, these would be separate API calls
        // For demo purposes, we're simulating the data
        
        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalBuses: 12,
          activeBuses: 8,
          totalStudents: 450,
          todayAttendance: 382
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Box>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={2}>
          {getGreeting()}, {user?.name}!
        </Heading>
        <Text color="gray.600">Here's what's happening with your buses today.</Text>
      </Box>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {/* No stats cards will be shown on the general user dashboard for now */}
        {/* You can add relevant cards for general users here if needed */}
      </SimpleGrid>

      {/* Main Content */}
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        <Box>
          {/* Bus Status Section */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} mb={6} boxShadow="sm">
            <CardHeader pb={0}>
              <Heading size="md">Bus Status</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <BusStatusCard 
                  busId="BUS001" 
                  route="North Campus Route" 
                  status="active" 
                  currentStop="Engineering Block" 
                  nextStop="Science Block" 
                  occupancy={32} 
                  capacity={40} 
                  isLoading={isLoading} 
                />
                <BusStatusCard 
                  busId="BUS002" 
                  route="South Campus Route" 
                  status="active" 
                  currentStop="Main Gate" 
                  nextStop="Hostel Complex" 
                  occupancy={28} 
                  capacity={40} 
                  isLoading={isLoading} 
                />
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Recent Activities */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} boxShadow="sm">
            <CardHeader pb={0}>
              <Heading size="md">Recent Activities</Heading>
            </CardHeader>
            <CardBody>
              <RecentActivities isLoading={isLoading} />
            </CardBody>
          </Card>
        </Box>

        {/* Recent Activities */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} boxShadow="sm">
          <CardHeader pb={0}>
            <Heading size="md">Recent Activities</Heading>
          </CardHeader>
          <CardBody>
            <RecentActivities isLoading={isLoading} />
          </CardBody>
        </Card>
      </Grid>
    </Box>
  );
};

export default Dashboard;
