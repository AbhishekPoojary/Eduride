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
  VStack,
  useToast,
  Spinner,
  Flex,
  useColorModeValue,
  InputGroup,
  InputRightElement
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiPlus, FiUserPlus, FiCreditCard, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Students = () => {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isRfidModalOpen, 
    onOpen: onRfidModalOpen, 
    onClose: onRfidModalClose 
  } = useDisclosure();
  const [students, setStudents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [parents, setParents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    rfidTag: '',
    assignedBus: '',
    parentId: '',
    paymentStatus: 'pending'
  });
  const [rfidData, setRfidData] = useState({
    studentId: '',
    rfidTag: ''
  });
  
  const toast = useToast();
  
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Real data fetched from API

  // Mock buses for dropdown - will be replaced with API call
  const mockBuses = [
    { _id: 'bus1', busId: 'BUS001', name: 'North Campus Route' },
    { _id: 'bus2', busId: 'BUS002', name: 'South Campus Express' },
    { _id: 'bus3', busId: 'BUS003', name: 'City Shuttle' }
  ];

  useEffect(() => {
    fetchStudents();
    fetchParents();
    
    // Set up SSE connection for real-time payment updates
    const eventSource = new EventSource('/api/events/updates');
    
    eventSource.addEventListener('paymentUpdate', (event) => {
      const { userId, paymentStatus } = JSON.parse(event.data);
      
      // Update the student's payment status in the local state
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student._id === userId 
            ? { ...student, paymentStatus }
            : student
        )
      );
      
      // Show a toast notification for the update
      toast({
        title: 'Payment Status Updated',
        description: `Student payment status changed to ${paymentStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    });
    
    eventSource.addEventListener('ping', (event) => {
      // Keep-alive ping, no action needed
    });
    
    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };
    
    // Cleanup on component unmount
    return () => {
      eventSource.close();
    };
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/users/role/students');
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch students',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParents = async () => {
    try {
      const response = await axios.get('/api/users/role/parents');
      setParents(response.data || []);
    } catch (error) {
      console.error('Error fetching parents:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch parents',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddStudent = () => {
    setFormMode('add');
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      rfidTag: '',
      assignedBus: '',
      parentId: '',
      paymentStatus: 'pending'
    });
    onOpen();
  };

  const handleEditStudent = (student) => {
    setFormMode('edit');
    setCurrentStudent(student);
    
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      password: '',
      rfidTag: student.rfidTag || '',
      assignedBus: student.assignedBus?._id || student.assignedBus || '',
      parentId: student.parentId || '',
      paymentStatus: student.paymentStatus || 'pending'
    });
    onOpen();
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await axios.delete(`/api/users/${studentId}`);
      fetchStudents(); // Refresh the list
      toast({
        title: 'Student Deleted',
        description: `Student has been deleted successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Could not delete student.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleSubmit = async () => {
    // Validate form data
    if (!formData.name || !formData.email) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (formMode === 'add' && !formData.password) {
      toast({
        title: 'Error',
        description: 'Password is required for new students',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Get bus and parent details for display
    const selectedBus = mockBuses.find(bus => bus._id === formData.assignedBus);
    const selectedParent = parents.find(parent => parent._id === formData.parentId);
    
    // Create student object
    const studentData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      ...(formMode === 'add' && { password: formData.password }),
      role: 'student', 
      rfidTag: formData.rfidTag,
      assignedBus: formData.assignedBus || null, // Only send the ID, not the full object
      parentId: formData.parentId,
      parentName: selectedParent?.name,
      paymentStatus: formData.paymentStatus
    };
    
    try {
      if (formMode === 'add') {
        // Add new student via API
        const response = await axios.post('/api/users/register', studentData);
        fetchStudents(); // Refresh the list
        onClose();
        toast({
          title: 'Student Added',
          description: `${response.data.user?.name || studentData.name} has been added successfully.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Update existing student via API
        const response = await axios.put(`/api/users/${currentStudent._id}`, studentData);
        fetchStudents(); // Refresh the list
        onClose();
        toast({
          title: 'Student Updated',
          description: `${response.data.user?.name || studentData.name} has been updated successfully.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Could not save student.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAssignRfid = (student) => {
    setRfidData({
      studentId: student._id,
      rfidTag: student.rfidTag || ''
    });
    onRfidModalOpen();
  };

  const handleRfidSubmit = async () => {
    // Validate RFID data
    if (!rfidData.rfidTag) {
      toast({
        title: 'Error',
        description: 'Please enter an RFID tag',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      await axios.put(`/api/users/${rfidData.studentId}`, { rfidTag: rfidData.rfidTag });
      fetchStudents(); // Refresh the list
      onRfidModalClose();
      toast({
        title: 'RFID Assigned',
        description: `RFID tag has been assigned successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error assigning RFID:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Could not assign RFID tag.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

const getPaymentStatusBadge = (status) => {
  switch (status) {
    case 'paid':
      return <Badge colorScheme="green">Paid</Badge>;
    case 'pending':
      return <Badge colorScheme="yellow">Pending</Badge>;
    case 'overdue':
      return <Badge colorScheme="red">Overdue</Badge>;
    case 'exempt':
      return <Badge colorScheme="purple">Exempt</Badge>;
    default:
      return <Badge colorScheme="gray">Unknown</Badge>;
  }
};

  return (
    <Box>
      <Box mb={6}>
        <Heading as="h1" size="xl" mb={2}>
          Student Management
        </Heading>
        <Text color="gray.600">Manage student information, bus assignments, and RFID tags</Text>
      </Box>

      <Flex justify="flex-end" mb={4}>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="blue"
          onClick={handleAddStudent}
        >
          Add New Student
        </Button>
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
                <Th>Name</Th>
                <Th>Contact</Th>
                <Th>RFID Tag</Th>
                <Th>Assigned Bus</Th>
                <Th>Parent</Th>
                <Th>Payment</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {students.map((student) => (
                <Tr key={student._id}>
                  <Td fontWeight="medium">{student.name}</Td>
                  <Td>
                    <Text>{student.email}</Text>
                    <Text fontSize="sm" color="gray.600">{student.phone}</Text>
                  </Td>
                  <Td>
                    {student.rfidTag ? (
                      <Text>{student.rfidTag}</Text>
                    ) : (
                      <Badge colorScheme="red">Not Assigned</Badge>
                    )}
                  </Td>
                  <Td>
                    {student.assignedBus ? (
                      typeof student.assignedBus === 'object' ? (
                        <>
                          <Text>{student.assignedBus.busId || student.assignedBus}</Text>
                          {student.assignedBus.name && (
                            <Text fontSize="sm" color="gray.600">{student.assignedBus.name}</Text>
                          )}
                        </>
                      ) : (
                        // If it's a string ID, find the bus from mockBuses
                        (() => {
                          const bus = mockBuses.find(b => b._id === student.assignedBus);
                          return bus ? (
                            <>
                              <Text>{bus.busId}</Text>
                              <Text fontSize="sm" color="gray.600">{bus.name}</Text>
                            </>
                          ) : (
                            <Text>{student.assignedBus}</Text>
                          );
                        })()
                      )
                    ) : (
                      <Badge colorScheme="red">Not Assigned</Badge>
                    )}
                  </Td>
                  <Td>
                    {student.parentName ? (
                      <Text>{student.parentName}</Text>
                    ) : student.parentId ? (
                      <Text>{student.parentId}</Text>
                    ) : (
                      <Badge colorScheme="red">Not Linked</Badge>
                    )}
                  </Td>
                  <Td>{getPaymentStatusBadge(student.paymentStatus)}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Edit student"
                        icon={<FiEdit2 />}
                        size="sm"
                        onClick={() => handleEditStudent(student)}
                      />
                      <IconButton
                        aria-label="Delete student"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteStudent(student._id)}
                      />
                      <IconButton
                        aria-label="Assign RFID"
                        icon={<FiCreditCard />}
                        size="sm"
                        colorScheme="purple"
                        onClick={() => handleAssignRfid(student)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Add/Edit Student Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {formMode === 'add' ? 'Add New Student' : 'Edit Student'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl id="name" isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input 
                  value={formData.name} 
                  onChange={handleFormChange} 
                  placeholder="e.g. Rahul Sharma"
                />
              </FormControl>
              
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input 
                  type="email"
                  value={formData.email} 
                  onChange={handleFormChange} 
                  placeholder="e.g. rahul.s@example.com"
                />
              </FormControl>
              
              <FormControl id="phone">
                <FormLabel>Phone Number</FormLabel>
                <Input 
                  value={formData.phone} 
                  onChange={handleFormChange} 
                  placeholder="e.g. +91 9876543210"
                />
              </FormControl>
              
              {formMode === 'add' && (
                <FormControl id="password" isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input 
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password} 
                      onChange={handleFormChange} 
                      placeholder="Enter password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              )}
              
              <FormControl id="rfidTag">
                <FormLabel>RFID Tag</FormLabel>
                <Input 
                  value={formData.rfidTag} 
                  onChange={handleFormChange} 
                  placeholder="e.g. 04A3B7C9"
                />
              </FormControl>
              
              <FormControl id="assignedBus">
                <FormLabel>Assigned Bus</FormLabel>
                <Select 
                  value={formData.assignedBus} 
                  onChange={handleFormChange}
                  placeholder="Select Bus"
                >
                  {mockBuses.map(bus => (
                    <option key={bus._id} value={bus._id}>
                      {bus.busId} - {bus.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl id="parentId">
                <FormLabel>Parent</FormLabel>
                <Select 
                  value={formData.parentId} 
                  onChange={handleFormChange}
                  placeholder="Select Parent"
                >
                  {parents.map(parent => (
                    <option key={parent._id} value={parent._id}>
                      {parent.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl id="paymentStatus">
                <FormLabel>Payment Status</FormLabel>
                <Select 
                  value={formData.paymentStatus} 
                  onChange={handleFormChange}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="exempt">Exempt</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {formMode === 'add' ? 'Add Student' : 'Save Changes'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Assign RFID Modal */}
      <Modal isOpen={isRfidModalOpen} onClose={onRfidModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign RFID Tag</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl id="rfidTag" isRequired>
                <FormLabel>RFID Tag</FormLabel>
                <Input 
                  value={rfidData.rfidTag} 
                  onChange={(e) => setRfidData({ ...rfidData, rfidTag: e.target.value })} 
                  placeholder="e.g. 04A3B7C9"
                />
              </FormControl>
              
              <Text fontSize="sm" color="gray.600">
                Scan the RFID card or manually enter the tag ID to assign it to the student.
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRfidModalClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleRfidSubmit}>
              Assign RFID
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Students;
