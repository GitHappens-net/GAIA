#include <DHT.h>

// Pin & sensor configuration
#define DHT_PIN   3
#define DHT_TYPE  DHT11

#define SOIL_ANALOG_PIN 1
#define SOIL_DIGITAL_PIN 6

// How often to take a reading (milliseconds)
const unsigned long SAMPLE_INTERVAL_MS = 1000UL;

// Globals
DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  delay(1000);

  dht.begin();

  Serial.println("\n====== Air Sensor Station ======");
}

void loop() {
  static unsigned long lastSample = 0;

  if (millis() - lastSample >= SAMPLE_INTERVAL_MS) {
    lastSample = millis();

    float humidity    = dht.readHumidity();
    float temperature = dht.readTemperature();

    int moisture = soil_percentage();

    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("[ERROR] DHT11 read failed. Check wiring.");
    } else {
      Serial.printf("  Temp          : %.1f °C\n", temperature);
      Serial.printf("  Humidity      : %.1f %%\n", humidity);
      Serial.printf("  Soil Moisture : %d %%\n",   moisture);
    }
  }
}

int soil_percentage() {
  int sensorAnalogValue = analogRead(SOIL_ANALOG_PIN);
  
  int outputValue = 100 - (sensorAnalogValue/4095)*100;

  return outputValue;
}