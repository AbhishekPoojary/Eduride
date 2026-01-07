import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Flex,
  Spinner,
  useColorModeValue,
  IconButton,
  useToast
} from '@chakra-ui/react';
import { FiDownload, FiFilter, FiSearch, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    busId: '',
    studentId: '',
    status: ''
  });
  
  const toast = useToast();
  const isAdmin = user?.role === 'admin';
  const isParent = user?.role === 'parent';
  const isStudent = user?.role === 'student';
  
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Mock attendance data for demonstration
  const mockAttendanceData = [
    {
      _id: '1',
      student: {
        _id: 'student1',
        name: 'Rahul Sharma',
        rfidTag: '04A3B7C9'
      },
      bus: {
        _id: 'bus1',
        busId: 'BUS001',
        name: 'North Campus Express'
      },
      entryTime: new Date('2025-05-24T07:32:00'),
      exitTime: new Date('2025-05-24T16:45:00'),
      status: 'complete',
      date: new Date('2025-05-24')
    },
    {
      _id: '2',
      student: {
        _id: 'student2',
        name: 'Priya Patel',
        rfidTag: '04A3B7D0'
      },
      bus: {
        _id: 'bus2',
        busId: 'BUS002',
        name: 'South Campus Express'
      },
      entryTime: new Date('2025-05-24T07:45:00'),
      exitTime: new Date('2025-05-24T16:30:00'),
      status: 'complete',
      date: new Date('2025-05-24')
    },
    {
      _id: '3',
      student: {
        _id: 'student3',
        name: 'Amit Kumar',
        rfidTag: '04A3B7E1'
      },
      bus: {
        _id: 'bus1',
        busId: 'BUS001',
        name: 'North Campus Express'
      },
      entryTime: new Date('2025-05-24T07:50:00'),
      exitTime: null,
      status: 'entry',
      date: new Date('2025-05-24')
    },
    {
      _id: '4',
      student: {
        _id: 'student4',
        name: 'Sneha Reddy',
        rfidTag: '04A3B7F2'
      },
      bus: {
        _id: 'bus2',
        busId: 'BUS002',
        name: 'South Campus Express'
      },
      entryTime: new Date('2025-05-24T08:05:00'),
      exitTime: null,
      status: 'entry',
      date: new Date('2025-05-24')
    },
    {
      _id: '5',
      student: {
        _id: 'student5',
        name: 'Vikram Singh',
        rfidTag: '04A3B8A3'
      },
      bus: {
        _id: 'bus1',
        busId: 'BUS001',
        name: 'North Campus Express'
      },
      entryTime: new Date('2025-05-24T08:10:00'),
      exitTime: new Date('2025-05-24T16:20:00'),
      status: 'complete',
      date: new Date('2025-05-24')
    }
  ];

  // Mock buses for filter dropdown
  const buses = [
    { _id: 'bus1', busId: 'BUS001', name: 'North Campus Express' },
    { _id: 'bus2', busId: 'BUS002', name: 'South Campus Express' },
    { _id: 'bus3', busId: 'BUS003', name: 'City Shuttle' }
  ];

  // Mock students for filter dropdown
  const students = [
    { _id: 'student1', name: 'Rahul Sharma' },
    { _id: 'student2', name: 'Priya Patel' },
    { _id: 'student3', name: 'Amit Kumar' },
    { _id: 'student4', name: 'Sneha Reddy' },
    { _id: 'student5', name: 'Vikram Singh' }
  ];

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = () => {
    setIsLoading(true);
    
    // In a real app, this would be an API call with filters
    // For demo, we'll use the mock data
    setTimeout(() => {
      setAttendanceData(mockAttendanceData);
      setIsLoading(false);
    }, 1000);
    
    // With a real API, it would look like this:
    // try {
    //   const queryParams = new URLSearchParams();
    //   if (filters.date) queryParams.append('date', filters.date);
    //   if (filters.busId) queryParams.append('busId', filters.busId);
    //   if (filters.studentId) queryParams.append('studentId', filters.studentId);
    //   if (filters.status) queryParams.append('status', filters.status);
    //
    //   const response = await axios.get(`/api/rfid/report?${queryParams}`);
    //   setAttendanceData(response.data);
    // } catch (error) {
    //   console.error('Error fetching attendance data:', error);
    //   toast({
    //     title: 'Error',
    //     description: 'Failed to fetch attendance data',
    //     status: 'error',
    //     duration: 3000,
    //     isClosable: true,
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters({
      ...filters,
      [id]: value
    });
  };

  const applyFilters = () => {
    fetchAttendanceData();
  };

  const exportAttendance = () => {
    // In a real app, this would generate a CSV or Excel file
    toast({
      title: 'Export Started',
      description: 'Your attendance report is being generated',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'entry':
        return <Badge colorScheme="yellow">Entry Only</Badge>;
      case 'exit':
        return <Badge colorScheme="orange">Exit Only</Badge>;
      case 'complete':
        return <Badge colorScheme="green">Complete</Badge>;
      default:
        return <Badge colorScheme="gray">Unknown</Badge>;
    }
  };

  // Filter data based on user role
  const getFilteredData = () => {
    if (isStudent) {
      // If student, only show their own attendance
      return attendanceData.filter(record => record.student._id === user.id);
    } else if (isParent) {
      // If parent, only show their children's attendance
      // In a real app, you would have a list of the parent's children
      // For demo, we'll just show all
      return attendanceData;
    } else {
      // Admin or faculty can see all
      return attendanceData;
    }
  };

  return (
    <Box>
      <Box mb={6}>
        <Heading as="h1" size="xl" mb={2}>
          Attendance Records
        </Heading>
        <Text color="gray.600">Track and manage student attendance on college buses</Text>
      </Box>

      <Tabs variant="enclosed" colorScheme="blue" mb={6}>
        <TabList>
          <Tab>Today's Attendance</Tab>
          <Tab>Attendance History</Tab>
          {isAdmin && <Tab>Reports</Tab>}
        </TabList>

        <TabPanels>
          {/* Today's Attendance Tab */}
          <TabPanel p={0} pt={4}>
            <Box mb={6}>
              <Flex 
                direction={{ base: 'column', md: 'row' }} 
                justify="space-between" 
                align={{ base: 'stretch', md: 'center' }}
                wrap="wrap"
                gap={4}
              >
                <HStack>
                  <FormControl id="busId" maxW="200px">
                    <Select 
                      placeholder="Select Bus" 
                      value={filters.busId}
                      onChange={handleFilterChange}
                    >
                      {buses.map(bus => (
                        <option key={bus._id} value={bus.busId}>
                          {bus.busId} - {bus.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {(isAdmin || !isStudent) && (
                    <FormControl id="studentId" maxW="200px">
                      <Select 
                        placeholder="Select Student" 
                        value={filters.studentId}
                        onChange={handleFilterChange}
                      >
                        {students.map(student => (
                          <option key={student._id} value={student._id}>
                            {student.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  
                  <Button leftIcon={<FiFilter />} onClick={applyFilters}>
                    Filter
                  </Button>
                </HStack>
                
                {isAdmin && (
                  <Button leftIcon={<FiDownload />} onClick={exportAttendance}>
                    Export
                  </Button>
                )}
              </Flex>
            </Box>
            
            {isLoading ? (
              <Flex justify="center" align="center" height="200px">
                <Spinner size="xl" color="blue.500" />
              </Flex>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" borderWidth="1px" borderColor={borderColor}>
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th>Student</Th>
                      <Th>Bus</Th>
                      <Th>Entry Time</Th>
                      <Th>Exit Time</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {getFilteredData().map((record) => (
                      <Tr key={record._id}>
                        <Td>
                          <Text fontWeight="medium">{record.student.name}</Text>
                          <Text fontSize="sm" color="gray.600">RFID: {record.student.rfidTag}</Text>
                        </Td>
                        <Td>
                          <Text>{record.bus.busId}</Text>
                          <Text fontSize="sm" color="gray.600">{record.bus.name}</Text>
                        </Td>
                        <Td>{record.entryTime?.toLocaleTimeString()}</Td>
                        <Td>{record.exitTime?.toLocaleTimeString() || '-'}</Td>
                        <Td>{getStatusBadge(record.status)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </TabPanel>

          {/* Attendance History Tab */}
          <TabPanel p={0} pt={4}>
            <Box mb={6}>
              <Flex 
                direction={{ base: 'column', md: 'row' }} 
                justify="space-between" 
                align={{ base: 'stretch', md: 'center' }}
                wrap="wrap"
                gap={4}
              >
                <HStack>
                  <FormControl id="date" maxW="200px">
                    <Input 
                      type="date" 
                      value={filters.date}
                      onChange={handleFilterChange}
                    />
                  </FormControl>
                  
                  <FormControl id="busId" maxW="200px">
                    <Select 
                      placeholder="Select Bus" 
                      value={filters.busId}
                      onChange={handleFilterChange}
                    >
                      {buses.map(bus => (
                        <option key={bus._id} value={bus.busId}>
                          {bus.busId} - {bus.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {(isAdmin || !isStudent) && (
                    <FormControl id="studentId" maxW="200px">
                      <Select 
                        placeholder="Select Student" 
                        value={filters.studentId}
                        onChange={handleFilterChange}
                      >
                        {students.map(student => (
                          <option key={student._id} value={student._id}>
                            {student.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  
                  <Button leftIcon={<FiFilter />} onClick={applyFilters}>
                    Filter
                  </Button>
                </HStack>
                
                {isAdmin && (
                  <Button leftIcon={<FiDownload />} onClick={exportAttendance}>
                    Export
                  </Button>
                )}
              </Flex>
            </Box>
            
            {isLoading ? (
              <Flex justify="center" align="center" height="200px">
                <Spinner size="xl" color="blue.500" />
              </Flex>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" borderWidth="1px" borderColor={borderColor}>
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th>Date</Th>
                      <Th>Student</Th>
                      <Th>Bus</Th>
                      <Th>Entry Time</Th>
                      <Th>Exit Time</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {getFilteredData().map((record) => (
                      <Tr key={record._id}>
                        <Td>{record.date.toLocaleDateString()}</Td>
                        <Td>
                          <Text fontWeight="medium">{record.student.name}</Text>
                          <Text fontSize="sm" color="gray.600">RFID: {record.student.rfidTag}</Text>
                        </Td>
                        <Td>
                          <Text>{record.bus.busId}</Text>
                          <Text fontSize="sm" color="gray.600">{record.bus.name}</Text>
                        </Td>
                        <Td>{record.entryTime?.toLocaleTimeString()}</Td>
                        <Td>{record.exitTime?.toLocaleTimeString() || '-'}</Td>
                        <Td>{getStatusBadge(record.status)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </TabPanel>

          {/* Reports Tab (Admin Only) */}
          {isAdmin && (
            <TabPanel p={0} pt={4}>
              <Box borderWidth="1px" borderRadius="lg" p={6} borderColor={borderColor}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Generate Attendance Reports</Heading>
                  
                  <Flex 
                    direction={{ base: 'column', md: 'row' }} 
                    gap={4}
                    wrap="wrap"
                  >
                    <FormControl id="startDate">
                      <FormLabel>Start Date</FormLabel>
                      <Input type="date" />
                    </FormControl>
                    
                    <FormControl id="endDate">
                      <FormLabel>End Date</FormLabel>
                      <Input type="date" />
                    </FormControl>
                  </Flex>
                  
                  <Flex 
                    direction={{ base: 'column', md: 'row' }} 
                    gap={4}
                    wrap="wrap"
                  >
                    <FormControl id="reportBusId">
                      <FormLabel>Bus</FormLabel>
                      <Select placeholder="All Buses">
                        {buses.map(bus => (
                          <option key={bus._id} value={bus.busId}>
                            {bus.busId} - {bus.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl id="reportStudentId">
                      <FormLabel>Student</FormLabel>
                      <Select placeholder="All Students">
                        {students.map(student => (
                          <option key={student._id} value={student._id}>
                            {student.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl id="reportFormat">
                      <FormLabel>Format</FormLabel>
                      <Select defaultValue="csv">
                        <option value="csv">CSV</option>
                        <option value="excel">Excel</option>
                        <option value="pdf">PDF</option>
                      </Select>
                    </FormControl>
                  </Flex>
                  
                  <Button 
                    leftIcon={<FiDownload />} 
                    colorScheme="blue" 
                    alignSelf="flex-start"
                    onClick={exportAttendance}
                  >
                    Generate Report
                  </Button>
                </VStack>
              </Box>
              
              <Box mt={8} borderWidth="1px" borderRadius="lg" p={6} borderColor={borderColor}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Saved Reports</Heading>
                  
                  <Table variant="simple">
                    <Thead bg={tableHeaderBg}>
                      <Tr>
                        <Th>Report Name</Th>
                        <Th>Date Range</Th>
                        <Th>Generated On</Th>
                        <Th>Format</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>Monthly Attendance - May 2025</Td>
                        <Td>May 1 - May 31, 2025</Td>
                        <Td>May 24, 2025</Td>
                        <Td>Excel</Td>
                        <Td>
                          <IconButton
                            aria-label="Download report"
                            icon={<FiDownload />}
                            size="sm"
                          />
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>Weekly Attendance - Week 20</Td>
                        <Td>May 17 - May 23, 2025</Td>
                        <Td>May 23, 2025</Td>
                        <Td>PDF</Td>
                        <Td>
                          <IconButton
                            aria-label="Download report"
                            icon={<FiDownload />}
                            size="sm"
                          />
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </VStack>
              </Box>
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Attendance;
