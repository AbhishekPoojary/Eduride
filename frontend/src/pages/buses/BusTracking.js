import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref as dbRef, query, limitToLast, onChildAdded, off } from 'firebase/database';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Select,
  HStack,
  Badge,
  Flex,
  Spinner,
  useColorModeValue,
  Button,
  Icon,
  Input,
  VStack,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FiRefreshCw, FiExternalLink } from 'react-icons/fi';
// axios removed; using Firebase realtime listeners instead

// Memoized iframe to avoid remounts (preserves zoom/state if src unchanged)
const MemoizedIframe = React.memo(function MemoizedIframe({ src, onError, onLoad }) {
  return (
    <iframe
      src={src}
      width="100%"
      height="100%"
      style={{ border: 'none', borderRadius: '8px' }}
      title="Live Bus Tracking Map"
      onError={onError}
      onLoad={onLoad}
      allowFullScreen
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
    />
  );
});

// Configure your external live bus tracking website URL here
const EXTERNAL_MAP_URL = '/gps-tracker.html'; // Local GPS tracker file

// We'll use Google Maps API for the map
const BusTracking = () => {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [externalMapUrl, setExternalMapUrl] = useState(EXTERNAL_MAP_URL);
  const [mapError, setMapError] = useState(false);
  // Map of Bus ID -> Firebase deviceId (persisted in localStorage)
  const [deviceIdMap, setDeviceIdMap] = useState(() => {
    try {
      const saved = localStorage.getItem('deviceIdMap');
  return saved ? JSON.parse(saved) : { BUS001: 'ESP_TEST' };
    } catch (e) {
      return { BUS001: 'ESP_TEST' };
    }
  });
  const [tempDeviceId, setTempDeviceId] = useState('');
  
  // Live location for the selected device (from Firebase)
  const [liveLat, setLiveLat] = useState(null);
  const [liveLng, setLiveLng] = useState(null);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState(null);
  const [liveError, setLiveError] = useState(null);
  // Ticking state to refresh time-ago label
  const [timeAgoTick, setTimeAgoTick] = useState(0);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Mock bus data for demonstration
  const mockBuses = [
    {
      id: 'BUS001',
      name: 'North Campus Express',
      status: 'active',
      currentLocation: {
        lat: 13.34566,
        lng: 75.12345,
        lastUpdated: new Date(Date.now() - 5 * 60000) // 5 minutes ago
      },
      driver: {
        name: 'Rajesh Kumar',
        phone: '+91 9876543210'
      },
      currentStop: 'Engineering Block',
      nextStop: 'Science Block',
      route: {
        name: 'North Campus Route',
        stops: [
          { name: 'Main Gate', arrivalTime: '08:00 AM' },
          { name: 'Engineering Block', arrivalTime: '08:10 AM' },
          { name: 'Science Block', arrivalTime: '08:20 AM' },
          { name: 'Library', arrivalTime: '08:30 AM' },
          { name: 'Hostel Complex', arrivalTime: '08:40 AM' }
        ]
      }
    },
    {
      id: 'BUS002',
      name: 'South Campus Express',
      status: 'active',
      currentLocation: {
        lat: 13.35566,
        lng: 75.13345,
        lastUpdated: new Date(Date.now() - 2 * 60000) // 2 minutes ago
      },
      driver: {
        name: 'Suresh Patel',
        phone: '+91 9876543211'
      },
      currentStop: 'Main Gate',
      nextStop: 'Hostel Complex',
      route: {
        name: 'South Campus Route',
        stops: [
          { name: 'Main Gate', arrivalTime: '08:15 AM' },
          { name: 'Hostel Complex', arrivalTime: '08:25 AM' },
          { name: 'Cafeteria', arrivalTime: '08:35 AM' },
          { name: 'Sports Complex', arrivalTime: '08:45 AM' },
          { name: 'Admin Block', arrivalTime: '08:55 AM' }
        ]
      }
    },
    {
      id: 'BUS003',
      name: 'City Shuttle',
      status: 'maintenance',
      currentLocation: {
        lat: 13.36566,
        lng: 75.14345,
        lastUpdated: new Date(Date.now() - 60 * 60000) // 60 minutes ago
      },
      driver: {
        name: 'Amit Singh',
        phone: '+91 9876543212'
      },
      currentStop: 'Maintenance Bay',
      nextStop: 'N/A',
      route: {
        name: 'City Route',
        stops: [
          { name: 'Main Gate', arrivalTime: '09:00 AM' },
          { name: 'City Center', arrivalTime: '09:20 AM' },
          { name: 'Railway Station', arrivalTime: '09:40 AM' },
          { name: 'Shopping Mall', arrivalTime: '10:00 AM' },
          { name: 'College', arrivalTime: '10:20 AM' }
        ]
      }
    }
  ];

  const fetchBuses = useCallback(() => {
    // Only show loading on first load to prevent iframe overlay/zoom loss
    if (!firstLoadDone) {
      setIsLoading(true);
    }
    
    // In a real app, this would be an API call
    // For demo, we'll use the mock data
    setTimeout(() => {
      setBuses(mockBuses);
      setLastUpdated(new Date());
      if (!firstLoadDone) {
        setIsLoading(false);
        setFirstLoadDone(true);
      }
    }, 1000);
    
    // With a real API, it would look like this:
    // try {
    //   const response = await axios.get('/api/location/all');
    //   setBuses(response.data);
    //   setLastUpdated(new Date());
    // } catch (error) {
    //   console.error('Error fetching buses:', error);
    // } finally {
    //   setIsLoading(false);
    // }
  }, [firstLoadDone]);

  useEffect(() => {
    fetchBuses();
    
    // Set up polling every 30 seconds for real-time updates
    const interval = setInterval(fetchBuses, 30000);
    
    return () => clearInterval(interval);
  }, [fetchBuses]);

  // Ticker to update time-ago label only when we have a selected bus and a valid timestamp
  useEffect(() => {
    if (!selectedBus || !liveUpdatedAt || isNaN(new Date(liveUpdatedAt).getTime())) return;
    const id = setInterval(() => setTimeAgoTick((x) => (x + 1) % 1_000_000), 1000);
    return () => clearInterval(id);
  }, [selectedBus, liveUpdatedAt]);

  // When selected bus changes, preload its mapped deviceId into the input
  useEffect(() => {
    if (selectedBus) {
      setTempDeviceId(deviceIdMap[selectedBus] || '');
    } else {
      setTempDeviceId('');
    }
  }, [selectedBus, deviceIdMap]);

  const handleBusSelect = (e) => {
    setSelectedBus(e.target.value);
  };

  const handleUrlChange = (e) => {
    setExternalMapUrl(e.target.value);
  };

  const handleMapError = () => {
    setMapError(true);
  };

  const handleMapLoad = () => {
    setMapError(false);
  };

  const saveDeviceIdMapping = () => {
    if (!selectedBus) return;
    const next = { ...deviceIdMap };
    const cleaned = (tempDeviceId || '').trim();
    if (cleaned) {
      next[selectedBus] = cleaned;
    } else {
      delete next[selectedBus];
    }
    setDeviceIdMap(next);
    try {
      localStorage.setItem('deviceIdMap', JSON.stringify(next));
    } catch (e) {
      // ignore storage errors
    }
  };

  const selectedDeviceId = deviceIdMap[selectedBus] || (selectedBus || '');
  const iframeUrl = selectedDeviceId
    ? `${externalMapUrl}?deviceId=${encodeURIComponent(selectedDeviceId)}`
    : externalMapUrl;

  // Initialize Firebase app (same config as gps-tracker.html)
  const firebaseConfig = {
    apiKey: 'AIzaSyDsRvHkE1reVjxDqS2w-tnboWnzilfSjqw',
    authDomain: 'eduride-22bd0.firebaseapp.com',
    databaseURL: 'https://eduride-22bd0-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'eduride-22bd0',
    storageBucket: 'eduride-22bd0.appspot.com',
    messagingSenderId: '864101888177',
    appId: '1:864101888177:web:8c32c61be8996d47e2b290',
    measurementId: 'G-Y12KTRYJ83'
  };
  const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const db = getDatabase(firebaseApp);

  // Subscribe in real-time to the latest history child for the selected device
  useEffect(() => {
    setLiveLat(null);
    setLiveLng(null);
    setLiveUpdatedAt(null);
    setLiveError(null);

    if (!selectedDeviceId) return;

    const historyRef = dbRef(db, `/devices/${selectedDeviceId}/history`);
    const q = query(historyRef, limitToLast(1));

    const callback = (snap) => {
      const data = snap.val();
      if (!data || typeof data.lat !== 'number' || typeof data.lon !== 'number') return;
      setLiveLat(data.lat);
      setLiveLng(data.lon);
      const parsed = parseFirebaseTimestamp(data.timestamp);
      setLiveUpdatedAt(parsed || new Date());
    };
    const unsubscribe = onChildAdded(q, callback, (err) => {
      setLiveError(err?.message || 'Realtime listener error');
    });

    return () => {
      try { unsubscribe(); } catch (_) {}
      try { off(historyRef, 'child_added', callback); } catch (_) {}
    };
  }, [db, selectedDeviceId]);

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

  const getTimeAgo = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'just now';
    }
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  // Safely parse Firebase timestamps that may be seconds, milliseconds, or ISO strings
  const parseFirebaseTimestamp = (ts) => {
    if (ts == null) return null;
    let ms = null;
    if (typeof ts === 'number') {
      // Treat < 10^12 as seconds (1970..33658)
      ms = ts < 1e12 ? ts * 1000 : ts;
    } else if (typeof ts === 'string') {
      const num = Number(ts);
      if (!Number.isNaN(num) && ts.trim() !== '') {
        ms = num < 1e12 ? num * 1000 : num;
      } else {
        // Handle time-only strings like 'HH:mm:ss' or 'HH:mm' -> assume today local date
        const timeOnlyFull = /^(\d{2}):(\d{2}):(\d{2})$/;
        const timeOnlyShort = /^(\d{2}):(\d{2})$/;
        let m;
        if ((m = ts.match(timeOnlyFull))) {
          const now = new Date();
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
            parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10), 0);
          return isNaN(d.getTime()) ? null : d;
        }
        if ((m = ts.match(timeOnlyShort))) {
          const now = new Date();
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
            parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
          return isNaN(d.getTime()) ? null : d;
        }
        const parsed = Date.parse(ts);
        if (!Number.isNaN(parsed)) ms = parsed;
      }
    } else if (ts instanceof Date) {
      return isNaN(ts.getTime()) ? null : ts;
    }
    if (ms == null) return null;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  };

  // Get the selected bus details
  const selectedBusDetails = buses.find(bus => bus.id === selectedBus);

  return (
    <Box>
      <Box mb={6}>
        <Heading as="h1" size="xl" mb={2}>
          Bus Tracking
        </Heading>
        <Text color="gray.600">Track the real-time location of all college buses</Text>
      </Box>

      <Flex justify="space-between" align="center" mb={4}>
        <HStack>
          <Text>Select Bus:</Text>
          <Select 
            value={selectedBus} 
            onChange={handleBusSelect} 
            placeholder="All Buses"
            width="200px"
          >
            {buses.map(bus => (
              <option key={bus.id} value={bus.id}>
                {bus.id} - {bus.name}
              </option>
            ))}
          </Select>
        </HStack>
        
        <HStack>
          <Text fontSize="sm" color="gray.500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
          <Button
            size="sm"
            leftIcon={<Icon as={FiRefreshCw} />}
            onClick={fetchBuses}
            isLoading={isLoading}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      {/* Optional: Map Bus -> deviceId controls */}
      {selectedBus && (
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} boxShadow="sm" mb={6}>
          <CardHeader pb={0}>
            <Heading size="sm">Device Mapping for {selectedBus}</Heading>
          </CardHeader>
          <CardBody>
            <HStack spacing={3} align="center">
              <Text minW="120px">Firebase deviceId:</Text>
              <Input
                value={tempDeviceId}
                onChange={(e) => setTempDeviceId(e.target.value)}
                placeholder="e.g., ESP32_Tracker"
                size="sm"
                maxW="300px"
              />
              <Button size="sm" onClick={saveDeviceIdMapping} colorScheme="blue">
                Save Mapping
              </Button>
              {selectedDeviceId && (
                <Button
                  size="sm"
                  leftIcon={<Icon as={FiExternalLink} />}
                  onClick={() => window.open(iframeUrl, '_blank')}
                  variant="outline"
                >
                  Open Tracker for {selectedDeviceId}
                </Button>
              )}
            </HStack>
          </CardBody>
        </Card>
      )}

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Map Card */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} boxShadow="sm">
          <CardHeader pb={0}>
            <Flex justify="space-between" align="center">
              <Heading size="md">Live Map</Heading>
              <Button
                size="sm"
                leftIcon={<Icon as={FiExternalLink} />}
                onClick={() => window.open(iframeUrl, '_blank')}
                colorScheme="blue"
              >
                Open in New Tab
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* URL Configuration - Hidden for local file */}
              <Box display="none">
                <Text fontSize="sm" fontWeight="bold" mb={2}>External Map URL:</Text>
                <Input
                  value={externalMapUrl}
                  onChange={handleUrlChange}
                  placeholder="Enter your live bus tracking website URL"
                  size="sm"
                />
              </Box>
              
              {/* Map Display */}
              {mapError ? (
                <Alert status="error">
                  <AlertIcon />
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">Unable to load external map</Text>
                    <Text fontSize="sm">Please check the URL and ensure the website allows iframe embedding.</Text>
                    <Button
                      size="sm"
                      leftIcon={<Icon as={FiExternalLink} />}
                      onClick={() => window.open(externalMapUrl, '_blank')}
                      colorScheme="red"
                    >
                      Open in New Tab
                    </Button>
                  </VStack>
                </Alert>
              ) : (
                <Box height="400px" bg="gray.100" borderRadius="md" position="relative" overflow="hidden">
                  <MemoizedIframe src={iframeUrl} onError={handleMapError} onLoad={handleMapLoad} />
                  {isLoading && (
                    <Flex
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      justify="center"
                      align="center"
                      bg="rgba(255,255,255,0.4)"
                    >
                      <Spinner size="xl" color="blue.500" />
                    </Flex>
                  )}
                </Box>
              )}
              
              {/* Instructions */}
              <Box bg="green.50" p={3} borderRadius="md" borderLeft="4px" borderColor="green.400">
                <Text fontSize="sm" color="green.800">
                  <strong>🚌 Live GPS Tracker Active!</strong><br/>
                  This map shows real-time bus locations from Firebase. The tracker automatically
                  updates as buses send GPS data. Use the "📍" button on the map to center on your bus.
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Bus Details Card */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} boxShadow="sm">
          <CardHeader pb={0}>
            <Heading size="md">
              {selectedBusDetails ? `${selectedBusDetails.id} Details` : 'Bus Details'}
            </Heading>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <Flex justify="center" align="center" height="400px">
                <Spinner size="xl" color="blue.500" />
              </Flex>
            ) : selectedBusDetails ? (
              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Box>
                    <Heading size="md">{selectedBusDetails.name}</Heading>
                    <Text color="gray.600">{selectedBusDetails.route.name}</Text>
                  </Box>
                  <Badge 
                    colorScheme={getStatusColor(selectedBusDetails.status)} 
                    fontSize="sm" 
                    px={2} 
                    py={1} 
                    borderRadius="full"
                  >
                    {selectedBusDetails.status.charAt(0).toUpperCase() + selectedBusDetails.status.slice(1)}
                  </Badge>
                </Flex>
                
                <SimpleGrid columns={2} spacing={4} mb={4}>
                  <Box>
                    <Text fontWeight="bold">Driver</Text>
                    <Text>{selectedBusDetails.driver.name}</Text>
                    <Text color="gray.600">{selectedBusDetails.driver.phone}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Current Location</Text>
                    <Text>
                      Lat: {liveLat !== null ? liveLat.toFixed(5) : selectedBusDetails.currentLocation.lat}
                    </Text>
                    <Text>
                      Lng: {liveLng !== null ? liveLng.toFixed(5) : selectedBusDetails.currentLocation.lng}
                    </Text>
                    <Text color="gray.600">
                      Updated {liveUpdatedAt ? getTimeAgo(liveUpdatedAt) : getTimeAgo(selectedBusDetails.currentLocation.lastUpdated)}
                    </Text>
                    {liveError && (
                      <Text color="red.500" fontSize="sm">{liveError}</Text>
                    )}
                  </Box>
                </SimpleGrid>
                
                <Box mb={4}>
                  <Text fontWeight="bold">Current Status</Text>
                  <Text>Current Stop: {selectedBusDetails.currentStop}</Text>
                  <Text>Next Stop: {selectedBusDetails.nextStop}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={2}>Route Schedule</Text>
                  {selectedBusDetails.route.stops.map((stop, index) => (
                    <Flex 
                      key={index} 
                      justify="space-between" 
                      py={2} 
                      borderBottomWidth={index < selectedBusDetails.route.stops.length - 1 ? '1px' : '0'}
                      borderColor={borderColor}
                    >
                      <Text>{stop.name}</Text>
                      <Text>{stop.arrivalTime}</Text>
                    </Flex>
                  ))}
                </Box>
              </Box>
            ) : (
              <Flex justify="center" align="center" height="400px" direction="column">
                <Text fontSize="lg" fontWeight="medium" mb={2}>
                  No Bus Selected
                </Text>
                <Text color="gray.600">
                  Please select a bus from the dropdown to view details
                </Text>
              </Flex>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default BusTracking;
