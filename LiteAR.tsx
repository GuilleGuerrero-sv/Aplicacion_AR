import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { 
  useSharedValue,
  useAnimatedStyle, 
  interpolate,
} from 'react-native-reanimated';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { accelerometer, SensorTypes, setUpdateIntervalForType } from 'react-native-sensors';

interface LiteARProps {
  sensor: any;
  onRefresh: () => void;
  cargando: boolean;
  onClose: () => void;
}

const LiteAR: React.FC<LiteARProps> = ({ sensor, onRefresh, cargando, onClose }) => {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  // Shared Values para la orientación
  const tiltX = useSharedValue(0); // Inclinación adelante/atrás
  const tiltY = useSharedValue(0); // Inclinación lateral

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }

    // Configurar frecuencia del sensor
    setUpdateIntervalForType(SensorTypes.accelerometer, 20);

    // Suscribirse directamente sin usar pipe/map de rxjs para evitar errores de Metro
    const subscription = accelerometer.subscribe(
        ({ x, y, z }) => {
          // Calculamos los ángulos manualmente aquí para evitar dependencias extra
          const angleX = Math.atan2(z, y) * (180 / Math.PI);
          const angleY = Math.atan2(x, y) * (180 / Math.PI);
          
          tiltX.value = angleX;
          tiltY.value = angleY;
        },
        error => console.log("Error en sensor:", error)
      );

    return () => subscription.unsubscribe();
  }, [hasPermission]);

  const estiloAnimadoPanel = useAnimatedStyle(() => {
    // Calculamos opacidad basada en ambos ejes
    // Si se aleja mucho del centro (0,0), el panel desaparece
    const opacityX = interpolate(
      Math.abs(tiltX.value),
      [0, 45, 90],
      [1, 0.5, 0],
      'clamp'
    );

    const opacityY = interpolate(
      Math.abs(tiltY.value),
      [0, 45, 90],
      [1, 0.5, 0],
      'clamp'
    );

    // Multiplicamos ambas opacidades para un desvanecimiento suave en diagonal también
    const opacity = opacityX * opacityY;

    // Desplazamiento vertical para que el panel se mueva "con" el mundo
    const translateY = interpolate(
      tiltX.value,
      [-90, 0, 90],
      [-300, 0, 300],
      'clamp'
    );

    // Desplazamiento horizontal leve al rotar de lado
    const translateX = interpolate(
      tiltY.value,
      [-45, 0, 45],
      [100, 0, -100],
      'clamp'
    );

    return {
      opacity,
      transform: [
        { translateY: translateY },
        { translateX: translateX },
        { scale: interpolate(opacity, [0, 1], [0.8, 1]) }
      ],
    };
  });

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
      
      {/* Overlay - Dashboard "AR" Lite con Sensores */}
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View style={[styles.panel, estiloAnimadoPanel]}>
            <Text style={styles.panelTitulo}>MODO INMERSIVO (SENSORES)</Text>
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
        </Animated.View>
      </View>

      <View style={styles.controlesInferiores}>
        <TouchableOpacity 
          style={styles.botonActualizar} 
          onPress={onRefresh}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTextoSecundario}>ACTUALIZAR DATOS</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonCerrar} onPress={onClose}>
          <Text style={styles.botonTexto}>VOLVER AL DASHBOARD</Text>
        </TouchableOpacity>
      </View>
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
  controlesInferiores: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
    gap: 15
  },
  botonActualizar: {
    width: '80%',
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2196F3',
    backgroundColor: 'rgba(26, 26, 46, 0.9)'
  },
  botonTextoSecundario: {
    color: '#2196F3', 
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1
  },
  botonCerrar: {
    width: '80%',
    backgroundColor: 'rgba(211, 47, 47, 0.9)',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 10
  },
  botonTexto: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 }
});

export default LiteAR;
