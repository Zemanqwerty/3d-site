import React, { FC } from "react";
import styles from './startupDev.module.css'

const StartupDev:FC = () => {
    return (
        <>
            <h2 className={styles.title}>Разработка стартапов и MVP</h2>
            <p className={styles.text}>Тут какой-то текст о нас</p>
        </>
    )
}

export default StartupDev;