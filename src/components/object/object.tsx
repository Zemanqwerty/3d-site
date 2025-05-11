import { Html, useGLTF } from "@react-three/drei";
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
}

const Object: FC<ObjectProps> = React.memo(({ position, index, title, isSelected, onFocus, showLabel, model }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(model);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    useGLTF.preload(model);
  }, [model]);

  useFrame(() => {
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

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      dispose={null}
    >
      <primitive object={clonedScene} />
      
      {showLabel && (
        <Html position={[0, 1, 0]} center>
          <div className={styles.label}>{title}</div>
        </Html>
      )}
    </group>
  );
});

export default Object;