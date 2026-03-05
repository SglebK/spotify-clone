import React from "react";
import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      <h1>404</h1>

      <p className={styles.text}>
        Кажется, вы заблудились…  
      </p>

      <Link to="/" className="button">
        На главную
      </Link>
    </div>
  );
}

