"use client";
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";

interface Sub {
  plan: string;
  price: number;
  status: string;
  endDate?: string;
  checkoutUrl?: string;
}

export default function SubscriptionPage() {
  const [sub, setSub] = useState<Sub | null>(null);

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((r) => r.json())
      .then((d) => setSub(d.subscription))
      .catch(console.error);
  }, []);

  const subscribe = async () => {
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "basic", price: 4.99, currency: "USD" })
    });
    const { checkoutUrl } = await res.json();
    window.location.href = checkoutUrl;
  };

  const cancel = async () => {
    await fetch("/api/subscriptions", { method: "DELETE" });
    setSub((s) => s && { ...s, status: "cancelled" });
  };

  if (!sub) return <p>Cargando...</p>;

  return (
    <div className={styles.container}>
      <h1>Mi Suscripción</h1>
      <p>Plan: {sub.plan} — ${sub.price}/mes</p>
      <p>Estado: {sub.status}</p>
      {sub.status === "active" ? (
        <button onClick={cancel}>Cancelar Suscripción</button>
      ) : (
        <button onClick={subscribe}>Suscribirme $4.99/mes</button>
      )}
    </div>
  );
}
