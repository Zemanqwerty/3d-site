import React, { FC, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import styles from './main.module.css';

// Интерфейс для пропсов объекта
interface ObjectProps {
  position: [number, number, number];
  index: number;
  isSelected: boolean;
  onFocus: (position: [number, number, number]) => void;
  showLabel: boolean;
}

// Интерфейс для пропсов сцены
interface SceneProps {
  onFocusChange: (focused: boolean) => void;
  setHandleBack: (handleBack: () => void) => void;
  setSelectedObject: React.Dispatch<React.SetStateAction<number | null>>;
}

// Компонент одного 3D-объекта (куба)
const Cube: FC<ObjectProps> = ({ position, index, isSelected, onFocus, showLabel }) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Анимация масштаба
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = isSelected ? 1.5 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => onFocus(position)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffffff" />
      {showLabel && (
        <Html position={[0, 1, 0]} center>
          <div className={styles.label}>Object {index + 1}</div>
        </Html>
      )}
    </mesh>
  );
};

// Компонент сцены, содержащий логику камеры и объектов
const Scene: FC<SceneProps> = ({ onFocusChange, setHandleBack, setSelectedObject }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null!);
  const [focused, setFocused] = useState(false);
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
  const [selectedCube, setSelectedCube] = useState<number | null>(null);
  const [isInitialAnimation, setIsInitialAnimation] = useState(true);
  const initialCameraPosition = new THREE.Vector3(3, 5, 10); // Новая конечная позиция со смещением вбок
  const startCameraPosition = new THREE.Vector3(0, 20, 0); // Начальная позиция высоко над сценой
  const animationDuration = 3; // Длительность анимации в секундах
  const animationProgress = useRef(0);

  // Создаем 6 объектов, расположенных по кругу
  const objects = Array.from({ length: 6 }, (_, index) => {
    const angle = (index / 6) * Math.PI * 2;
    const radius = 5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    return { position: [x, 0, z] as [number, number, number], index };
  });

  // Функция фокусировки на объекте
  const handleFocus = (position: [number, number, number], index: number) => {
    setFocused(true);
    onFocusChange(true);
    setSelectedObject(index);
    setSelectedCube(index);
    
    // Создаем вектор позиции объекта
    const objectPosition = new THREE.Vector3(position[0], position[1], position[2]);
    
    // Рассчитываем смещение камеры вправо
    const rightOffset = new THREE.Vector3(2, 0, 0);
    
    // Рассчитываем позицию камеры: сзади и справа от объекта
    const cameraOffset = new THREE.Vector3(-2, 2, 3).add(rightOffset);
    const newCameraPosition = objectPosition.clone().add(cameraOffset);
    
    setTargetPosition(newCameraPosition);
  };

  // Функция возврата к общей сцене
  const handleBack = () => {
    setFocused(false);
    onFocusChange(false);
    setSelectedObject(null);
    setSelectedCube(null);
    setTargetPosition(initialCameraPosition);
    
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Передаем handleBack в Main и устанавливаем начальную ориентацию камеры
  React.useEffect(() => {
    setHandleBack(handleBack);
    camera.position.copy(startCameraPosition);
    camera.lookAt(0, 100, 0); // Камера смотрит вверх
    if (controlsRef.current) {
      controlsRef.current.enabled = false; // Отключаем OrbitControls на старте
    }
  }, []);

  // Анимация камеры
  useFrame((state, delta) => {
    if (isInitialAnimation) {
      // Увеличиваем прогресс на основе времени
      animationProgress.current += delta / animationDuration;
      const t = Math.min(animationProgress.current, 1); // Прогресс от 0 до 1

      // Плавная интерполяция позиции камеры
      const easedT = 1 - Math.pow(1 - t, 3); // Ease-out эффект
      const currentPos = startCameraPosition.clone().lerp(initialCameraPosition, easedT);

      // Вращение вокруг сцены с плавным затуханием
      const angle = easedT * Math.PI; // Вращение на 180 градусов
      const rotationAmplitude = 3 * (1 - easedT); // Амплитуда вращения уменьшается к концу
      currentPos.x += Math.sin(angle) * rotationAmplitude;
      currentPos.z += Math.cos(angle) * rotationAmplitude;

      camera.position.copy(currentPos);

      // Плавный наклон камеры от "вверх" до "на сцену"
      const startLookAt = new THREE.Vector3(0, 100, 0); // Смотрим вверх
      const endLookAt = new THREE.Vector3(0, 0, 0); // Смотрим на центр сцены
      const currentLookAt = startLookAt.clone().lerp(endLookAt, easedT);
      camera.lookAt(currentLookAt);

      // Отладка
    //   console.log('Animation progress:', t, 'Camera position:', camera.position);

      // Проверяем завершение анимации
      if (t >= 1) {
        setIsInitialAnimation(false); // Завершаем начальную анимацию
        camera.position.copy(initialCameraPosition); // Устанавливаем конечную позицию
        camera.lookAt(0, 0, 0);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.enabled = true; // Включаем OrbitControls
          controlsRef.current.update();
        }
      }
    } else {
      // Логика после начальной анимации
      if (targetPosition) {
        camera.position.lerp(targetPosition, 0.1);
        
        // Смотрим на объект, но с небольшим смещением влево
        if (focused && selectedCube !== null) {
          const objectPos = objects[selectedCube].position;
          const lookAtPosition = new THREE.Vector3(
            objectPos[0] - 1, // Смещаем точку взгляда немного влево
            objectPos[1] + 0.5,
            objectPos[2]
          );
          camera.lookAt(lookAtPosition);
        } else {
          camera.lookAt(0, 0, 0);
        }
        
        camera.updateProjectionMatrix();

        if (!focused) {
          const distance = camera.position.distanceTo(targetPosition);
          if (distance < 0.4) {
            setTargetPosition(null);
            camera.position.copy(initialCameraPosition);
            if (controlsRef.current) {
              controlsRef.current.target.set(0, 0, 0);
              controlsRef.current.update();
            }
          }
        }
      }

      if (controlsRef.current) {
        controlsRef.current.enabled = !focused;
        if (!focused && !targetPosition) {
          controlsRef.current.update();
        }
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      
      {objects.map((obj) => (
        <Cube
          key={obj.index}
          position={obj.position}
          index={obj.index}
          isSelected={selectedCube === obj.index}
          onFocus={(position) => handleFocus(position, obj.index)}
          showLabel={!isInitialAnimation} // Показываем метки только после анимации
        />
      ))}
      
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={5}
        maxDistance={20}
        target={[0, 0, 0]}
      />
    </>
  );
};

// Главный компонент с Canvas
const Main: FC = () => {
    const [focused, setFocused] = useState(false);
    const [selectedObject, setSelectedObject] = useState<number | null>(null);
    const [handleBack, setHandleBack] = useState<(() => void) | null>(null);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
  
    const handleFocusChange = (focused: boolean) => {
      setFocused(focused);
      if (!focused) {
        setSelectedObject(null);
        setShowInfoPanel(false);
      } else {
        setTimeout(() => setShowInfoPanel(true), 300);
      }
    };

    return (
        <div className={styles.container}>
          <Canvas camera={{ position: [0, 20, 0], fov: 60, near: 0.1, far: 1000 }}>
            <Scene
              onFocusChange={handleFocusChange}
              setHandleBack={(fn) => setHandleBack(() => fn)}
              setSelectedObject={setSelectedObject}
            />
          </Canvas>
          
          {focused && selectedObject !== null && (
            <>
              <div className={`${styles.infoPanel} ${showInfoPanel ? styles.visible : ''}`}>
                <div className={styles.btnWrapper}>
                    <button className={styles.backButton} onClick={() => handleBack && handleBack()}>
                        Back
                    </button>
                </div>
                <div className={styles.infoPanelContent}>
                  <h2>Object {selectedObject + 1}</h2>
                  <p>Detailed information about this object</p>
                </div>
              </div>
            </>
          )}
        </div>
      );
};

export default Main;