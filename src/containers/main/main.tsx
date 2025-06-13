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
import Footer from '../../components/footer';
import Header from '../../components/header';

const objectInfoComponents: {data: FC, title: string, model: string, scales: {x: number, y: number, z: number}, positions: {x: number, y: number, z: number}}[] = [
  {data: AboutUs, title: '3D разработка', model: '/models/rocket.FBX', scales: {x:0.01, z:0.01, y:0.01}, positions: {x:-3, z:0, y:0}},
  {data: WebDev, title: 'Веб-разработка', model: '/models/cube.FBX', scales: {x:0.3, z:0.3, y:0.3}, positions: {x:-0.2, z:0.3, y:0.5}},
  {data: Tech, title: 'NONE', model: '/models/cube.FBX', scales: {x:0.3, z:0.3, y:0.3}, positions: {x:-0.2, z:0.3, y:0.5}},
  {data: MobileDev, title: 'Мобильная разработка', model: '/models/rocket.FBX', scales: {x:0.01, z:0.01, y:0.01}, positions: {x:-3, z:0, y:0}},

  {data: StartupDev, title: 'разработка стартапов', model: '/models/cube.FBX', scales: {x:0.3, z:0.3, y:0.3}, positions: {x:-0.2, z:0.3, y:0.5}},
  {data: AutomatDev, title: 'Разработка решений для автоматизации', model: '/models/rocket.FBX', scales: {x:0.01, z:0.01, y:0.01}, positions: {x:-3, z:0, y:0}},
  {data: AutomatDev, title: 'NONE', model: '/models/rocket.FBX', scales: {x:0.01, z:0.01, y:0.01}, positions: {x:-3, z:0, y:0}},
  {data: Tech, title: 'Решения и технологии', model: '/models/cube.FBX', scales: {x:0.3, z:0.3, y:0.3}, positions: {x:-0.2, z:0.3, y:0.5}},
];

const Main: FC = () => {
    const [focused, setFocused] = useState(false);
    const [selectedObject, setSelectedObject] = useState<number | null>(null);
    const [handleBack, setHandleBack] = useState<(() => void) | null>(null);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [animationProgress, setAnimationProgress] = useState(0);
  
    const handleFocusChange = (focused: boolean) => {
      setFocused(focused);
      if (!focused) {
        setSelectedObject(null);
        setShowInfoPanel(false);
      } else {
        setTimeout(() => setShowInfoPanel(true), 300);
      }
    };

    const handleAnimationProgress = (progress: number) => {
      setAnimationProgress(progress);
    };

    const InfoComponent = selectedObject !== null ? objectInfoComponents[selectedObject].data : null;

    return (
      <div className={styles.container}>
        <Header />

        <LogoOverlay progress={animationProgress} />
        
        <Canvas camera={{ position: [0, 20, 0], fov: 40, near: 0.1, far: 1000, up: [0, 1, 0] }}>
          <Scene
            objectsList={objectInfoComponents}
            onFocusChange={handleFocusChange}
            setHandleBack={(fn) => setHandleBack(() => fn)}
            setSelectedObject={setSelectedObject}
            onAnimationProgress={handleAnimationProgress}
          />
        </Canvas>
        
        {focused && selectedObject !== null && InfoComponent && (
          <>
            <div className={`${styles.infoPanel} ${showInfoPanel ? styles.visible : ''}`}>
              <div className={styles.btnWrapper}>
                  <button className={styles.backButton} onClick={() => handleBack && handleBack()}>
                      {'<'}
                  </button>
              </div>
              <div className={styles.infoPanelContent}>
                <InfoComponent />
              </div>
            </div>
          </>
        )}

        <Footer />
      </div>
    );
};

export default Main;