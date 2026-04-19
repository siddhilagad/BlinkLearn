import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import "./Chat.css";

const socket = io("http://localhost:5000");

function Chat() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("blinklearn_user"));

  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // null = group
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("group"); // "group" | "private"
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }

    // Register online
    socket.emit("user_online", user.user_id);
    socket.emit("join_group");

    // Fetch all users for contacts
    axios.get("http://localhost:5000/users").then((res) => {
      setUsers(res.data.filter((u) => u.user_id !== user.user_id));
    });

    // Load group messages initially
    loadGroupMessages();

    socket.on("online_users", (ids) => setOnlineUsers(ids.map(String)));

    socket.on("receive_group_message", (msg) => {
      if (activeTab === "group") {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("receive_private_message", (msg) => {
      // Update unread count if not in that chat
      if (!activeChat || activeChat.user_id !== msg.sender_id) {
        const current = parseInt(localStorage.getItem("blinklearn_unread") || "0");
        localStorage.setItem("blinklearn_unread", current + 1);
        window.dispatchEvent(new Event("blinklearn:unreadChanged"));
      } else {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("receive_group_message");
      socket.off("receive_private_message");
      socket.off("online_users");
    };
  }, [activeTab, activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadGroupMessages = async () => {
    const res = await axios.get("http://localhost:5000/messages/group");
    setMessages(res.data);
  };

  const loadPrivateMessages = async (otherUser) => {
    const res = await axios.get(
      `http://localhost:5000/messages/private/${user.user_id}/${otherUser.user_id}`
    );
    setMessages(res.data);
  };

  const handleSelectContact = (contact) => {
    setActiveChat(contact);
    setActiveTab("private");
    loadPrivateMessages(contact);
  };

  const handleSelectGroup = () => {
    setActiveChat(null);
    setActiveTab("group");
    loadGroupMessages();
  };

  const sendMessage = () => {
    if (!newMsg.trim()) return;

    if (activeTab === "group") {
      socket.emit("group_message", {
        sender_id: user.user_id,
        message: newMsg.trim(),
        sender_name: user.name,
      });
    } else {
      socket.emit("private_message", {
        sender_id: user.user_id,
        receiver_id: activeChat.user_id,
        message: newMsg.trim(),
        sender_name: user.name,
      });
    }
    setNewMsg("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!user) return null;

  return (
    <div className="chat-page">

      {/* SIDEBAR */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>💬 Messages</h2>
        </div>

        {/* Group Chat */}
        <div
          className={`chat-contact group-contact ${activeTab === "group" ? "active" : ""}`}
          onClick={handleSelectGroup}
        >
          <div className="chat-avatar group-avatar">🌐</div>
          <div className="chat-contact-info">
            <span className="chat-contact-name">Public Group Chat</span>
            <span className="chat-contact-role">Everyone</span>
          </div>
        </div>

        <div className="chat-divider">Direct Messages</div>

        {/* Contacts */}
        {users.map((u) => (
          <div
            key={u.user_id}
            className={`chat-contact ${activeChat?.user_id === u.user_id ? "active" : ""}`}
            onClick={() => handleSelectContact(u)}
          >
            <div className="chat-avatar-wrap">
              <div className="chat-avatar">
                {u.name?.charAt(0).toUpperCase()}
              </div>
              {onlineUsers.includes(String(u.user_id)) && (
                <span className="chat-online-dot" />
              )}
            </div>
            <div className="chat-contact-info">
              <span className="chat-contact-name">{u.name}</span>
              <span className="chat-contact-role">{u.role}</span>
            </div>
          </div>
        ))}
      </div>

      {/* CHAT AREA */}
      <div className="chat-main">

        {/* Chat Header */}
        <div className="chat-header">
          {activeTab === "group" ? (
            <>
              <div className="chat-avatar group-avatar small">🌐</div>
              <div>
                <h3>Public Group Chat</h3>
                <span className="chat-online-info">
                  {onlineUsers.length} online
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="chat-avatar small">
                {activeChat?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3>{activeChat?.name}</h3>
                <span className="chat-online-info">
                  {onlineUsers.includes(String(activeChat?.user_id))
                    ? "🟢 Online"
                    : "⚫ Offline"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              <p>No messages yet. Say hello! 👋</p>
            </div>
          )}
          {messages.map((msg, idx) => {
            const isMine = msg.sender_id === user.user_id;
            return (
              <div
                key={idx}
                className={`chat-bubble-wrap ${isMine ? "mine" : "theirs"}`}
              >
                {!isMine && (
                  <div className="chat-bubble-avatar">
                    {msg.sender_name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="chat-bubble-col">
                  {!isMine && (
                    <span className="chat-bubble-name">{msg.sender_name}</span>
                  )}
                  <div className={`chat-bubble ${isMine ? "bubble-mine" : "bubble-theirs"}`}>
                    {msg.message}
                  </div>
                  <span className="chat-bubble-time">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-bar">
          <textarea
            className="chat-input"
            placeholder={
              activeTab === "group"
                ? "Message the group..."
                : `Message ${activeChat?.name}...`
            }
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className="chat-send-btn"
            onClick={sendMessage}
            disabled={!newMsg.trim()}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;