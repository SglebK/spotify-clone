// src/components/timeZoneSelector/TimeZoneSelector.jsx
import React from 'react';
import styles from './TimeZoneSelector.module.css';

function TimeZoneSelector({ onSelect, className = "" }) {

  const zones = [
    { tz: "Etc/GMT+12", offset: "-12", cities: ["Остров Бейкер", "Остров Хауленд", "—"] },
    { tz: "Pacific/Pago_Pago", offset: "-11", cities: ["Паго-Паго", "Ниуэ", "Мидуэй"] },

    { tz: "Pacific/Honolulu", offset: "-10", cities: ["Гонолулу", "Папеэте", "Раротонга"] },
    { tz: "America/Anchorage", offset: "-9", cities: ["Анкоридж", "Джуно", "Уайтхорс"] },
    { tz: "America/Los_Angeles", offset: "-8", cities: ["Лос-Анджелес", "Сан-Франциско", "Сиэтл"] },
    { tz: "America/Denver", offset: "-7", cities: ["Денвер", "Финикс", "Калгари"] },
    { tz: "America/Mexico_City", offset: "-6", cities: ["Мехико", "Чикаго", "Гватемала"] },
    { tz: "America/New_York", offset: "-5", cities: ["Нью-Йорк", "Торонто", "Гавана"] },
    { tz: "America/Santiago", offset: "-4", cities: ["Сантьяго", "Ла-Пас", "Каракас"] },
    { tz: "America/Buenos_Aires", offset: "-3", cities: ["Буэнос-Айрес", "Монтевидео", "Сан-Паулу"] },
    { tz: "Atlantic/Azores", offset: "-1", cities: ["Азорские острова", "Прая", "Нуук"] },

    { tz: "UTC", offset: "+0", cities: ["Рейкьявик", "Дакар", "Лиссабон"] },

    { tz: "Europe/Paris", offset: "+1", cities: ["Париж", "Берлин", "Рим"] },

    { tz: "Europe/Kyiv", offset: "+2", cities: ["Киев", "Хельсинки", "Афины"] },

    { tz: "Europe/Moscow", offset: "+3", cities: ["Москва", "Тбилиси", "Стамбул"] },

    { tz: "Europe/Samara", offset: "+4", cities: ["Самара", "Баку", "Дубай"] },

    { tz: "Asia/Yekaterinburg", offset: "+5", cities: ["Екатеринбург", "Ташкент", "Карачи"] },

    { tz: "Asia/Omsk", offset: "+6", cities: ["Омск", "Алматы", "Дакка"] },

    { tz: "Asia/Krasnoyarsk", offset: "+7", cities: ["Красноярск", "Бишкек", "Бангкок"] },

    { tz: "Asia/Irkutsk", offset: "+8", cities: ["Иркутск", "Астана", "Шанхай"] },

    { tz: "Asia/Yakutsk", offset: "+9", cities: ["Якутск", "Токио", "Сеул"] },

    { tz: "Asia/Vladivostok", offset: "+10", cities: ["Владивосток", "Сидней", "Мельбурн"] },

    { tz: "Asia/Magadan", offset: "+11", cities: ["Магадан", "Нумеа", "Сахалин"] },

    { tz: "Asia/Kamchatka", offset: "+12", cities: ["Камчатка", "Окленд", "Фиджи"] }
  ];

  return (
    <select
      className={`${styles.timeZoneSelector} ${className}`}
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="">Выберите таймзону</option>

      {zones.map(({ tz, offset, cities }) => (
        <option key={tz} value={tz}>
          {offset} ({cities.join(", ")})
        </option>
      ))}
    </select>
  );
}

export default TimeZoneSelector;
