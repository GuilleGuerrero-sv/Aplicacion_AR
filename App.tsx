import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {ViroARSceneNavigator} from '@reactvision/react-viro';
import ARScene from './ARScene';
import LiteAR from './LiteAR';

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
  const [mostrarAR, setMostrarAR] = useState(false);
  const [mostrarLiteAR, setMostrarLiteAR] = useState(false);
  const [permisoCamara, setPermisoCamara] = useState(false);

  const solicitarPermisoCamara = async (tipo: 'pro' | 'lite') => {
    if (Platform.OS === 'android') {
      try {
        const concedido = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Permiso de Cámara",
            message: "La app necesita acceso a la cámara para la Realidad Aumentada",
            buttonNeutral: "Luego",
            buttonNegative: "Cancelar",
            buttonPositive: "Aceptar"
          }
        );
        if (concedido === PermissionsAndroid.RESULTS.GRANTED) {
          setPermisoCamara(true);
          if (tipo === 'pro') setMostrarAR(true);
          else setMostrarLiteAR(true);
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

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

  useEffect(() => {
    obtenerDatos();
    const intervalo = setInterval(obtenerDatos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  if (mostrarAR && permisoCamara) {
    return (
      <View style={{flex: 1}}>
        <StatusBar hidden={true} />
        <ViroARSceneNavigator
          initialScene={{scene: ARScene as any}}
          viroAppProps={sensor || {}}
          autofocus={true}
        />
        <TouchableOpacity 
          style={styles.botonCerrarAR} 
          onPress={() => setMostrarAR(false)}
        >
          <Text style={styles.botonTexto}>Cerrar AR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (mostrarLiteAR && permisoCamara) {
    return (
      <LiteAR 
        sensor={sensor} 
        onRefresh={obtenerDatos}
        cargando={cargando}
        onClose={() => setMostrarLiteAR(false)} 
      />
    );
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.titulo}>Monitor IoT Premium</Text>

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
            Ultima actualización: {ultimaActualizacion}
          </Text>
        </View>
      ) : (
        <ActivityIndicator size="large" color="#1565C0" />
      )}

      <View style={styles.areaBotones}>
        <TouchableOpacity 
          style={[styles.boton, styles.botonAR]} 
          onPress={() => solicitarPermisoCamara('pro')}
        >
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.botonTexto}>Ver en AR Pro (ARCore)</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.boton, styles.botonLite]} 
          onPress={() => solicitarPermisoCamara('lite')}
        >
          <Text style={styles.botonTexto}>Ver en AR Lite (Sin ARCore)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.botonSecundario} 
          onPress={obtenerDatos}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTextoSecundario}>Actualizar Datos</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1, 
    backgroundColor: '#050510', 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  titulo: {
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 40,
    letterSpacing: 1
  },
  panel: {
    backgroundColor: 'rgba(26, 26, 46, 0.8)', 
    borderRadius: 24, 
    padding: 30, 
    width: '90%', 
    marginBottom: 40, 
    borderWidth: 1.5, 
    borderColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  panelTitulo: {
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#90CAF9', 
    marginBottom: 20, 
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  fila: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 8
  },
  etiqueta: {fontSize: 17, color: '#B0BEC5'},
  valor: {fontSize: 17, fontWeight: 'bold', color: '#fff'},
  actualizacion: {
    fontSize: 13, 
    color: '#78909C', 
    textAlign: 'center', 
    marginTop: 20,
    fontStyle: 'italic'
  },
  areaBotones: {
    width: '90%',
    gap: 15
  },
  boton: {
    paddingVertical: 16, 
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  botonAR: {
    backgroundColor: '#2196F3',
  },
  botonLite: {
    backgroundColor: '#00BCD4',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  botonSecundario: {
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2196F3'
  },
  botonTexto: {
    color: '#fff', 
    fontSize: 17, 
    fontWeight: 'bold'
  },
  botonTextoSecundario: {
    color: '#2196F3', 
    fontSize: 16,
    fontWeight: '500'
  },
  botonCerrarAR: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(211, 47, 47, 0.9)',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5
  }
});