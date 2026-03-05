// src/components/serverStatus/ServerStatus.jsx
import React, { useEffect, useState } from "react";
import styles from "./ServerStatus.module.css";
import { API_URL } from "../utils/api/config";

export default function ServerStatus() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let isMounted = true;

    const checkServer = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const res = await fetch(`${API_URL}/api/status/ping`, {
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (!isMounted) return;

        if (res.ok) {
          setStatus("ok");
        } else {
          setStatus("warn");
        }
      } catch (err) {
        if (!isMounted) return;

        if (err.name === "AbortError") {
          setStatus("warn");
        } else {
          setStatus("error");
        }
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const icons = {
    checking: "⏳",
    ok: "🟢",
    warn: "🟡",
    error: "🔴"
  };

  const messages = {
    checking: "Проверка...",
    ok: "Сервер подключён",
    warn: "Сервер не отвечает",
    error: "Сервер недоступен"
  };

  return (
    <div className={`${styles.status} ${styles[status]}`}>
      <span className={styles.icon}>{icons[status]}</span>
      <span>{messages[status]}</span>
    </div>
  );
}
