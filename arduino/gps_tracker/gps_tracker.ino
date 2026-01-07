#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <TinyGPSPlus.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// Firebase helper headers (come with the Firebase_ESP_Client library)
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// ------------- WiFi -------------
const char* ssid     = "TestWifi";
const char* password = "12345678";

// ------------- Firebase -------------
#define API_KEY       "AIzaSyDsRvHkE1reVjxDqS2w-tnboWnzilfSjqw"
#define DATABASE_URL  "https://eduride-22bd0-default-rtdb.asia-southeast1.firebasedatabase.app/"

// Bus / device ID in Realtime DB: /devices/<DEVICE_ID>/history/...
const char* DEVICE_ID = "ESP_TEST";

FirebaseData   fbdo;
FirebaseAuth   auth;
FirebaseConfig config;

// ------------- GPS -------------
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

#define GPS_RX    21
#define GPS_TX    22
#define GPS_BAUD  9600

// ------------- Time (NTP) -------------
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 19800); // IST offset +5:30

// ------------- Upload Interval -------------
unsigned long previousMillis = 0;
const unsigned long interval = 5000;  // 5 seconds

// ------------- WiFi reconnect -------------
void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ WiFi Connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

// ------------- Setup -------------
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n\n==== EduRide ESP32 GPS Tracker ====");

  // WiFi
  connectWiFi();

  // Firebase configuration
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // This lets the library print token status & auto-refresh it
  config.token_status_callback = tokenStatusCallback;
  config.max_token_generation_retry = 5;
  Firebase.reconnectWiFi(true);

  // Anonymous sign-in (make sure Anonymous auth is enabled in Firebase)
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("✅ Anonymous Firebase Auth Success");
  } else {
    Serial.print("❌ Firebase Auth failed: ");
    Serial.println(fbdo.errorReason());
    // don't return; library will retry with token_status_callback
  }

  Firebase.begin(&config, &auth);

  Serial.println("✅ Firebase initialized");

  // GPS serial
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX, GPS_TX);
  Serial.println("✅ GPS Serial started");

  // NTP
  timeClient.begin();
  timeClient.update();
  Serial.println("✅ NTP Client started");
}

// ------------- Helper: print basic GPS status -------------
void printGpsStatus() {
  Serial.print("Fix: ");
  if (gps.location.isValid()) Serial.print("✔ VALID");
  else                        Serial.print("❌ NO FIX");

  Serial.print(" | Sats: ");
  if (gps.satellites.isValid()) Serial.print(gps.satellites.value());
  else                          Serial.print("N/A");

  Serial.print(" | Lat: ");
  if (gps.location.isValid()) Serial.print(gps.location.lat(), 6);
  else                        Serial.print("N/A");

  Serial.print(" | Lon: ");
  if (gps.location.isValid()) Serial.print(gps.location.lng(), 6);
  else                        Serial.print("N/A");

  Serial.println();
}

// ------------- Loop -------------
void loop() {
  // Keep WiFi & Firebase alive
  connectWiFi();
  Firebase.ready();  // handles token refresh etc.

  // Feed GPS data to TinyGPS++
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Debug GPS status every 5 seconds (same as upload interval)
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    printGpsStatus();

    // Only upload when GPS location is valid
    if (gps.location.isValid()) {
      double lat    = gps.location.lat();
      double lon    = gps.location.lng();
      double speed  = gps.speed.kmph();
      int    battery = 100;  // TODO: replace with real battery reading

      timeClient.update();
      String timeStr = timeClient.getFormattedTime();  // HH:MM:SS

      // Build path: /devices/ESP_TEST/history/<millis>
      String path = "/devices/";
      path += DEVICE_ID;
      path += "/history/";
      path += String(millis());

      FirebaseJson json;
      json.set("lat",      lat);
      json.set("lon",      lon);
      json.set("speed",    speed);
      json.set("battery",  battery);
      json.set("timestamp", timeStr);

      Serial.print("Uploading to ");
      Serial.println(path);

      if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &json)) {
        Serial.print("✅ Uploaded: ");
        Serial.print("Lat=");
        Serial.print(lat, 6);
        Serial.print(" Lon=");
        Serial.print(lon, 6);
        Serial.print(" Speed=");
        Serial.print(speed);
        Serial.print(" Time=");
        Serial.println(timeStr);
      } else {
        Serial.print("❌ Firebase error: ");
        Serial.println(fbdo.errorReason());
      }
    } else {
      Serial.println("⚠️ GPS not fixed yet – skipping upload.");
    }
  }
}
