"use client";

import { useEffect, useState } from "react";

type ToastMessage = {
  id: string;
  text: string;
};

export function ToastRegion() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent<{ text: string }>;
      const message = customEvent.detail?.text;

      if (!message) {
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setMessages((current) => [...current, { id, text: message }]);
      window.setTimeout(() => {
        setMessages((current) => current.filter((item) => item.id !== id));
      }, 2600);
    };

    window.addEventListener("echo11:toast", listener);
    return () => window.removeEventListener("echo11:toast", listener);
  }, []);

  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {messages.map((message) => (
        <div key={message.id} className="toast-item">
          {message.text}
        </div>
      ))}
    </div>
  );
}
