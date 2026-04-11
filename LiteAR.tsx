import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

interface LiteARProps {
  sensor: any;
  onClose: () => void;
}

const LiteAR: React.FC<LiteARProps> = ({ sensor, onClose }) => {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.error}>Solicitando permiso de cámara...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No se encontró dispositivo de cámara compatible.</Text>
        <TouchableOpacity style={styles.botonCerrar} onPress={onClose}>
          <Text style={styles.botonTexto}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />
      
      {/* Overlay - Dashboard "AR" Lite */}
      <View style={styles.overlay}>
        <View style={styles.panel}>
            <Text style={styles.panelTitulo}>MODO LITE (SIN ARCORE)</Text>
            <Text style={styles.idSensor}>Sensor #{sensor?.id || '...'}</Text>
            
            <View style={styles.fila}>
                <Text style={styles.etiqueta}>Temperatura</Text>
                <Text style={styles.valor}>{sensor?.temperatura || '--'} °C</Text>
            </View>

            <View style={styles.fila}>
                <Text style={styles.etiqueta}>Humedad</Text>
                <Text style={styles.valor}>{sensor?.humedad || '--'} %</Text>
            </View>

            <View style={styles.tagUbicacion}>
                <Text style={styles.ubicacionTexto}>{sensor?.ubicacion}</Text>
            </View>
        </View>
      </View>

      <TouchableOpacity style={styles.botonCerrar} onPress={onClose}>
        <Text style={styles.botonTexto}>VOLVER AL DASHBOARD</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  error: { 
    color: '#fff', 
    textAlign: 'center', 
    marginTop: 20,
    fontSize: 16
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  panel: {
    width: '85%',
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    borderRadius: 25,
    padding: 30,
    borderWidth: 2,
    borderColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20
  },
  panelTitulo: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 5
  },
  idSensor: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 25
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  etiqueta: { color: '#B0BEC5', fontSize: 18 },
  valor: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  tagUbicacion: {
    marginTop: 5,
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'center',
    paddingHorizontal: 25
  },
  ubicacionTexto: { color: '#90CAF9', fontSize: 14, fontWeight: '600' },
  botonCerrar: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(211, 47, 47, 0.9)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 10
  },
  botonTexto: { color: '#fff', fontSize: 15, fontWeight: '900' }
});

export default LiteAR;
