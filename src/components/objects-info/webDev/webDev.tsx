import React, { FC } from "react";
import styles from './webDev.module.css'

const WebDev:FC = () => {
    return (
        <>
            <h2 className={styles.title}>Разработка веб-приложений</h2>
            <p className={styles.text}>Тут какой-то текст о вебе</p>
        </>
    )
}

export default WebDev;