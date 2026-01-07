#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>

// ====== Wi-Fi + API CONFIG ======
const char* WIFI_SSID     = "Nord";
const char* WIFI_PASSWORD = "Abhishek1290";
const char* API_BASE_URL  = "http://localhost:5000/api/rfid";
const char* BUS_ID        = "BUS-001";

// ====== PIN CONFIG ======
// RC522 wiring (uses VSPI by default)
constexpr uint8_t SS_PIN  = 5;   // SDA
constexpr uint8_t RST_PIN = 27;  // RST

// Servo pin
constexpr uint8_t SERVO_PIN = 14;

// ====== OBJECTS ======
MFRC522 rfid(SS_PIN, RST_PIN);
Servo doorServo;
HTTPClient http;

// ====== DOOR SETTINGS ======
constexpr uint16_t DOOR_OPEN_ANGLE = 90;
constexpr uint16_t DOOR_LOCK_ANGLE = 0;
constexpr uint32_t DOOR_OPEN_DURATION_MS = 4000; // keep door open for 4 seconds

// ====== HELPERS ======
String uidToString(const MFRC522::Uid* uid) {
  String result;
  for (byte i = 0; i < uid->size; i++) {
    if (uid->uidByte[i] < 0x10) {
      result += "0";
    }
    result += String(uid->uidByte[i], HEX);
  }
  result.toUpperCase();
  return result;
}

void setDoorState(bool allowEntry) {
  if (allowEntry) {
    Serial.println("[DOOR] Opening...");
    doorServo.write(DOOR_OPEN_ANGLE);
    delay(DOOR_OPEN_DURATION_MS);
    Serial.println("[DOOR] Closing...");
  } else {
    Serial.println("[DOOR] Locked.");
  }
  doorServo.write(DOOR_LOCK_ANGLE);
}

bool postScanToApi(const String& uid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Not connected!");
    return false;
  }

  String endpoint = String(API_BASE_URL) + "/";
  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> payload;
  payload["uid"] = uid;
  payload["busId"] = BUS_ID;
  payload["timestamp"] = millis();

  String requestBody;
  serializeJson(payload, requestBody);

  Serial.print("[HTTP] POST -> ");
  Serial.println(requestBody);

  int statusCode = http.POST(requestBody);
  String response = http.getString();

  Serial.print("[HTTP] Status: ");
  Serial.println(statusCode);
  Serial.print("[HTTP] Body: ");
  Serial.println(response);

  bool allowEntry = false;

  StaticJsonDocument<512> doc;
  DeserializationError err = deserializeJson(doc, response);
  if (!err) {
    allowEntry = doc["allowEntry"] | (statusCode >= 200 && statusCode < 300);
    const char* message = doc["message"] | "";
    Serial.print("[API] Message: ");
    Serial.println(message);
  } else {
    Serial.print("[JSON] Parse error: ");
    Serial.println(err.f_str());
  }

  http.end();

  if (statusCode == 402) {
    // Payment pending, ensure lock stays closed even if allowEntry flag missing
    return false;
  }

  return allowEntry && statusCode > 0 && statusCode < 300;
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[WIFI] Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("[WIFI] Connected: ");
  Serial.println(WiFi.localIP());
}

void setup() {
  Serial.begin(115200);
  SPI.begin();                 // Initialize SPI bus
  rfid.PCD_Init();             // Init MFRC522

  doorServo.setPeriodHertz(50); // 50Hz for analog servos
  doorServo.attach(SERVO_PIN);
  doorServo.write(DOOR_LOCK_ANGLE);

  connectWiFi();
  Serial.println("[SETUP] Ready. Scan an RFID card...");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  String uid = uidToString(&rfid.uid);
  Serial.print("[RFID] UID -> ");
  Serial.println(uid);

  bool allowEntry = postScanToApi(uid);
  setDoorState(allowEntry);

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  delay(500); // debounce delay between scans
}



