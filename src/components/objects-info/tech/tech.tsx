import React, { FC } from "react";
import styles from './tech.module.css'

const Tech:FC = () => {
    return (
        <>
            <h2 className={styles.title}>Решения и технологии</h2>
            <p className={styles.text}>Тут какой-то текст о решениях и технологиях</p>
        </>
    )
}

export default Tech;