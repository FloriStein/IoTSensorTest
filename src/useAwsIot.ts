import { ref } from 'vue';
import { connect } from 'mqtt';
import fs from 'fs';

// AWS IoT Core Endpoint und Client-ID
const AWS_IOT_ENDPOINT = 'wss://a2tnej84qk5j60-ats.iot.eu-central-1.amazonaws.com:443/mqtt';
const CLIENT_ID = `mqtt_${Math.random().toString(16).slice(3)}`;

// Pfade zu Ihren X.509-Zertifikatdateien
const keyPath = './certs/e90132d7c717daba848d9b009a0ccb3f09f32102d75ed9108a6181530a1189f9-private.pem.key';
const certPath = './certs/e90132d7c717daba848d9b009a0ccb3f09f32102d75ed9108a6181530a1189f9-certificate.pem.crt';
const caPath = './certs/AmazonRootCA1.pem';

// MQTT-Client und reaktive Variable für die Temperatur
let client: ReturnType<typeof connect> | null = null;
const temperature = ref<string | null>(null);

export function useAwsIot() {
    if (!client) {
        // MQTT-Client konfigurieren
        client = connect(AWS_IOT_ENDPOINT, {
            clientId: CLIENT_ID,
            clean: true,
            connectTimeout: 4000,
            protocol: 'mqtts',  // MQTT über TLS
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
            ca: fs.readFileSync(caPath),
            rejectUnauthorized: true
        });

        // Event-Handling
        client.on('connect', () => {
            console.log('Erfolgreich mit AWS IoT Core verbunden.');
            client?.subscribe('esp32/temperatur', (err) => {
                if (!err) {
                    console.log('Abonniert auf esp32/temperatur');
                } else {
                    console.error('Fehler beim Abonnieren:', err);
                }
            });
        });

        client.on('message', (topic, message) => {
            if (topic === 'esp32/temperatur') {
                temperature.value = message.toString();
                console.log(`Temperatur empfangen: ${temperature.value}`);
            }
        });

        client.on('error', (error) => {
            console.error('Verbindungsfehler:', error);
        });
    }

    return { temperature };
}

export function disconnectFromMqtt() {
    if (client) {
        client.end(false, () => {
            console.log('Verbindung zu AWS IoT Core erfolgreich getrennt.');
            client = null; // Setze client wieder auf null
        });
    } else {
        console.error('Es gibt keine aktive MQTT-Verbindung.');
    }
}

