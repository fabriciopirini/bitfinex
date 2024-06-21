"use client";

import { useEffect, useRef, useState } from "react";

import { addOrder } from "@/lib/features/orderBookSlice";

import { useAppDispatch } from "@/lib/hooks";
import { ErrorAlert } from "@/app/components/ErrorAlert";

type OutgoingMessage = {
  event: string;
  channel: string;
  symbol: string;
  prec: string;
  freq: string;
  len: string;
};

const RECONNECT_INTERVAL_IN_MS = 5_000;

export const WebsocketControls = () => {
  const dispatch = useAppDispatch();

  const [error, setError] = useState<string | null>(null);
  const [shouldReconnect, setShouldReconnect] = useState(true);

  // Using useRef to store the WebSocket instance and not recreate it on every render
  const socketRef = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    const ws = new WebSocket("wss://api-pub.bitfinex.com/ws/2");

    ws.onopen = () => {
      sendMessage({
        event: "subscribe",
        channel: "book",
        symbol: "tBTCUSD",
        prec: "P0",
        freq: "F0",
        len: "25",
      });
    };

    ws.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      // Ignore messages that are not related to the order book
      if (message[1] === "hb") return;

      // Event messages are not related to the order book as well so ignoring
      if ("event" in message) {
        if (message.event === "error") {
          setError(message?.msg);
        }

        return;
      }

      // Reset error if there is one since orders are being received
      setError(null);

      dispatch(addOrder(message));
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Error while trying to connect to the WebSocket. Please refresh the page and try again.");
    };

    ws.onclose = () => {
      if (shouldReconnect) {
        setTimeout(connectWebSocket, RECONNECT_INTERVAL_IN_MS);
      }
    };

    socketRef.current = ws;
  };

  const sendMessage = (message: OutgoingMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not open. Cannot send message:", message);
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      setShouldReconnect(false);

      // Close websocket connection on unmount
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <div>
      {error && <ErrorAlert message={error} />}
      <div>
        {/* <button aria-label="Connect" onClick={() => dispatch(decrement())}>
          Connect
        </button>
        <span aria-label="Count">{count}</span>
        <button aria-label="Disconnect" onClick={() => dispatch(increment())}>
          Disconnet
        </button> */}
      </div>
    </div>
  );
};
