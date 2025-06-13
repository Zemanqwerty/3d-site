import { Html, useFBX } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { FC, useRef, useEffect, useMemo, useCallback } from "react";
import * as THREE from 'three';
import styles from './object.module.css';

interface ObjectProps {
  position: [number, number, number];
  index: number;
  title: string;
  isSelected: boolean;
  onFocus: (position: [number, number, number]) => void;
  showLabel: boolean;
  model: string;
  scales: { x: number, y: number, z: number };
  positions: { x: number, y: number, z: number };
  focused: boolean;
}

const Object: FC<ObjectProps> = React.memo(({ position, index, title, isSelected, onFocus, showLabel, model, scales, positions, focused = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const fbx = useFBX(model);
  const ring = useFBX('/models/ring.FBX');

  // Храним миксеры для каждой модели
  const fbxMixer = useRef<THREE.AnimationMixer | null>(null);
  const ringMixer = useRef<THREE.AnimationMixer | null>(null);

  // Клонируем и применяем стилизацию главной модели
  const clonedScene = useMemo(() => {
    if (!fbx) return new THREE.Group();

    const clone = fbx.clone();
    clone.scale.set(scales.x, scales.y, scales.z);
    clone.position.set(positions.x, positions.y, positions.z);

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

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
  }, [fbx]);

  // Инициализируем миксер для главной модели
  useEffect(() => {
    if (!clonedScene || !fbx) return;

    const mixer = new THREE.AnimationMixer(clonedScene);
    fbxMixer.current = mixer;

    if ((fbx as any).animations && (fbx as any).animations.length > 0) {
      const action = mixer.clipAction((fbx as any).animations[0]);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
    }

    return () => {
      if (mixer) {
        mixer.stopAllAction();
        mixer.removeEventListener('loop', () => {});
        mixer.removeEventListener('finished', () => {});
      }
    };
  }, [fbx, clonedScene]);

  // Клонируем и применяем стилизацию кольца
  const ringScene = useMemo(() => {
    if (!ring) return new THREE.Group();

    const clone = ring.clone();
    clone.scale.set(0.013, 0.013, 0.013);
    clone.position.set(-7.3, -0.2, 0);

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
    if (fbxMixer.current) fbxMixer.current.update(delta);
    if (ringMixer.current) ringMixer.current.update(delta);

    if (groupRef.current) {
      const targetScale = isSelected ? 1.5 : 1;
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const handleClick = useCallback(() => {
    onFocus(position);
  }, [onFocus, position]);

  if (!fbx) return null;

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      dispose={null}
    >
      <primitive object={clonedScene} />
      <primitive object={ringScene} />

      {showLabel && !focused && (
        <Html position={[0, 2, 0]} center distanceFactor={10}>
          <div className={styles.label}>{title}</div>
        </Html>
      )}
    </group>
  );
});

export default Object;