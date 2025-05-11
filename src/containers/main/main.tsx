import React, { FC, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import styles from './main.module.css';
import Scene from '../scene';
import AboutUs from '../../components/objects-info/aboutUs';
import WebDev from '../../components/objects-info/webDev';
import MobileDev from '../../components/objects-info/mobileDev';
import StartupDev from '../../components/objects-info/startupDev';
import AutomatDev from '../../components/objects-info/automatDev';
import Tech from '../../components/objects-info/tech';
import LogoOverlay from '../../components/logoOverlay';

const objectInfoComponents: {data: FC, title: string, model: string}[] = [
  {data: AboutUs, title: 'Кто мы?', model: '/models/robot.glb'},
  {data: WebDev, title: 'Веб-разработка', model: '/models/robot2.glb'},
  {data: MobileDev, title: 'Мобильная разработка', model: '/models/robot.glb'},
  {data: StartupDev, title: 'разработка стартапов', model: '/models/robot2.glb'},
  {data: AutomatDev, title: 'Разработка решений для автоматизации', model: '/models/robot.glb'},
  {data: Tech, title: 'Решения и технологии', model: '/models/robot2.glb'}
];

// Главный компонент с Canvas
const Main: FC = () => {
    const [focused, setFocused] = useState(false);
    const [selectedObject, setSelectedObject] = useState<number | null>(null);
    const [handleBack, setHandleBack] = useState<(() => void) | null>(null);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [animationProgress, setAnimationProgress] = useState(0); // Добавляем состояние для прогресса анимации
  
    const handleFocusChange = (focused: boolean) => {
      setFocused(focused);
      if (!focused) {
        setSelectedObject(null);
        setShowInfoPanel(false);
      } else {
        setTimeout(() => setShowInfoPanel(true), 300);
      }
    };

    // Функция для обновления прогресса анимации из Scene
    const handleAnimationProgress = (progress: number) => {
      setAnimationProgress(progress);
    };

    const InfoComponent = selectedObject !== null ? objectInfoComponents[selectedObject].data : null;

    return (
      <div className={styles.container}>
        {/* Добавляем LogoOverlay с передачей прогресса анимации */}
        <LogoOverlay progress={animationProgress} />
        
        <Canvas camera={{ position: [0, 20, 0], fov: 40, near: 0.1, far: 1000 }}>
          <Scene
            objectsList={objectInfoComponents}
            onFocusChange={handleFocusChange}
            setHandleBack={(fn) => setHandleBack(() => fn)}
            setSelectedObject={setSelectedObject}
            onAnimationProgress={handleAnimationProgress} // Передаем колбэк для прогресса
          />
        </Canvas>
        
        {focused && selectedObject !== null && InfoComponent && (
          <>
            <div className={`${styles.infoPanel} ${showInfoPanel ? styles.visible : ''}`}>
              <div className={styles.btnWrapper}>
                  <button className={styles.backButton} onClick={() => handleBack && handleBack()}>
                      Back
                  </button>
              </div>
              <div className={styles.infoPanelContent}>
                <InfoComponent />
              </div>
            </div>
          </>
        )}
      </div>
    );
};

export default Main;