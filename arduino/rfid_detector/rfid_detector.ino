/*
 * EduRide - RFID Detector
 * 
 * This Arduino sketch reads RFID tags using the MFRC522 module
 * and sends the UID to the EduRide backend API via WiFi (ESP8266/ESP32).
 * It's used for tracking student entry and exit from buses.
 * 
 * Hardware:
 * - Arduino Uno/Mega/Nano
 * - MFRC522 RFID Reader
 * - ESP8266/ESP32 WiFi Module
 * - Buzzer (optional)
 * - LEDs (optional)
 * 
 * Connections:
 * MFRC522 RFID Module:
 * - SDA to Arduino pin 10
 * - SCK to Arduino pin 13
 * - MOSI to Arduino pin 11
 * - MISO to Arduino pin 12
 * - IRQ not connected
 * - GND to GND
 * - RST to Arduino pin 9
 * - 3.3V to 3.3V
 * 
 * ESP8266:
 * - VCC to 3.3V
 * - GND to GND
 * - TX to Arduino RX (pin 6 with SoftwareSerial)
 * - RX to Arduino TX (pin 5 with SoftwareSerial)
 * 
 * Buzzer:
 * - Positive to Arduino pin 8
 * - Negative to GND
 * 
 * LEDs:
 * - Success LED: Arduino pin 7 (Green)
 * - Error LED: Arduino pin 4 (Red)
 * - Status LED: Arduino pin 3 (Blue)
 */

#include <SPI.h>
#include <MFRC522.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>

// Define which Arduino board you're using
// Uncomment the appropriate line:
#define ARDUINO_UNO
//#define ARDUINO_MEGA
//#define ARDUINO_NANO

// Define which WiFi module you're using
// Uncomment the appropriate line:
#define ESP8266
//#define ESP32

// RFID Module pins
#define RST_PIN         9          // RFID reset pin
#define SS_PIN          10         // RFID SDA (SS) pin

// ESP8266/ESP32 Module pins
#define WIFI_RX 6
#define WIFI_TX 5

// Buzzer and LED pins
#define BUZZER_PIN      8          // Buzzer pin
#define SUCCESS_LED     7          // Green LED
#define ERROR_LED       4          // Red LED
#define STATUS_LED      3          // Blue LED

// Bus ID (change this for each bus)
const char* BUS_ID = "BUS001";

// WiFi credentials
const char* WIFI_SSID = "YourWiFiSSID";
const char* WIFI_PASSWORD = "YourWiFiPassword";

// API endpoint
const char* API_HOST = "your-eduride-api.com"; // Change to your server address
const int API_PORT = 80; // Change to your server port (80 for HTTP, 443 for HTTPS)
const char* API_PATH = "/api/rfid";

// Cooldown period (in milliseconds) to prevent duplicate scans
const unsigned long COOLDOWN_PERIOD = 5000; // 5 seconds

// Initialize RFID and WiFi Serial
MFRC522 rfid(SS_PIN, RST_PIN);
SoftwareSerial wifiSerial(WIFI_RX, WIFI_TX);

// Variables to store last scanned card and timestamp
String lastCardUID = "";
unsigned long lastScanTime = 0;

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  wifiSerial.begin(115200);
  
  // Initialize SPI bus and RFID reader
  SPI.begin();
  rfid.PCD_Init();
  
  // Initialize pins
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(SUCCESS_LED, OUTPUT);
  pinMode(ERROR_LED, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  
  // Initial LED states
  digitalWrite(SUCCESS_LED, LOW);
  digitalWrite(ERROR_LED, LOW);
  digitalWrite(STATUS_LED, LOW);
  
  Serial.println("EduRide RFID Detector");
  Serial.println("Initializing...");
  
  // Initialize WiFi module
  initWiFi();
  
  // Blink status LED to indicate ready
  blinkLED(STATUS_LED, 3, 200);
  
  Serial.println("Setup complete. Ready to scan RFID cards.");
  Serial.print("RFID Reader version: ");
  rfid.PCD_DumpVersionToSerial();
}

void loop() {
  // Status LED on to indicate system is active
  digitalWrite(STATUS_LED, HIGH);
  
  // Check if a new card is present
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    // Get the UID of the card
    String cardUID = getCardUID();
    
    // Check if this is a different card or cooldown period has passed
    unsigned long currentTime = millis();
    if (cardUID != lastCardUID || (currentTime - lastScanTime >= COOLDOWN_PERIOD)) {
      // Update last card and scan time
      lastCardUID = cardUID;
      lastScanTime = currentTime;
      
      // Beep and blink to indicate successful scan
      beep(100);
      digitalWrite(SUCCESS_LED, HIGH);
      
      // Send RFID data to server
      sendRFIDData(cardUID);
      
      // Turn off success LED after a short delay
      delay(500);
      digitalWrite(SUCCESS_LED, LOW);
    }
    
    // Halt PICC and stop encryption
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }
  
  // Status LED off briefly to indicate system is still running
  digitalWrite(STATUS_LED, LOW);
  delay(100);
}

String getCardUID() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    uid += (rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  
  Serial.print("Card detected! UID: ");
  Serial.println(uid);
  
  return uid;
}

void initWiFi() {
  Serial.println("Connecting to WiFi...");
  digitalWrite(ERROR_LED, HIGH); // Indicate connecting status
  
  // Reset ESP8266
  sendATCommand("AT+RST", 2000);
  
  // Set ESP8266 to station mode
  sendATCommand("AT+CWMODE=1", 1000);
  
  // Connect to WiFi network
  String connectCmd = "AT+CWJAP=\"";
  connectCmd += WIFI_SSID;
  connectCmd += "\",\"";
  connectCmd += WIFI_PASSWORD;
  connectCmd += "\"";
  
  if (sendATCommand(connectCmd, 10000).indexOf("OK") != -1) {
    Serial.println("WiFi connected!");
    digitalWrite(ERROR_LED, LOW);
    digitalWrite(SUCCESS_LED, HIGH);
    delay(1000);
    digitalWrite(SUCCESS_LED, LOW);
  } else {
    Serial.println("WiFi connection failed!");
    // Blink error LED to indicate WiFi connection failure
    blinkLED(ERROR_LED, 5, 200);
  }
}

void sendRFIDData(String uid) {
  Serial.println("Sending RFID data to server...");
  
  // Create JSON payload
  StaticJsonDocument<200> jsonDoc;
  jsonDoc["uid"] = uid;
  jsonDoc["busId"] = BUS_ID;
  jsonDoc["timestamp"] = getISOTimestamp();
  
  String jsonPayload;
  serializeJson(jsonDoc, jsonPayload);
  
  // Establish HTTP connection
  String cmd = "AT+CIPSTART=\"TCP\",\"";
  cmd += API_HOST;
  cmd += "\",";
  cmd += API_PORT;
  
  if (sendATCommand(cmd, 5000).indexOf("OK") == -1) {
    Serial.println("Connection failed!");
    digitalWrite(ERROR_LED, HIGH);
    delay(1000);
    digitalWrite(ERROR_LED, LOW);
    return;
  }
  
  // Prepare HTTP POST request
  String httpRequest = "POST ";
  httpRequest += API_PATH;
  httpRequest += " HTTP/1.1\r\n";
  httpRequest += "Host: ";
  httpRequest += API_HOST;
  httpRequest += "\r\n";
  httpRequest += "Content-Type: application/json\r\n";
  httpRequest += "Content-Length: ";
  httpRequest += jsonPayload.length();
  httpRequest += "\r\n\r\n";
  httpRequest += jsonPayload;
  
  // Send HTTP request
  cmd = "AT+CIPSEND=";
  cmd += httpRequest.length();
  sendATCommand(cmd, 1000);
  
  String response = sendATCommand(httpRequest, 5000);
  
  if (response.indexOf("200 OK") != -1 || response.indexOf("201 Created") != -1) {
    Serial.println("Data sent successfully!");
    // Success indication
    digitalWrite(SUCCESS_LED, HIGH);
    beep(200);
    delay(300);
    digitalWrite(SUCCESS_LED, LOW);
  } else {
    Serial.println("Failed to send data!");
    Serial.println("Response: " + response);
    // Error indication
    digitalWrite(ERROR_LED, HIGH);
    beep(100); delay(100); beep(100);
    delay(300);
    digitalWrite(ERROR_LED, LOW);
  }
  
  // Close connection
  sendATCommand("AT+CIPCLOSE", 1000);
}

String sendATCommand(String command, int timeout) {
  Serial.println("Sending command: " + command);
  wifiSerial.println(command);
  
  String response = "";
  unsigned long startTime = millis();
  
  while (millis() - startTime < timeout) {
    if (wifiSerial.available()) {
      char c = wifiSerial.read();
      response += c;
    }
  }
  
  Serial.println("Response: " + response);
  return response;
}

String getISOTimestamp() {
  // In a real implementation, you would use a real-time clock (RTC)
  // For this example, we'll just return a fixed timestamp
  return "2025-05-24T" + String(random(6, 20)) + ":" + 
         String(random(10, 60)) + ":" + String(random(10, 60)) + "Z";
}

void beep(int duration) {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(duration);
  digitalWrite(BUZZER_PIN, LOW);
}

void blinkLED(int pin, int times, int delayTime) {
  for (int i = 0; i < times; i++) {
    digitalWrite(pin, HIGH);
    delay(delayTime);
    digitalWrite(pin, LOW);
    delay(delayTime);
  }
}
