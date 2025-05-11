import React, { FC } from "react";
import styles from './aboutUs.module.css'

const AboutUs:FC = () => {
    return (
        <>
            <h2 className={styles.title}>Кто мы</h2>
            <p className={styles.text}>Тут какой-то текст о нас</p>
        </>
    )
}

export default AboutUs;