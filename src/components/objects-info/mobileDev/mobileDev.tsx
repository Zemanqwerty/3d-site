import React, { FC } from "react";
import styles from './modileDev.module.css'

const MobileDev:FC = () => {
    return (
        <>
            <h2 className={styles.title}>Разработка мобильных приложений</h2>
            <p className={styles.text}>Тут какой-то текст о мобилке</p>
        </>
    )
}

export default MobileDev;