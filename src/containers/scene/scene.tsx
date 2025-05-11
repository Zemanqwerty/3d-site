import React, { FC, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Object from '../../components/object';

interface SceneProps {
    objectsList: {data: FC, title: string, model: string}[];
    onFocusChange: (focused: boolean) => void;
    setHandleBack: (handleBack: () => void) => void;
    setSelectedObject: React.Dispatch<React.SetStateAction<number | null>>;
    onAnimationProgress?: (progress: number) => void;
}

const Scene: FC<SceneProps> = ({ objectsList, onFocusChange, setHandleBack, setSelectedObject, onAnimationProgress }) => {
    const { camera } = useThree();
    const controlsRef = useRef<any>(null);
    const [focused, setFocused] = useState(false);
    const [selectedCube, setSelectedCube] = useState<number | null>(null);
    const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
    const [targetLookAt, setTargetLookAt] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
    const [animationProgress, setAnimationProgress] = useState(0);
    const animationDuration = 3; // 3 секунды анимации

    // Начальная и конечная позиции камеры для анимации
    const startCameraPosition = new THREE.Vector3(0, 15, 0); // Высоко над сценой
    const startLookAt = new THREE.Vector3(0, 20, 0); // Смотрим вверх
    const endCameraPosition = new THREE.Vector3(8, 7, 10); // Финишная позиция
    const endLookAt = new THREE.Vector3(0, 0, 0); // Смотрим на центр сцены

    // Инициализация камеры
    useEffect(() => {
        camera.position.copy(startCameraPosition);
        camera.lookAt(startLookAt);
        controlsRef.current.enabled = false; // Отключаем управление во время анимации
    }, [camera]);

    // Создание объектов по кругу
    const objects = useMemo(() => {
        return Array.from({ length: objectsList.length }, (_, index) => {
            const angle = (index / objectsList.length) * Math.PI * 2;
            const radius = 5;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            return { 
                position: [x, 0, z] as [number, number, number], 
                index, 
                title: objectsList[index].title, 
                model: objectsList[index].model 
            };
        });
    }, [objectsList]);

    // Фокусировка на объекте
    const handleFocus = (position: [number, number, number], index: number) => {
        // Не позволяем фокусироваться во время стартовой анимации
        if (animationProgress < 1) return;

        setFocused(true);
        onFocusChange(true);
        setSelectedObject(index);
        setSelectedCube(index);
        
        const objectPosition = new THREE.Vector3(position[0], position[1], position[2]);
        const cameraOffset = new THREE.Vector3(-2, 2, 3);
        const newCameraPosition = objectPosition.clone().add(cameraOffset);
        
        setTargetPosition(newCameraPosition);
        setTargetLookAt(new THREE.Vector3(
            position[0] - 1,
            position[1] + 0.5,
            position[2]
        ));
    };

    // Возврат к общему виду
    const handleBack = useCallback(() => {
        if (animationProgress < 1) return;

        setFocused(false);
        onFocusChange(false);
        setSelectedObject(null);
        setSelectedCube(null);
        setTargetPosition(endCameraPosition.clone());
        setTargetLookAt(endLookAt.clone());
        
        if (controlsRef.current) {
            controlsRef.current.enabled = true;
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
        }
    }, [onFocusChange, setSelectedObject, animationProgress]);

    // Передаем handleBack в родительский компонент
    useEffect(() => {
        setHandleBack(handleBack);
    }, [handleBack, setHandleBack]);

    // Анимация камеры
    useFrame((state, delta) => {
        // Стартовая анимация
        if (animationProgress < 1) {
            const newProgress = Math.min(animationProgress + (delta / animationDuration), 1);
            setAnimationProgress(newProgress);

            if (onAnimationProgress) {
                onAnimationProgress(newProgress);
            }

            // Плавная интерполяция с ease-out эффектом
            const easedProgress = 1 - Math.pow(1 - newProgress, 3);

            // Интерполяция позиции
            camera.position.lerpVectors(
                startCameraPosition,
                endCameraPosition,
                easedProgress
            );

            // Интерполяция точки взгляда
            const currentLookAt = new THREE.Vector3().lerpVectors(
                startLookAt,
                endLookAt,
                easedProgress
            );
            camera.lookAt(currentLookAt);

            // Включаем контролы по завершении анимации
            if (newProgress >= 1 && controlsRef.current) {
                controlsRef.current.enabled = true;
                controlsRef.current.update();
            }

            return;
        }

        // Обычная логика после стартовой анимации
        if (focused && targetPosition) {
            // Плавное перемещение камеры к цели в режиме фокуса
            camera.position.lerp(targetPosition, 0.1);
            camera.lookAt(targetLookAt);
            camera.updateProjectionMatrix();
            
            // Отключаем OrbitControls при фокусе
            if (controlsRef.current) {
                controlsRef.current.enabled = false;
            }
        } else if (!focused && targetPosition) {
            // Возвращение камеры в исходное положение
            camera.position.lerp(targetPosition, 0.1);
            camera.lookAt(targetLookAt);
            camera.updateProjectionMatrix();
            
            // Проверяем завершение анимации возврата
            if (camera.position.distanceTo(targetPosition) < 0.1) {
                setTargetPosition(null);
                if (controlsRef.current) {
                    controlsRef.current.enabled = true;
                    controlsRef.current.update();
                }
            }
        }
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight
                position={[2, 10, 2]}
                intensity={8}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.5} />
            
            {objects.map((obj) => (
                <Object
                    key={obj.index}
                    position={obj.position}
                    index={obj.index}
                    title={obj.title}
                    isSelected={selectedCube === obj.index}
                    onFocus={(position) => handleFocus(position, obj.index)}
                    showLabel={animationProgress >= 1} // Показываем метки только после анимации
                    model={obj.model}
                />
            ))}
            
            <OrbitControls
                ref={controlsRef}
                enablePan={false}
                minDistance={5}
                maxDistance={20}
                target={[0, 0, 0]}
                enabled={!focused && animationProgress >= 1}
            />
        </>
    );
};

export default Scene;