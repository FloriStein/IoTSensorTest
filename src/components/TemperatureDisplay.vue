<template>
  <div>
    <h2>Aktuelle Temperatur</h2>
    <p v-if="temperature !== null">Temperatur: {{ temperature }}°C</p>
    <p v-else>Warte auf Daten...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';
import { useAwsIot, disconnectFromMqtt } from '@/useAwsIot'; // Importiere die composable-Funktion

export default defineComponent({
  name: 'TemperatureDisplay',
  setup() {
    // Verwende die composable-Funktion, um die Temperatur zu bekommen
    const { temperature } = useAwsIot();

    // Trennen der Verbindung beim Verlassen der Komponente
    onUnmounted(() => {
      disconnectFromMqtt();
    });

    // Rückgabe der Temperatur, damit sie im Template verwendet werden kann
    return { temperature };
  }
});
</script>

