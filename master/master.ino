#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ── WiFi credentials ──
const char* WIFI_SSID     = "antegamhsoufapa";
const char* WIFI_PASSWORD = "12345678";

// ── Server endpoint ──
const char* SERVER_URL = "http://10.47.60.90:5000/node";

// ── Node identity ──
const int NODE_ID = 1;

// ── Pin & sensor configuration ──
#define DHT_PIN   3
#define DHT_TYPE  DHT11

#define SOIL_ANALOG_PIN    1
#define SOIL_DIGITAL_PIN   6
#define PUMP_PIN           7

// ── How often to take a reading (milliseconds) ──
const unsigned long SAMPLE_INTERVAL_MS = 1000UL;

// ── Globals ──
DHT dht(DHT_PIN, DHT_TYPE);

// ── Connect to WiFi ──
void connectWiFi() {
  Serial.printf("Connecting to WiFi \"%s\"", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println(" connected!");
  Serial.print("  IP address: ");
  Serial.println(WiFi.localIP());
}

// ── POST sensor data to server, return sprinkler command ──
bool postSensorData(float temp, float humidity, int moisture,
                    float Nlevel, float Plevel, float Klevel,
                    bool &sprinklerStatus) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WARN] WiFi disconnected – reconnecting...");
    connectWiFi();
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  // Build JSON body
  StaticJsonDocument<256> doc;
  doc["node_id"]  = NODE_ID;
  doc["temp"]     = temp;
  doc["humidity"] = (int)humidity;
  doc["moisture"] = moisture;
  doc["is_open"]  = true;
  doc["Nlevel"]   = Nlevel;
  doc["Plevel"]   = Plevel;
  doc["Klevel"]   = Klevel;

  String payload;
  serializeJson(doc, payload);

  Serial.print("  POST payload: ");
  Serial.println(payload);

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("  Server response (%d): %s\n", httpCode, response.c_str());

    // Parse sprinkler_status from response
    StaticJsonDocument<128> resDoc;
    if (deserializeJson(resDoc, response) == DeserializationError::Ok) {
      if (resDoc.containsKey("sprinkler_status")) {
        sprinklerStatus = resDoc["sprinkler_status"].as<bool>();
      }
    }
    http.end();
    return true;
  } else {
    Serial.printf("  [ERROR] POST failed: %s\n", http.errorToString(httpCode).c_str());
    http.end();
    return false;
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  dht.begin();
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW);

  Serial.println("\n====== Gaia Sensor Node ======");
  connectWiFi();
}

void loop() {
  static unsigned long lastSample = 0;

  if (millis() - lastSample >= SAMPLE_INTERVAL_MS) {
    lastSample = millis();

    float humidity    = dht.readHumidity();
    float temperature = dht.readTemperature();
    int   moisture    = soil_percentage();

    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("[ERROR] DHT11 read failed. Check wiring.");
      return;
    }

    Serial.println("── Reading ──");
    Serial.printf("  Temp          : %.1f °C\n", temperature);
    Serial.printf("  Humidity      : %.1f %%\n", humidity);
    Serial.printf("  Soil Moisture : %d %%\n",   moisture);

    // Placeholder NPK values – replace with real sensor reads
    float Nlevel = 11.0;
    float Plevel = 12.0;
    float Klevel = 13.0;

    // Send data to server and get sprinkler command
    bool sprinklerOn = false;
    if (postSensorData(temperature, humidity, moisture,
                       Nlevel, Plevel, Klevel, sprinklerOn)) {
      digitalWrite(PUMP_PIN, sprinklerOn ? HIGH : LOW);
      Serial.printf("  Pump: %s\n", sprinklerOn ? "ON" : "OFF");
    } else {
      Serial.println("  [WARN] No server response – pump unchanged.");
    }
  }
}

int soil_percentage() {
  int sensorAnalogValue = analogRead(SOIL_ANALOG_PIN);
  int outputValue = map(sensorAnalogValue, 0, 4095, 100, 0);
  return constrain(outputValue, 0, 100);
}