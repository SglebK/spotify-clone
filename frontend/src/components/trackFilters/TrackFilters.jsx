import React from "react";
import styles from "./TrackFilters.module.css";

function TrackFilters({
    title = "Управление списком",
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    type,
    setType,
    typeOptions = []
}) {
    return (
        <div className={styles.toolbar}>
            <div className={styles.titleBlock}>
                <p className={styles.label}>{title}</p>
            </div>

            <div className={styles.controls}>
                <label className={styles.control}>
                    <span>Сортировка</span>
                    <select
                        className={styles.select}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="createdAt">По дате</option>
                        <option value="title">По названию</option>
                    </select>
                </label>

                <label className={styles.control}>
                    <span>Порядок</span>
                    <select
                        className={styles.select}
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="desc">Сначала новые</option>
                        <option value="asc">Сначала старые / А-Я</option>
                    </select>
                </label>

                <label className={styles.control}>
                    <span>Тип</span>
                    <select
                        className={styles.select}
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        {typeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        </div>
    );
}

export default TrackFilters;
