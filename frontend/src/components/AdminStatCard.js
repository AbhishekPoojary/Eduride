import React from 'react';
import {
  Card,
  CardBody,
  Flex,
  Box,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Skeleton,
  useColorModeValue
} from '@chakra-ui/react';

const AdminStatCard = ({ label, value, icon, color, helpText, isLoading }) => {
  const cardBg = useColorModeValue(`${color}.50`, `${color}.800`);
  const iconContainerBg = useColorModeValue(`${color}.100`, `${color}.700`);
  const iconColor = useColorModeValue(`${color}.500`, `${color}.200`);
  const labelTextColor = useColorModeValue('gray.600', 'gray.400');
  const helpTextColor = useColorModeValue('gray.500', 'gray.300');
  const valueTextColor = useColorModeValue('gray.800', 'white');

  return (
    <Card bg={cardBg} boxShadow="sm" borderRadius="lg">
      <CardBody>
        <Flex align="center">
          <Box p={3} bg={iconContainerBg} borderRadius="lg" mr={4}>
            <Icon as={icon} boxSize={6} color={iconColor} />
          </Box>
          <Stat>
            <StatLabel color={labelTextColor} fontSize="sm">{label}</StatLabel>
            <Skeleton isLoaded={!isLoading} startColor={`${color}.100`} endColor={`${color}.300`}>
              <StatNumber fontSize="2xl" fontWeight="bold" color={valueTextColor}>{value}</StatNumber>
            </Skeleton>
            {helpText && (
              <Skeleton isLoaded={!isLoading} mt={1} startColor={`${color}.50`} endColor={`${color}.200`}>
                <StatHelpText color={helpTextColor} fontSize="xs">{helpText}</StatHelpText>
              </Skeleton>
            )}
          </Stat>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default AdminStatCard;
