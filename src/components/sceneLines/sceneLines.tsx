import { useFBX } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { FC, useRef, useEffect, useMemo } from "react";
import * as THREE from 'three';

interface LinesProps {
    position: {x: number, y: number, z: number};
    scale: {x: number, y: number, z: number};
}

const SceneRings: FC<LinesProps> = (props: LinesProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const ring = useFBX('/models/lines.FBX');

  const ringMixer = useRef<THREE.AnimationMixer | null>(null);

  // Клонируем и применяем стилизацию кольца
  const ringScene = useMemo(() => {
    if (!ring) return new THREE.Group();

    const clone = ring.clone();
    clone.scale.set(props.scale.x, props.scale.y, props.scale.z);
    clone.position.set(props.position.x, props.position.y, props.position.z);
    clone.rotateY(150);

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.5,
          roughness: 0.2,
          emissive: 0x0066ff,
          emissiveIntensity: 0.3
        });
      }
    });

    return clone;
  }, [ring]);

  // Инициализируем миксер для кольца
  useEffect(() => {
    if (!ringScene || !ring) return;

    const mixer = new THREE.AnimationMixer(ringScene);
    ringMixer.current = mixer;

    if ((ring as any).animations && (ring as any).animations.length > 0) {
      const action = mixer.clipAction((ring as any).animations[0]);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
      action.timeScale = 0.2;
    }

    return () => {
      if (mixer) {
        mixer.stopAllAction();
        mixer.removeEventListener('loop', () => {});
        mixer.removeEventListener('finished', () => {});
      }
    };
  }, [ring, ringScene]);

  // Обновляем оба миксера на каждом кадре
  useFrame((_, delta) => {
    if (ringMixer.current) ringMixer.current.update(delta);
  });

  return (
    <group
      ref={groupRef}
      dispose={null}
    >
      <primitive object={ringScene} />
    </group>
  );
};

export default SceneRings;