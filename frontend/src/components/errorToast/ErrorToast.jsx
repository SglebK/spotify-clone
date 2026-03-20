import React from "react";
import styles from "./ErrorToast.module.css";
import { useError } from "../../context/error/ErrorContext";

export default function ErrorToast() {
  const { error } = useError();

  if (!error) return null;

  return (
    <div className={styles.toast}>
      {error}
    </div>
  );
}
