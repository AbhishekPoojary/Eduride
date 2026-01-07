import React from 'react';
import {
  Box,
  Flex,
  VStack,
  Icon,
  Text,
  Divider,
  useColorModeValue,
  Image
} from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiMap,
  FiUsers,
  FiTruck,
  FiUser,
  FiUserPlus,
  FiBriefcase,
  FiSettings,
  FiCreditCard,
  FiList
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  // Define navigation items based on user role
  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { name: 'Admin Dashboard', icon: FiHome, path: '/admin' },
        { name: 'Bus Management', icon: FiTruck, path: '/admin/buses' },
        { name: 'Students', icon: FiUser, path: '/admin/students' },
        { name: 'Parents', icon: FiUserPlus, path: '/admin/parents' },
        { name: 'Faculty', icon: FiBriefcase, path: '/admin/faculty' },
        { name: 'Settings', icon: FiSettings, path: '/admin/settings' }
      ];
    }

    const base = [
      { name: 'Dashboard', icon: FiHome, path: '/dashboard' },
      { name: 'Bus Tracking', icon: FiMap, path: '/bus-tracking' },
      { name: 'Bus Fares', icon: FiList, path: '/bus-fares' }
    ];

    if (user?.role === 'student') {
      base.push({ name: 'Payment', icon: FiCreditCard, path: '/payment' });
    }

    return base;
  };

  const navItems = getNavItems();

  return (
    <Box
      as="aside"
      bg={bgColor}
      borderRightWidth="1px"
      borderColor={borderColor}
      w="240px"
      h="100vh"
      overflow="auto"
      position="sticky"
      top={0}
    >
      <Flex direction="column" h="full" py={5} px={4}>
        <VStack spacing={2} align="center" mb={8}>
          <Image src="/mite_logo.png" alt="MITE Logo" boxSize="80px" objectFit="contain" fallbackSrc="https://via.placeholder.com/80?text=MITE" />
          <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('gray.700', 'gray.200')}>
            MITE
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="brand.500">
            EduRide
          </Text>
        </VStack>

        <VStack spacing={1} align="stretch" flex={1}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Box
                key={item.name}
                as={NavLink}
                to={item.path}
                py={3}
                px={4}
                borderRadius="md"
                bg={isActive ? 'brand.500' : 'transparent'}
                color={isActive ? 'white' : 'inherit'}
                _hover={{
                  bg: isActive ? 'brand.600' : hoverBg,
                  color: isActive ? 'white' : 'brand.500'
                }}
                transition="all 0.2s"
              >
                <Flex align="center">
                  <Icon as={item.icon} boxSize={5} mr={3} />
                  <Text fontWeight="medium">{item.name}</Text>
                </Flex>
              </Box>
            );
          })}
        </VStack>

        <Divider my={6} />

        <Box
          as={NavLink}
          to="/profile"
          py={3}
          px={4}
          borderRadius="md"
          bg={location.pathname === '/profile' ? 'brand.500' : 'transparent'}
          color={location.pathname === '/profile' ? 'white' : 'inherit'}
          _hover={{
            bg: location.pathname === '/profile' ? 'brand.600' : hoverBg,
            color: location.pathname === '/profile' ? 'white' : 'brand.500'
          }}
          transition="all 0.2s"
        >
          <Flex align="center">
            <Icon as={FiUser} boxSize={5} mr={3} />
            <Text fontWeight="medium">Profile</Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default Sidebar;
