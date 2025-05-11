import React from 'react';
import styles from './logoOverlay.module.css';

interface LogoOverlayProps {
  progress: number;
}

const LogoOverlay: React.FC<LogoOverlayProps> = ({ progress }) => {
  // Логотип начинает улетать после 2 секунд (progress > 0.4)
  const isAnimating = progress > 0.1
  const animationPhase = Math.min(1, (progress - 0.1) / 0.6); // 0-1 в течение последних 3 секунд
  
  const opacity = 1 - animationPhase * 1.2; // Быстрее исчезает
  const yOffset = isAnimating ? -window.innerHeight * animationPhase * 1.5 : 0; // Улетает за верх экрана

  return (
    <div 
      className={styles.logoContainer}
      style={{
        opacity,
        transform: `translateY(${yOffset}px)`,
        display: opacity <= 0 ? 'none' : 'flex'
      }}
    >
      <div className={styles.logoText}>{`{logo}`}</div>
    </div>
  );
};

export default React.memo(LogoOverlay);