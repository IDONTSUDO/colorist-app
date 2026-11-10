import { registerSW } from "virtual:pwa-register";
import { notification } from "antd";
import { createElement } from "react";

// Как часто спрашивать сервер о новой версии, пока вкладка открыта.
// Приложение одностраничное (hash-роутинг), сам браузер проверяет sw.js
// только при полной загрузке страницы — поэтому проверяем вручную.
const CHECK_INTERVAL_MS = 60 * 1000;
const NOTIFICATION_KEY = "pwa-update";

export const setupPwaUpdates = () => {
  if (!("serviceWorker" in navigator)) return;

  let isUpdateReady = false;

  const updateSW = registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      const check = () => {
        // офлайн или вкладка в фоне — не дёргаем сеть зря
        if (!navigator.onLine || document.visibilityState !== "visible") return;
        registration.update().catch(() => {});
      };
      window.setInterval(check, CHECK_INTERVAL_MS);
      document.addEventListener("visibilitychange", check);
      window.addEventListener("focus", check);
      window.addEventListener("online", check);
    },
    onNeedRefresh() {
      isUpdateReady = true;
      // вкладка не на экране — обновляемся сразу, пользователь ничего не заметит
      if (document.visibilityState !== "visible") {
        updateSW(true);
        return;
      }
      notification.info({
        key: NOTIFICATION_KEY,
        message: "Доступна новая версия",
        description: "Обновите страницу, чтобы получить последние изменения.",
        duration: 0,
        placement: "bottomRight",
        btn: createElement(
          "button",
          {
            onClick: () => {
              notification.close(NOTIFICATION_KEY);
              updateSW(true);
            },
            style: {
              padding: "6px 14px",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
              color: "#fff",
              background: "#4f46e5",
            },
          },
          "Обновить",
        ),
      });
    },
  });

  // если пользователь отложил обновление — применим, когда уйдёт со вкладки
  document.addEventListener("visibilitychange", () => {
    if (isUpdateReady && document.visibilityState === "hidden") updateSW(true);
  });
};
