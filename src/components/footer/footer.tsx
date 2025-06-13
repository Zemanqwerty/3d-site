import React, { FC } from 'react';
import styles from './footer.module.css';

const Footer: FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.links}>
        <div className={styles.contactUs}>
          <p className={styles.contactUsTitle}>Связаться с нами</p>
          <div className={styles.socialLinks}>
              <a href="https://t.me/your_telegram" target="_blank" rel="noopener noreferrer">
                <svg className={styles.icon} viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.25 1.58-1.32 5.41-1.87 7.19-.14.45-.41.6-.68.61-.23.01-.58-.11-.86-.21l-2.4-1.04-1.03 1.01c-.11.11-.21.21-.38.36l-.36.03-.38-.04c-.5-.13-.99-.5-.99-1.01 0-.12.03-.23.06-.34l2.66-8.2.01-.01c.1-.31.32-.5.57-.5.26 0 .5.16.6.41l1.56 4.11 1.1-3.49c.06-.19.19-.36.35-.46.16-.1.35-.14.54-.12.23.03.43.16.53.36l1.5 3.36.47 1.12.01.01c.12.29.04.61-.19.82-.17.16-.39.24-.62.24z"/>
                </svg>
              </a>
              <a href="https://vk.com/your_vk" target="_blank" rel="noopener noreferrer">
                <svg className={styles.icon} viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-9 18h-2v-7h2v7zm-1-8.272c-.577 0-1-.448-1-1s.423-1 1-1 1 .448 1 1-.423 1-1 1zm8 8.272h-2v-4.5c0-1.1-.9-2-2-2s-2 .9-2 2v4.5h-2v-7h2v1.5c.6-1 1.8-1.7 3-1.7 2.2 0 4 1.8 4 4v3.2z"/>
                </svg>
              </a>
              <a href="tel:+79999999999">
                <svg className={styles.icon} viewBox="0 0 24 24">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
              </a>
              <a href="mailto:info@example.com">
                <svg className={styles.icon} viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </a>
          </div>
        </div>
        <p className={styles.company}>© Company Name {new Date().getFullYear()}</p>
        <a href="#" className={styles.orderLink}>Заказать разработку</a>
      </div>
    </footer>
  );
};

export default Footer;