import React, { FC, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Box } from '@react-three/drei';
import * as THREE from 'three';
import Object from '../../components/object';
import SceneRings from '../../components/sceneLines';

interface SceneProps {
    objectsList: {data: FC, title: string, model: string, scales: {x: number, y: number, z: number}, positions: {x: number, y: number, z: number}}[];
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
    const [linesProgress, setLinesProgress] = useState<number[]>([]);
    const animationDuration = 3;

    const startCameraPosition = new THREE.Vector3(0, 15, 0);
    const startLookAt = new THREE.Vector3(0, 20, 0);
    const endCameraPosition = new THREE.Vector3(8, 7, 10);
    const endLookAt = new THREE.Vector3(0, 0, 0);

    useEffect(() => {
        setLinesProgress(new Array(objectsList.length).fill(0));
    }, [objectsList.length]);

    useEffect(() => {
        camera.position.copy(startCameraPosition);
        camera.lookAt(startLookAt);
        if (controlsRef.current) {
            controlsRef.current.enabled = false;
        }
    }, [camera]);

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
                model: objectsList[index].model,
                scales: objectsList[index].scales,
                positions: objectsList[index].positions
            };
        });
    }, [objectsList]);

    useFrame((state, delta) => {
        if (animationProgress >= 0.5 && linesProgress.some(p => p < 1)) {
            const newLinesProgress = linesProgress.map((progress, idx) => {
                const delay = idx * 0.1;
                if (animationProgress >= 0.5 + delay) {
                    return Math.min(1, progress + delta * 1.5);
                }
                return progress;
            });
            setLinesProgress(newLinesProgress);
        }
    });

    // // Функция для создания точек линий с разной длиной
    // const getLinePoints = (
    //     objPosition: [number, number, number],
    //     progress: number,
    //     lineIndex: number
    // ): [number, number, number][] => {
    //     const lengthMultipliers = [0.8, 0.9, 1.0, 0.9, 0.8];
    //     const spread = 0.15;

    //     const offsetX = (lineIndex - 2) * spread;
    //     const offsetZ = (lineIndex - 2) * spread;

    //     const startPoint: [number, number, number] = [offsetX, 0, offsetZ];

    //     const endPoint: [number, number, number] = [
    //         objPosition[0] * lengthMultipliers[lineIndex] * progress + offsetX,
    //         objPosition[1] * lengthMultipliers[lineIndex] * progress,
    //         objPosition[2] * lengthMultipliers[lineIndex] * progress + offsetZ
    //     ];

    //     return [startPoint, endPoint];
    // };

    const handleFocus = (position: [number, number, number], index: number) => {
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
            position[2] - 2
        ));
    };

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

    useEffect(() => {
        setHandleBack(handleBack);
    }, [handleBack, setHandleBack]);

    useFrame((state, delta) => {
        if (animationProgress < 1) {
            const newProgress = Math.min(animationProgress + (delta / animationDuration), 1);
            setAnimationProgress(newProgress);

            if (onAnimationProgress) {
                onAnimationProgress(newProgress);
            }

            const easedProgress = 1 - Math.pow(1 - newProgress, 3);

            camera.position.lerpVectors(
                startCameraPosition,
                endCameraPosition,
                easedProgress
            );

            const currentLookAt = new THREE.Vector3().lerpVectors(
                startLookAt,
                endLookAt,
                easedProgress
            );
            camera.lookAt(currentLookAt);

            if (newProgress >= 1 && controlsRef.current) {
                controlsRef.current.enabled = true;
                controlsRef.current.update();
            }

            return;
        }

        if (focused && targetPosition) {
            camera.position.lerp(targetPosition, 0.1);
            camera.lookAt(targetLookAt);
            camera.updateProjectionMatrix();
            
            if (controlsRef.current) {
                controlsRef.current.enabled = false;
            }
        } else if (!focused && targetPosition) {
            camera.position.lerp(targetPosition, 0.1);
            camera.lookAt(targetLookAt);
            camera.updateProjectionMatrix();
            
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
            
            {/* Центральный процессор
            <group position={[0, -0.5, 0]}>
                <Box
                    args={[1.5, 0.3, 1.5]}
                    position={[0, 0, 0]}
                    rotation={[0, Math.PI / 4, 0]}
                >
                    <meshStandardMaterial
                        color="#fffff"
                        metalness={0.5}
                        roughness={0.2}
                        emissive="#0066ff"
                        emissiveIntensity={0.3}
                    />
                </Box> */}
            {/* </group> */}

            <group position={[0, -0.5, 0]}>
            <SceneRings 
                position={{x: 0, y: 0.3, z: 0}} 
                scale={{x: 0.5, y: 0.5, z: 0.5}} // Подберите подходящий масштаб
            />
            </group>
                        
            {/* Объекты */}
            {objects.map((obj) => (
                obj.title != "NONE"
                ? <Object
                    key={`object-${obj.index}`}
                    position={obj.position}
                    index={obj.index}
                    title={obj.title}
                    isSelected={selectedCube === obj.index}
                    onFocus={(position) => handleFocus(position, obj.index)}
                    showLabel={animationProgress >= 1}
                    model={obj.model}
                    scales={obj.scales}
                    positions={obj.positions}
                    focused={focused}
                />
                : <></>
            ))}
            
            <OrbitControls
                ref={controlsRef}
                enablePan={false}
                enableZoom={false}
                // enableRotate={false}
                minDistance={5}
                maxDistance={20}
                target={[0, 0, 0]}
                enabled={!focused && animationProgress >= 1}
            />
        </>
    );
};

export default Scene;