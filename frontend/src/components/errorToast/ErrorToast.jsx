import React from "react";
import styles from "./ErrorToast.module.css";
import { useError } from "@context/ErrorContext.jsx";
export default function ErrorToast() {
  const { error } = useError();
  if (!error) return null;
  return (
    <div className={styles.toast}>
      {error}
    </div>
  );
}
