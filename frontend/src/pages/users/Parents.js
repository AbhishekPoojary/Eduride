import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
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
  Icon
} from '@chakra-ui/react';
import { FiEdit, FiTrash2, FiPlus, FiPhone, FiMail } from 'react-icons/fi';
import axios from 'axios';

const Parents = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [parents, setParents] = useState([]);
  const [currentParent, setCurrentParent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchParents();
    
    // Set up SSE connection for real-time payment updates
    const eventSource = new EventSource('/api/events/updates');
    
    eventSource.addEventListener('paymentUpdate', (event) => {
      const { userId, paymentStatus } = JSON.parse(event.data);
      
      // Update the parent's payment status in the local state
      setParents(prevParents => 
        prevParents.map(parent => 
          parent._id === userId 
            ? { ...parent, paymentStatus }
            : parent
        )
      );
      
      // Show a toast notification for the update
      toast({
        title: 'Payment Status Updated',
        description: `Parent payment status changed to ${paymentStatus}`,
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

  const fetchParents = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/users/role/parents');
      setParents(data || []);
    } catch (error) {
      console.error('Error fetching parents:', error);
      toast({ title: 'Error', description: 'Failed to fetch parents', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParent = () => {
    setIsEditing(false);
    setCurrentParent({
      name: '',
      email: '',
      phone: '',
      address: '',
      paymentStatus: 'pending'
    });
    onOpen();
  };

  const handleEditParent = (parent) => {
    setIsEditing(true);
    setCurrentParent(parent);
    onOpen();
  };

  const handleDeleteParent = (parentId) => {
    // TODO: Replace with API call (admin delete)
    setParents(prevParents => prevParents ? prevParents.filter(parent => parent._id !== parentId) : []);
    toast({
      title: 'Parent deleted',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Replace with API call (admin add/update)
    setTimeout(() => {
      if (isEditing) {
        // Update existing parent
        setParents(prevParents => prevParents ? prevParents.map(parent => 
          parent._id === currentParent._id ? currentParent : parent
        ) : [currentParent]);
        toast({
          title: 'Parent updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add new parent
        const newParent = {
          ...currentParent,
          _id: Date.now().toString(),
          children: [],
          paymentStatus: 'pending'
        };
        setParents(prevParents => prevParents ? [...prevParents, newParent] : [newParent]);
        toast({
          title: 'Parent added',
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
    setCurrentParent({
      ...currentParent,
      [name]: value
    });
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Parents Management</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="blue"
          onClick={handleAddParent}
        >
          Add Parent
        </Button>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple" borderWidth="1px" borderColor={borderColor}>
          <Thead bg={tableHeaderBg}>
            <Tr>
              <Th>Name</Th>
              <Th>Contact</Th>
              <Th>Children</Th>
              <Th>Payment Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {parents && parents.length > 0 ? (
              parents.map((parent) => (
              <Tr key={parent._id}>
                <Td>
                  <Box>
                    <Box fontWeight="semibold">{parent.name}</Box>
                    <Box fontSize="sm" color="gray.600">{parent.address}</Box>
                  </Box>
                </Td>
                <Td>
                  <Flex direction="column">
                    <Flex align="center" mb={1}>
                      <Icon as={FiMail} mr={2} />
                      <Box>{parent.email}</Box>
                    </Flex>
                    <Flex align="center">
                      <Icon as={FiPhone} mr={2} />
                      <Box>{parent.phone}</Box>
                    </Flex>
                  </Flex>
                </Td>
                <Td>
                  {parent.children && parent.children.length > 0 ? (
                    parent.children.map(child => (
                      <Badge key={child._id} colorScheme="green" mr={2} mb={1}>
                        {child.name} (Grade {child.grade})
                      </Badge>
                    ))
                  ) : (
                    <Text color="gray.500">No children assigned</Text>
                  )}
                </Td>
                <Td>
                  <Badge
                    colorScheme={parent.paymentStatus === 'paid' ? 'green' : 'orange'}
                  >
                    {parent.paymentStatus.toUpperCase()}
                  </Badge>
                </Td>
                <Td>
                  <Flex>
                    <IconButton
                      icon={<FiEdit />}
                      aria-label="Edit"
                      mr={2}
                      onClick={() => handleEditParent(parent)}
                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      aria-label="Delete"
                      colorScheme="red"
                      onClick={() => handleDeleteParent(parent._id)}
                    />
                  </Flex>
                </Td>
              </Tr>
            ))
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center" py={4}>
                  <Text color="gray.500">No parents found</Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Add/Edit Parent Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Edit Parent' : 'Add New Parent'}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleFormSubmit}>
            <ModalBody>
              <FormControl mb={4} isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={currentParent?.name || ''}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl mb={4} isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={currentParent?.email || ''}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl mb={4} isRequired>
                <FormLabel>Phone</FormLabel>
                <Input
                  name="phone"
                  value={currentParent?.phone || ''}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Address</FormLabel>
                <Input
                  name="address"
                  value={currentParent?.address || ''}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Payment Status</FormLabel>
                <Select
                  name="paymentStatus"
                  value={currentParent?.paymentStatus || 'pending'}
                  onChange={handleInputChange}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
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

export default Parents;
