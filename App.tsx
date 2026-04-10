import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';

const API_BASE = 'https://681d1feff74de1d219aeddd5.mockapi.io/sensores';
const TOTAL_SENSORES = 80;

interface Sensor {
  id: string;
  temperatura: number;
  humedad: number;
  ubicacion: string;
  estado: string;
}

export default function App() {
  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [cargando, setCargando] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState('');

  const obtenerDatos = async () => {
  setCargando(true);
  try {
    const idAleatorio = Math.floor(Math.random() * TOTAL_SENSORES) + 1;
    const respuesta = await fetch(`${API_BASE}/${idAleatorio}`);
    const datos = await respuesta.json();
    setSensor(datos);
    setUltimaActualizacion(new Date().toLocaleTimeString());
  } catch (error) {
    console.error('Error al obtener datos:', error);
  } finally {
    setCargando(false);
  }
};

  // Polling cada 5 segundos
  useEffect(() => {
    obtenerDatos();
    const intervalo = setInterval(obtenerDatos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <SafeAreaView style={styles.contenedor}>
      <Text style={styles.titulo}>Monitor IoT AR</Text>

      {sensor ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitulo}>Sensor #{sensor.id}</Text>

          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Temperatura</Text>
            <Text style={styles.valor}>{sensor.temperatura} °C</Text>
          </View>

          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Humedad</Text>
            <Text style={styles.valor}>{sensor.humedad} %</Text>
          </View>

          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Ubicacion</Text>
            <Text style={styles.valor}>{sensor.ubicacion}</Text>
          </View>

          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Estado</Text>
            <Text style={styles.valor}>{sensor.estado}</Text>
          </View>

          <Text style={styles.actualizacion}>
            Ultima actualizacion: {ultimaActualizacion}
          </Text>
        </View>
      ) : (
        <ActivityIndicator size="large" color="#1565C0" />
      )}

      <TouchableOpacity style={styles.boton} onPress={obtenerDatos}>
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonTexto}>Actualizar manualmente</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {flex: 1, backgroundColor: '#0a0a1a', alignItems: 'center', justifyContent: 'center'},
  titulo: {fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 30},
  panel: {backgroundColor: '#1a1a2e', borderRadius: 16, padding: 24, width: '85%', marginBottom: 30, borderWidth: 1, borderColor: '#1565C0'},
  panelTitulo: {fontSize: 18, fontWeight: 'bold', color: '#90CAF9', marginBottom: 16, textAlign: 'center'},
  fila: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12},
  etiqueta: {fontSize: 16, color: '#90A4AE'},
  valor: {fontSize: 16, fontWeight: 'bold', color: '#fff'},
  actualizacion: {fontSize: 12, color: '#546E7A', textAlign: 'center', marginTop: 12},
  boton: {backgroundColor: '#1565C0', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12},
  botonTexto: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
});