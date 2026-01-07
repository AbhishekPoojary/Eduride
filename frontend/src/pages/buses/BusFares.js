import React, { useEffect, useMemo, useState } from 'react';
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
  TableContainer,
  Input,
  Select,
  Flex,
  Tag,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import axios from 'axios';

const BusFares = () => {
  const [fares, setFares] = useState([]);
  const [regions, setRegions] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFares = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/fares');
        setFares(response.data.fares || []);
        setRegions(response.data.regions || []);
        setUpdatedAt(response.data.updatedAt || null);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch bus fares');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFares();
  }, []);

  const filteredFares = useMemo(() => {
    return fares.filter((fare) => {
      const matchesRegion = !region || fare.region === region;
      const keyword = search.trim().toLowerCase();
      const matchesSearch =
        !keyword ||
        fare.place.toLowerCase().includes(keyword) ||
        fare.region.toLowerCase().includes(keyword);

      return matchesRegion && matchesSearch;
    });
  }, [fares, region, search]);

  return (
    <Box>
      <Flex align={{ base: 'start', md: 'center' }} justify="space-between" flexDir={{ base: 'column', md: 'row' }} mb={6}>
        <Box mb={{ base: 4, md: 0 }}>
          <Heading size="lg">Bus Fares</Heading>
          <Text color="gray.600">
            Browse the latest fare chart for all pickup regions and stops.
          </Text>
        </Box>
        {updatedAt && (
          <Tag colorScheme="gray" size="lg">
            Updated {new Date(updatedAt).toLocaleDateString()}
          </Tag>
        )}
      </Flex>

      <Flex gap={4} flexDir={{ base: 'column', md: 'row' }} mb={6}>
        <Input
          placeholder="Search by place or region..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          placeholder="All regions"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {regions.map((reg) => (
            <option key={reg} value={reg}>
              {reg}
            </option>
          ))}
        </Select>
      </Flex>

      <Stat mb={4}>
        <StatLabel>Matching Stops</StatLabel>
        <StatNumber>{filteredFares.length}</StatNumber>
        <StatHelpText>Total entries in fare chart</StatHelpText>
      </Stat>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertTitle>Unable to load fares</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Flex minH="40vh" align="center" justify="center">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      ) : (
        <TableContainer borderWidth="1px" borderRadius="lg" borderColor="gray.100">
          <Table variant="striped" colorScheme="gray">
            <Thead>
              <Tr>
                <Th>Region</Th>
                <Th>Place</Th>
                <Th isNumeric>Amount (INR)</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredFares.map((fare) => (
                <Tr key={`${fare.region}-${fare.place}`}>
                  <Td fontWeight="medium">{fare.region}</Td>
                  <Td>{fare.place}</Td>
                  <Td isNumeric>₹ {fare.amount.toLocaleString('en-IN')}</Td>
                </Tr>
              ))}
              {!filteredFares.length && (
                <Tr>
                  <Td colSpan={3} textAlign="center" py={10}>
                    <Text>No fares matching your filters.</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default BusFares;


