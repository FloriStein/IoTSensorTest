import { ref } from 'vue';
import { connect, MqttClient } from 'mqtt';

const AWS_IOT_ENDPOINT = 'wss://a2tnej84qk5j60-ats.iot.eu-central-1.amazonaws.com:443/mqtt';
const CLIENT_ID = `mqtt_${Math.random().toString(16).slice(3)}`;

let client: MqttClient | null = null;

// Erstelle eine reactive Variable, um die Temperatur zu speichern
const temperature = ref<string | null>(null);

export function useAwsIot() {
    // MQTT-Client verbinden
    if (!client) {
        client = connect(AWS_IOT_ENDPOINT, {
            clientId: CLIENT_ID,
            clean: true,
            connectTimeout: 4000,
        });

        client.on('connect', () => {
            console.log('Verbunden mit AWS IoT Core');
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
                // Die empfangene Nachricht wird als String gespeichert
                temperature.value = message.toString();
            }
        });

        client.on('error', (error) => {
            console.error('Verbindungsfehler:', error);
        });
    }

    // Rückgabe der Temperatur und des MQTT-Clients
    return { temperature };
}

export function disconnectFromMqtt() {
    if (client) {
        client.end(false, () => {  // false = Verbindung nicht sofort schließen
            console.log('Verbindung zu AWS IoT Core erfolgreich getrennt');
        });
    } else {
        console.error('Es gibt keine aktive MQTT-Verbindung');
    }
}
