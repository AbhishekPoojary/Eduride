import React from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Progress,
  HStack,
  VStack,
  Icon,
  Skeleton,
  useColorModeValue
} from '@chakra-ui/react';
import { FiTruck, FiMapPin, FiUsers, FiClock } from 'react-icons/fi';

const BusStatusCard = ({
  busId,
  route,
  status,
  currentStop,
  nextStop,
  occupancy,
  capacity,
  isLoading
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'maintenance':
        return 'orange';
      case 'inactive':
        return 'red';
      default:
        return 'gray';
    }
  };

  const statusColor = getStatusColor(status);
  const occupancyPercentage = Math.round((occupancy / capacity) * 100);
  const getOccupancyColor = () => {
    if (occupancyPercentage < 50) return 'green';
    if (occupancyPercentage < 80) return 'orange';
    return 'red';
  };

  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      borderColor={borderColor}
      p={4}
      position="relative"
      overflow="hidden"
    >
      <Skeleton isLoaded={!isLoading}>
        <Flex justify="space-between" align="center" mb={3}>
          <HStack>
            <Icon as={FiTruck} color="blue.500" boxSize={5} />
            <Text fontWeight="bold" fontSize="lg">{busId}</Text>
          </HStack>
          <Badge colorScheme={statusColor} fontSize="sm" px={2} py={1} borderRadius="full">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </Flex>
      </Skeleton>

      <Skeleton isLoaded={!isLoading} mb={3}>
        <Text color="gray.500" fontSize="sm">{route}</Text>
      </Skeleton>

      <VStack align="stretch" spacing={3}>
        <Skeleton isLoaded={!isLoading}>
          <HStack>
            <Icon as={FiMapPin} color="green.500" />
            <Text fontWeight="medium">Current Stop:</Text>
            <Text>{currentStop}</Text>
          </HStack>
        </Skeleton>

        <Skeleton isLoaded={!isLoading}>
          <HStack>
            <Icon as={FiMapPin} color="red.500" />
            <Text fontWeight="medium">Next Stop:</Text>
            <Text>{nextStop}</Text>
          </HStack>
        </Skeleton>

        <Skeleton isLoaded={!isLoading}>
          <HStack>
            <Icon as={FiClock} color="purple.500" />
            <Text fontWeight="medium">ETA:</Text>
            <Text>5 mins</Text>
          </HStack>
        </Skeleton>

        <Skeleton isLoaded={!isLoading}>
          <Box>
            <Flex justify="space-between" mb={1}>
              <HStack>
                <Icon as={FiUsers} color="blue.500" />
                <Text fontWeight="medium">Occupancy:</Text>
              </HStack>
              <Text>{occupancy}/{capacity}</Text>
            </Flex>
            <Progress 
              value={occupancyPercentage} 
              colorScheme={getOccupancyColor()} 
              size="sm" 
              borderRadius="full" 
            />
          </Box>
        </Skeleton>
      </VStack>
    </Box>
  );
};

export default BusStatusCard;
