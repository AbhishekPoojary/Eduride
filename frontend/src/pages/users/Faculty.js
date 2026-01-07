import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
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
  useToast,
  Badge,
  Flex,
  IconButton,
  useColorModeValue,
  Avatar
} from '@chakra-ui/react';
import { FiEdit, FiTrash2, FiPlus, FiPhone, FiMail } from 'react-icons/fi';

const Faculty = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [faculty, setFaculty] = useState([]);
  const [currentFaculty, setCurrentFaculty] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Mock faculty data for demonstration
  const mockFaculty = [
    {
      _id: 'faculty1',
      name: 'Dr. Anil Kumar',
      email: 'anil.k@example.com',
      phone: '+91 9876543220',
      department: 'Computer Science',
      role: 'Bus Coordinator',
      assignedBus: {
        _id: 'bus1',
        busId: 'BUS001',
        name: 'North Campus Express'
      }
    },
    {
      _id: 'faculty2',
      name: 'Prof. Meera Singh',
      email: 'meera.s@example.com',
      phone: '+91 9876543221',
      department: 'Electrical Engineering',
      role: 'Bus Coordinator',
      assignedBus: {
        _id: 'bus2',
        busId: 'BUS002',
        name: 'South Campus Express'
      }
    },
    {
      _id: 'faculty3',
      name: 'Dr. Ramesh Joshi',
      email: 'ramesh.j@example.com',
      phone: '+91 9876543222',
      department: 'Mechanical Engineering',
      role: 'Transportation Admin',
      assignedBus: null
    }
  ];

  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll use mock data
    setFaculty(mockFaculty);
  }, []);

  const handleAddFaculty = () => {
    setIsEditing(false);
    setCurrentFaculty({
      name: '',
      email: '',
      phone: '',
      department: '',
      role: 'Bus Coordinator',
      assignedBus: null
    });
    onOpen();
  };

  const handleEditFaculty = (faculty) => {
    setIsEditing(true);
    setCurrentFaculty(faculty);
    onOpen();
  };

  const handleDeleteFaculty = (facultyId) => {
    // In a real app, this would be an API call
    // For now, we'll just update the state
    setFaculty(faculty.filter(f => f._id !== facultyId));
    toast({
      title: 'Faculty deleted',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      if (isEditing) {
        // Update existing faculty
        setFaculty(faculty.map(f => 
          f._id === currentFaculty._id ? currentFaculty : f
        ));
        toast({
          title: 'Faculty updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add new faculty
        const newFaculty = {
          ...currentFaculty,
          _id: `faculty${faculty.length + 1}`
        };
        setFaculty([...faculty, newFaculty]);
        toast({
          title: 'Faculty added',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentFaculty({
      ...currentFaculty,
      [name]: value
    });
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Faculty Management</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="blue"
          onClick={handleAddFaculty}
        >
          Add Faculty
        </Button>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple" borderWidth="1px" borderColor={borderColor}>
          <Thead bg={tableHeaderBg}>
            <Tr>
              <Th>Name</Th>
              <Th>Contact</Th>
              <Th>Department</Th>
              <Th>Role</Th>
              <Th>Assigned Bus</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {faculty.map((faculty) => (
              <Tr key={faculty._id}>
                <Td>
                  <Flex align="center">
                    <Avatar size="sm" name={faculty.name} mr={3} />
                    <Box fontWeight="semibold">{faculty.name}</Box>
                  </Flex>
                </Td>
                <Td>
                  <Flex direction="column">
                    <Flex align="center" mb={1}>
                      <Box as={FiMail} mr={2} />
                      <Box>{faculty.email}</Box>
                    </Flex>
                    <Flex align="center">
                      <Box as={FiPhone} mr={2} />
                      <Box>{faculty.phone}</Box>
                    </Flex>
                  </Flex>
                </Td>
                <Td>{faculty.department}</Td>
                <Td>
                  <Badge colorScheme="purple">
                    {faculty.role}
                  </Badge>
                </Td>
                <Td>
                  {faculty.assignedBus ? (
                    <Badge colorScheme="green">
                      {faculty.assignedBus.name} ({faculty.assignedBus.busId})
                    </Badge>
                  ) : (
                    <Badge colorScheme="gray">None</Badge>
                  )}
                </Td>
                <Td>
                  <Flex>
                    <IconButton
                      icon={<FiEdit />}
                      aria-label="Edit"
                      mr={2}
                      onClick={() => handleEditFaculty(faculty)}
                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      aria-label="Delete"
                      colorScheme="red"
                      onClick={() => handleDeleteFaculty(faculty._id)}
                    />
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Add/Edit Faculty Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Edit Faculty' : 'Add New Faculty'}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleFormSubmit}>
            <ModalBody>
              <FormControl mb={4} isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={currentFaculty?.name || ''}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl mb={4} isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={currentFaculty?.email || ''}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl mb={4} isRequired>
                <FormLabel>Phone</FormLabel>
                <Input
                  name="phone"
                  value={currentFaculty?.phone || ''}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Department</FormLabel>
                <Input
                  name="department"
                  value={currentFaculty?.department || ''}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Role</FormLabel>
                <Select
                  name="role"
                  value={currentFaculty?.role || 'Bus Coordinator'}
                  onChange={handleInputChange}
                >
                  <option value="Bus Coordinator">Bus Coordinator</option>
                  <option value="Transportation Admin">Transportation Admin</option>
                </Select>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                isLoading={isLoading}
              >
                {isEditing ? 'Update' : 'Add'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Faculty;
