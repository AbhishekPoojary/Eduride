import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Button,
  VStack,
  useToast,
  Divider,
  Icon,
  Flex
} from '@chakra-ui/react';
import { FiSettings, FiBell, FiShield, FiServer } from 'react-icons/fi';

const Settings = () => {
  const toast = useToast();

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your settings have been successfully updated.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={6}>
      <Flex alignItems="center" mb={8}>
        <Icon as={FiSettings} boxSize={6} mr={3} color="blue.500" />
        <Box>
          <Heading size="lg" mb={1}>System Settings</Heading>
          <Text color="gray.600">Configure your EduRide system settings</Text>
        </Box>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Flex align="center" mb={2}>
                <Icon as={FiBell} mr={2} color="blue.500" />
                <Heading size="md">Notification Settings</Heading>
              </Flex>
              <FormControl display="flex" alignItems="center">
                <Switch id="email-alerts" mr={3} defaultChecked />
                <FormLabel htmlFor="email-alerts" mb={0}>
                  Email Alerts
                </FormLabel>
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <Switch id="sms-notifications" mr={3} defaultChecked />
                <FormLabel htmlFor="sms-notifications" mb={0}>
                  SMS Notifications
                </FormLabel>
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <Switch id="push-notifications" mr={3} defaultChecked />
                <FormLabel htmlFor="push-notifications" mb={0}>
                  Push Notifications
                </FormLabel>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Flex align="center" mb={2}>
                <Icon as={FiServer} mr={2} color="blue.500" />
                <Heading size="md">System Configuration</Heading>
              </Flex>
              <FormControl>
                <FormLabel>GPS Update Interval (seconds)</FormLabel>
                <Input type="number" defaultValue={30} />
              </FormControl>
              <FormControl>
                <FormLabel>Data Retention Period (days)</FormLabel>
                <Input type="number" defaultValue={90} />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <Switch id="debug-mode" mr={3} />
                <FormLabel htmlFor="debug-mode" mb={0}>
                  Debug Mode
                </FormLabel>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Flex align="center" mb={2}>
                <Icon as={FiShield} mr={2} color="blue.500" />
                <Heading size="md">Security Settings</Heading>
              </Flex>
              <FormControl>
                <FormLabel>Session Timeout (minutes)</FormLabel>
                <Input type="number" defaultValue={30} />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <Switch id="two-factor" mr={3} />
                <FormLabel htmlFor="two-factor" mb={0}>
                  Two-Factor Authentication
                </FormLabel>
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <Switch id="audit-log" mr={3} defaultChecked />
                <FormLabel htmlFor="audit-log" mb={0}>
                  Enable Audit Log
                </FormLabel>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md" mb={2}>Backup & Maintenance</Heading>
              <Button colorScheme="blue" variant="outline" width="full">
                Backup Database
              </Button>
              <Button colorScheme="blue" variant="outline" width="full">
                Export System Logs
              </Button>
              <Divider />
              <Button colorScheme="red" variant="outline" width="full">
                Clear Cache
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Flex justify="flex-end" mt={6}>
        <Button colorScheme="gray" mr={3}>
          Reset to Default
        </Button>
        <Button colorScheme="blue" onClick={handleSave}>
          Save Changes
        </Button>
      </Flex>
    </Box>
  );
};

export default Settings;
