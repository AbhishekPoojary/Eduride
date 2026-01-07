import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
  HStack,
  Badge,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react';
import { FiBell, FiUser, FiLogOut, FiSettings, FiMoon, FiSun } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  // Role badge color mapping
  const roleBadgeColor = {
    admin: 'red',
    faculty: 'purple',
    parent: 'blue',
    student: 'green'
  };

  return (
    <Box
      as="header"
      bg={bgColor}
      borderBottomWidth="1px"
      borderColor={borderColor}
      py={2}
      px={4}
      position="sticky"
      top={0}
      zIndex="sticky"
    >
      <Flex justify="space-between" align="center">
        <Text fontSize="xl" fontWeight="bold" color="brand.500">
          EduRide Dashboard
        </Text>

        <HStack spacing={4}>
          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            variant="ghost"
            onClick={toggleColorMode}
          />

          <IconButton
            aria-label="Notifications"
            icon={<FiBell />}
            variant="ghost"
            onClick={handleNotifications}
          />

          <Menu>
            <MenuButton>
              <HStack spacing={2} cursor="pointer">
                <Avatar size="sm" name={user?.name} src="" bg="brand.500" />
                <Box display={{ base: 'none', md: 'block' }}>
                  <Text fontWeight="medium" fontSize="sm">
                    {user?.name}
                  </Text>
                  <Badge colorScheme={roleBadgeColor[user?.role] || 'gray'} fontSize="xs">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </Badge>
                </Box>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiUser />} onClick={handleProfile}>
                Profile
              </MenuItem>
              <MenuItem icon={<FiSettings />} onClick={() => navigate('/profile?tab=settings')}>
                Settings
              </MenuItem>
              <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
