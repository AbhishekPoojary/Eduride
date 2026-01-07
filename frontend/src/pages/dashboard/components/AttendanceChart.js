import React from 'react';
import {
  Box,
  Flex,
  Text,
  Skeleton,
  useColorModeValue
} from '@chakra-ui/react';

const AttendanceChart = ({ isLoading }) => {
  // Mock data for the chart
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const attendanceData = [85, 92, 88, 90, 78, 45, 30]; // Percentage of students present

  const maxValue = Math.max(...attendanceData);
  const chartHeight = 200;
  
  const barColor = useColorModeValue('blue.500', 'blue.300');
  const barHoverColor = useColorModeValue('blue.600', 'blue.400');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const gridColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Skeleton isLoaded={!isLoading} height={isLoading ? '250px' : 'auto'}>
      <Box pt={4}>
        {/* Chart grid lines */}
        <Box position="relative" height={`${chartHeight}px`} mb={2}>
          {[0, 25, 50, 75, 100].map((tick) => (
            <Box
              key={tick}
              position="absolute"
              left={0}
              right={0}
              bottom={`${(tick / 100) * chartHeight}px`}
              height="1px"
              bg={gridColor}
              zIndex={1}
            />
          ))}
          
          {/* Chart bars */}
          <Flex height="100%" align="flex-end" justify="space-between" position="relative" zIndex={2}>
            {attendanceData.map((value, index) => (
              <Flex 
                key={index} 
                direction="column" 
                align="center" 
                height="100%" 
                flex={1}
              >
                <Box
                  height={`${(value / 100) * chartHeight}px`}
                  width="60%"
                  bg={barColor}
                  borderRadius="sm"
                  transition="all 0.2s"
                  _hover={{ bg: barHoverColor, transform: 'translateY(-2px)' }}
                  position="relative"
                >
                  <Text
                    position="absolute"
                    top="-25px"
                    left="50%"
                    transform="translateX(-50%)"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {value}%
                  </Text>
                </Box>
              </Flex>
            ))}
          </Flex>
        </Box>
        
        {/* X-axis labels */}
        <Flex justify="space-between" px={2}>
          {weekdays.map((day, index) => (
            <Text key={index} fontSize="sm" color={textColor} textAlign="center" flex={1}>
              {day}
            </Text>
          ))}
        </Flex>
        
        {/* Legend */}
        <Flex justify="center" mt={6}>
          <Flex align="center" mr={4}>
            <Box width="12px" height="12px" bg={barColor} borderRadius="sm" mr={2} />
            <Text fontSize="sm" color={textColor}>Attendance</Text>
          </Flex>
        </Flex>
      </Box>
    </Skeleton>
  );
};

export default AttendanceChart;
