// src/hooks/useAutoLogout.ts
"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

/**
 * Hook que fuerza el logout tras `timeoutMinutes` minutos
 * sin ningún evento de usuario (clic, teclas, movimiento de ratón, scroll).
 */
export function useAutoLogout(timeoutMinutes = 10) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];

    // Reinicia (o inicia) el temporizador de inactividad
    const resetTimeout = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        // Pasaron timeoutMinutes minutos sin eventos → cerramos sesión
        signOut({ callbackUrl: "/login" });
      }, timeoutMinutes * 60 * 1000);
    };

    // Al montar: arrancamos el primer timer
    resetTimeout();

    // Cada vez que detectamos alguno de los eventos, reiniciamos el timer
    events.forEach((ev) => window.addEventListener(ev, resetTimeout));

    return () => {
      // Limpieza al desmontar
      events.forEach((ev) => window.removeEventListener(ev, resetTimeout));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [timeoutMinutes]);
}
