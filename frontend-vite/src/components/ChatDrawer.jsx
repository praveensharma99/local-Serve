import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config/api";

export default function ChatDrawer({ booking, onClose, currentRole, onRead }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const onReadRef = useRef(onRead);

  const currentUser = useMemo(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  }, []);

  const otherPersonName = useMemo(() => {
    if (currentRole === "provider") {
      return booking.customer?.name || "Customer";
    }
    return (
      booking.provider?.user?.name ||
      booking.provider?.User?.name ||
      booking.provider?.category ||
      "Provider"
    );
  }, [booking, currentRole]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    onReadRef.current = onRead;
  }, [onRead]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!booking?.id || !token) return undefined;

    let active = true;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/chat/bookings/${booking.id}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (active && data.success) {
          setMessages(data.messages || []);
        } else if (active) {
          toast.error(data.message || "Could not load chat");
        }
      } catch {
        if (active) toast.error("Could not load chat");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMessages();

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit(
        "join_booking_chat",
        { bookingId: booking.id },
        (response) => {
          if (!response?.success) {
            toast.error(response?.message || "Could not join chat");
            return;
          }
          socket.emit("mark_booking_read", { bookingId: booking.id });
          onReadRef.current?.(booking.id);
        },
      );
    });

    socket.on("booking_message", (message) => {
      if (message.bookingId !== booking.id) return;
      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev;
        return [...prev, message];
      });
      if (String(message.senderId) !== String(currentUser.id)) {
        socket.emit("mark_booking_read", { bookingId: booking.id });
        onReadRef.current?.(booking.id);
      }
    });

    socket.on("booking_messages_read", ({ bookingId, readerId, readAt }) => {
      if (
        bookingId !== booking.id ||
        String(readerId) === String(currentUser.id)
      )
        return;
      setMessages((prev) =>
        prev.map((item) =>
          item.senderId === currentUser.id && !item.readAt
            ? { ...item, readAt }
            : item,
        ),
      );
    });

    socket.on("connect_error", () => {
      toast.error("Chat connection failed");
    });

    return () => {
      active = false;
      socket.disconnect();
      socketRef.current = null;
    };
  }, [booking?.id, currentUser.id]);

  const sendMessage = (e) => {
    e.preventDefault();
    const cleanDraft = draft.trim();
    if (!cleanDraft || sending) return;

    setSending(true);
    socketRef.current?.emit(
      "send_booking_message",
      { bookingId: booking.id, message: cleanDraft },
      (response) => {
        setSending(false);
        if (response?.success) {
          setDraft("");
        } else {
          toast.error(response?.message || "Message not sent");
        }
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-[#0d0e20] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0d0e20]/95 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">
                Booking Chat
              </p>
              <h3 className="text-sm font-black text-white">
                {otherPersonName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-slate-400 transition-all hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
              <p className="text-xs font-bold uppercase tracking-widest">
                Loading chat
              </p>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((item) => {
                const isMine = String(item.senderId) === String(currentUser.id);
                return (
                  <div
                    key={item.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                        isMine
                          ? "rounded-br-md bg-violet-600 text-white"
                          : "rounded-bl-md border border-white/[0.08] bg-white/[0.04] text-slate-200"
                      }`}
                    >
                      {!isMine && (
                        <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-violet-300">
                          {item.sender?.name || otherPersonName}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words text-sm font-semibold leading-relaxed">
                        {item.message}
                      </p>
                      <p
                        className={`mt-1 text-right text-[9px] font-bold ${isMine ? "text-violet-100/70" : "text-slate-500"}`}
                      >
                        {new Date(item.createdAt).toLocaleTimeString("en-IN", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {isMine && (
                          <span
                            className="ml-1.5"
                            title={item.readAt ? "Read" : "Sent"}
                          >
                            {item.readAt ? "✓✓" : "✓"}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                <MessageCircle className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-sm font-bold text-slate-300">
                No messages yet
              </p>
              <p className="mt-1 max-w-xs text-xs text-slate-500">
                Start the conversation about this booking.
              </p>
            </div>
          )}
        </div>

        <form
          onSubmit={sendMessage}
          className="border-t border-white/[0.08] bg-[#0d0e20] p-4"
        >
          <div className="flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-[#12142a] p-2 focus-within:border-violet-500/50">
            <textarea
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) sendMessage(e);
              }}
              placeholder="Type a message..."
              className="max-h-28 flex-1 resize-none bg-transparent px-2 py-2 text-sm font-semibold text-white outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
