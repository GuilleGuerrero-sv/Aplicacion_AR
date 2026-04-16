import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {
  ViroARScene,
  ViroText,
  ViroFlexView,
  ViroNode,
  ViroAmbientLight,
  ViroTrackingStateConstants,
} from '@reactvision/react-viro';

/**
 * Escena de Realidad Aumentada que muestra los datos del sensor.
 * Recibe 'data' como prop a través de sceneNavigator.viroAppProps
 */
const ARScene = (props: any = {}) => {
  const sensor = props.sceneNavigator.viroAppProps;
  const [textoRastreo, setTextoRastreo] = useState("Buscando superficie...");

  function onInitialized(state: any, reason: any) {
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setTextoRastreo(""); // Rastreo listo
    } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
      setTextoRastreo("Mueve el móvil para escanear");
    }
  }

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
      {/* Luz necesaria para ver objetos 3D */}
      <ViroAmbientLight color="#ffffff" />

      {textoRastreo !== "" && (
        <ViroText
          text={textoRastreo}
          position={[0, 0, -2]}
          style={styles.etiqueta}
          width={2}
          height={1}
        />
      )}

      {/* Panel de datos principal */}
      <ViroNode position={[0, 0, -1]} dragType="FixedToWorld" onDrag={() => {}}>
        <ViroFlexView
          style={styles.panel}
          height={0.5}
          width={0.8}
          position={[0, 0, 0]}>
          
          <ViroText
            text={`SENSOR #${sensor.id || '...'}`}
            style={styles.titulo}
            width={0.8}
            height={0.15}
          />
          
          <ViroFlexView style={styles.fila}>
            <ViroText text="Temperatura:" style={styles.etiqueta} width={0.4} height={0.1} />
            <ViroText 
                text={`${sensor.temperatura || '--'}°C`} 
                style={styles.valor} 
                width={0.3} 
                height={0.1} 
            />
          </ViroFlexView>

          <ViroFlexView style={styles.fila}>
            <ViroText text="Humedad:" style={styles.etiqueta} width={0.4} height={0.1} />
            <ViroText 
                text={`${sensor.humedad || '--'}%`} 
                style={styles.valor} 
                width={0.3} 
                height={0.1} 
            />
          </ViroFlexView>

        </ViroFlexView>
      </ViroNode>
    </ViroARScene>
  );
};

const styles = StyleSheet.create({
  panel: {
    flexDirection: 'column',
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    padding: 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 0.1,
  },
  etiqueta: {
    fontFamily: 'Arial',
    fontSize: 18,
    color: '#90A4AE',
  },
  valor: {
    fontFamily: 'Arial',
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default ARScene;
