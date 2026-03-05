/* src/pages/home/Home.jsx */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

function Home({ theme }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (theme === "dark") {
            navigate("/home-dark"); // путь на страницу-заглушку
        }
    }, [theme, navigate]);

    return (
        <div className={styles.home}>
            <div className={styles.block1}>
                <h2>Добро пожаловать</h2>
                <p>Это главная страница.</p>
            </div>
        </div>
    );
}

export default Home;

