import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <Flex h="100vh" overflow="hidden">
      <Sidebar />
      <Box flex="1" overflow="auto">
        <Header />
        <Box as="main" p={4} overflowY="auto">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default Layout;
