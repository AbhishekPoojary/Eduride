import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
  Spinner,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiPlus, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const BusManagement = () => {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBus, setCurrentBus] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    busId: '',
    name: '',
    capacity: '',
    driverName: '',
    driverPhone: '',
    driverLicense: '',
    routeName: '',
    routeStops: '',
    deviceId: '',
    status: 'active'
  });
  
  const toast = useToast();
  const isAdmin = user?.role === 'admin';
  
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Mock bus data for demonstration
  const mockBuses = [
    {
      _id: '1',
      busId: 'BUS001',
      name: 'North Campus Express',
      capacity: 40,
      driver: {
        name: 'Rajesh Kumar',
        phone: '+91 9876543210',
        licenseNumber: 'DL-1234567890'
      },
      route: {
        name: 'North Campus Route',
        stops: [
          { name: 'Main Gate', arrivalTime: '08:00 AM' },
          { name: 'Engineering Block', arrivalTime: '08:10 AM' },
          { name: 'Science Block', arrivalTime: '08:20 AM' },
          { name: 'Library', arrivalTime: '08:30 AM' },
          { name: 'Hostel Complex', arrivalTime: '08:40 AM' }
        ]
      },
      deviceId: 'GPS001',
      status: 'active'
    },
    {
      _id: '2',
      busId: 'BUS002',
      name: 'South Campus Express',
      capacity: 40,
      driver: {
        name: 'Suresh Patel',
        phone: '+91 9876543211',
        licenseNumber: 'DL-0987654321'
      },
      route: {
        name: 'South Campus Route',
        stops: [
          { name: 'Main Gate', arrivalTime: '08:15 AM' },
          { name: 'Hostel Complex', arrivalTime: '08:25 AM' },
          { name: 'Cafeteria', arrivalTime: '08:35 AM' },
          { name: 'Sports Complex', arrivalTime: '08:45 AM' },
          { name: 'Admin Block', arrivalTime: '08:55 AM' }
        ]
      },
      deviceId: 'GPS002',
      status: 'active'
    },
    {
      _id: '3',
      busId: 'BUS003',
      name: 'City Shuttle',
      capacity: 35,
      driver: {
        name: 'Amit Singh',
        phone: '+91 9876543212',
        licenseNumber: 'DL-5678901234'
      },
      route: {
        name: 'City Route',
        stops: [
          { name: 'Main Gate', arrivalTime: '09:00 AM' },
          { name: 'City Center', arrivalTime: '09:20 AM' },
          { name: 'Railway Station', arrivalTime: '09:40 AM' },
          { name: 'Shopping Mall', arrivalTime: '10:00 AM' },
          { name: 'College', arrivalTime: '10:20 AM' }
        ]
      },
      deviceId: 'GPS003',
      status: 'maintenance'
    }
  ];

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = () => {
    setIsLoading(true);
    
    // In a real app, this would be an API call
    // For demo, we'll use the mock data
    setTimeout(() => {
      setBuses(mockBuses);
      setIsLoading(false);
    }, 1000);
    
    // With a real API, it would look like this:
    // try {
    //   const response = await axios.get('/api/buses');
    //   setBuses(response.data);
    // } catch (error) {
    //   console.error('Error fetching buses:', error);
    //   toast({
    //     title: 'Error',
    //     description: 'Failed to fetch buses',
    //     status: 'error',
    //     duration: 3000,
    //     isClosable: true,
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleAddBus = () => {
    setFormMode('add');
    setFormData({
      busId: '',
      name: '',
      capacity: '',
      driverName: '',
      driverPhone: '',
      driverLicense: '',
      routeName: '',
      routeStops: '',
      deviceId: '',
      status: 'active'
    });
    onOpen();
  };

  const handleEditBus = (bus) => {
    setFormMode('edit');
    setCurrentBus(bus);
    
    // Format route stops for the textarea
    const routeStopsText = bus.route.stops
      .map(stop => `${stop.name}, ${stop.arrivalTime}`)
      .join('\n');
    
    setFormData({
      busId: bus.busId,
      name: bus.name,
      capacity: bus.capacity,
      driverName: bus.driver.name,
      driverPhone: bus.driver.phone,
      driverLicense: bus.driver.licenseNumber,
      routeName: bus.route.name,
      routeStops: routeStopsText,
      deviceId: bus.deviceId,
      status: bus.status
    });
    onOpen();
  };

  const handleDeleteBus = (busId) => {
    // In a real app, this would be an API call
    // For demo, we'll just update the state
    setBuses(buses.filter(bus => bus.busId !== busId));
    
    toast({
      title: 'Bus Deleted',
      description: `Bus ${busId} has been deleted successfully`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleSubmit = () => {
    // Validate form data
    if (!formData.busId || !formData.name || !formData.capacity) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Parse route stops from textarea
    const routeStops = formData.routeStops.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const [name, arrivalTime] = line.split(',').map(item => item.trim());
        return { name, arrivalTime };
      });
    
    // Create bus object
    const busData = {
      busId: formData.busId,
      name: formData.name,
      capacity: parseInt(formData.capacity),
      driver: {
        name: formData.driverName,
        phone: formData.driverPhone,
        licenseNumber: formData.driverLicense
      },
      route: {
        name: formData.routeName,
        stops: routeStops
      },
      deviceId: formData.deviceId,
      status: formData.status
    };
    
    if (formMode === 'add') {
      // In a real app, this would be an API call
      // For demo, we'll just update the state
      const newBus = {
        _id: Date.now().toString(),
        ...busData
      };
      
      setBuses([...buses, newBus]);
      
      toast({
        title: 'Bus Added',
        description: `Bus ${busData.busId} has been added successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      // In a real app, this would be an API call
      // For demo, we'll just update the state
      const updatedBuses = buses.map(bus => 
        bus._id === currentBus._id ? { ...bus, ...busData } : bus
      );
      
      setBuses(updatedBuses);
      
      toast({
        title: 'Bus Updated',
        description: `Bus ${busData.busId} has been updated successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
    
    onClose();
  };

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

  return (
    <Box>
      <Box mb={6}>
        <Heading as="h1" size="xl" mb={2}>
          Bus Management
        </Heading>
        <Text color="gray.600">Manage all college buses, routes, and drivers</Text>
      </Box>

      <Flex justify="flex-end" mb={4}>
        {isAdmin && (
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={handleAddBus}
          >
            Add New Bus
          </Button>
        )}
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" borderWidth="1px" borderColor={borderColor}>
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th>Bus ID</Th>
                <Th>Name</Th>
                <Th>Driver</Th>
                <Th>Route</Th>
                <Th>Capacity</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {buses.map((bus) => (
                <Tr key={bus._id}>
                  <Td fontWeight="medium">{bus.busId}</Td>
                  <Td>{bus.name}</Td>
                  <Td>
                    <Text>{bus.driver.name}</Text>
                    <Text fontSize="sm" color="gray.600">{bus.driver.phone}</Text>
                  </Td>
                  <Td>{bus.route.name}</Td>
                  <Td>{bus.capacity}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(bus.status)}>
                      {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Edit bus"
                        icon={<FiEdit2 />}
                        size="sm"
                        onClick={() => handleEditBus(bus)}
                        isDisabled={!isAdmin}
                      />
                      <IconButton
                        aria-label="Delete bus"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteBus(bus.busId)}
                        isDisabled={!isAdmin}
                      />
                      <IconButton
                        aria-label="View students"
                        icon={<FiUsers />}
                        size="sm"
                        colorScheme="purple"
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Add/Edit Bus Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {formMode === 'add' ? 'Add New Bus' : 'Edit Bus'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl id="busId" isRequired>
                <FormLabel>Bus ID</FormLabel>
                <Input 
                  value={formData.busId} 
                  onChange={handleFormChange} 
                  placeholder="e.g. BUS001"
                  isReadOnly={formMode === 'edit'}
                />
              </FormControl>
              
              <FormControl id="name" isRequired>
                <FormLabel>Bus Name</FormLabel>
                <Input 
                  value={formData.name} 
                  onChange={handleFormChange} 
                  placeholder="e.g. North Campus Express"
                />
              </FormControl>
              
              <FormControl id="capacity" isRequired>
                <FormLabel>Capacity</FormLabel>
                <Input 
                  type="number" 
                  value={formData.capacity} 
                  onChange={handleFormChange} 
                  placeholder="e.g. 40"
                />
              </FormControl>
              
              <FormControl id="status">
                <FormLabel>Status</FormLabel>
                <Select value={formData.status} onChange={handleFormChange}>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormControl>
              
              <FormControl id="deviceId">
                <FormLabel>GPS Device ID</FormLabel>
                <Input 
                  value={formData.deviceId} 
                  onChange={handleFormChange} 
                  placeholder="e.g. GPS001"
                />
              </FormControl>
              
              <Heading size="sm" alignSelf="flex-start" mt={2}>Driver Information</Heading>
              
              <FormControl id="driverName">
                <FormLabel>Driver Name</FormLabel>
                <Input 
                  value={formData.driverName} 
                  onChange={handleFormChange} 
                  placeholder="e.g. Rajesh Kumar"
                />
              </FormControl>
              
              <FormControl id="driverPhone">
                <FormLabel>Driver Phone</FormLabel>
                <Input 
                  value={formData.driverPhone} 
                  onChange={handleFormChange} 
                  placeholder="e.g. +91 9876543210"
                />
              </FormControl>
              
              <FormControl id="driverLicense">
                <FormLabel>Driver License Number</FormLabel>
                <Input 
                  value={formData.driverLicense} 
                  onChange={handleFormChange} 
                  placeholder="e.g. DL-1234567890"
                />
              </FormControl>
              
              <Heading size="sm" alignSelf="flex-start" mt={2}>Route Information</Heading>
              
              <FormControl id="routeName">
                <FormLabel>Route Name</FormLabel>
                <Input 
                  value={formData.routeName} 
                  onChange={handleFormChange} 
                  placeholder="e.g. North Campus Route"
                />
              </FormControl>
              
              <FormControl id="routeStops">
                <FormLabel>Route Stops (one per line, format: Stop Name, Arrival Time)</FormLabel>
                <Textarea 
                  value={formData.routeStops} 
                  onChange={handleFormChange} 
                  placeholder="e.g.\nMain Gate, 08:00 AM\nEngineering Block, 08:10 AM"
                  minHeight="150px"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {formMode === 'add' ? 'Add Bus' : 'Save Changes'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BusManagement;
