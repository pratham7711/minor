import {
  Box,
  List,
  ListItem,
  Typography,
  Button,
  TextField,
  useMediaQuery,
  Avatar,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const ChatWidget = ({ currentUser }) => {
  const { user } = useSelector((state) => state.user);
  const theme = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width: 900px)");
  const name = `${currentUser.displayName}`;
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [flag, setFlag] = useState(false);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();
  const socket = useRef();

  useEffect(() => {
    const getMessage = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/v1/message/get`, {
          method: "POST",
          headers: {
            "Content-Type": "application/JSON",
          },
          body: JSON.stringify({
            sender: user.id,
            reciever: currentUser._id,
          }),
        });
        const response = await res.json();
        setChatMessages(response);
      } catch (error) {
        console.log(error);
      }
    };
    getMessage();
  }, [currentUser, user.id]);

  useEffect(() => {
    const bottomAnchor = document.getElementById("bottomAnchor");
    bottomAnchor.scrollIntoView();
  }, [flag, chatMessages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behaviour: "smooth" });
  }, [message]);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(`http://localhost:5000/`);
      socket.current.emit("addUser", user.id);
    } // eslint-disable-next-line
  }, [user.id]);

  const sendMsg = async (e) => {
    e.preventDefault();
    const currMessage = {
      myself: true,
      message: message,
    };
    await socket.current.emit("send-msg", {
      to: currentUser._id,
      from: user.id,
      message: message,
    });
    await fetch(`http://localhost:5000/api/v1/message/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/JSON",
      },
      body: JSON.stringify({
        message: message,
        sender: user.id,
        reciever: currentUser._id,
      }),
    });

    setChatMessages(chatMessages.concat(currMessage));
    setMessage("");
    setFlag((prev) => !prev);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({
          myself: false,
          message: msg,
        });
      });
    }
  }, [arrivalMessage]);

  useEffect(() => {
    arrivalMessage && setChatMessages((pre) => [...pre, arrivalMessage]);
  }, [arrivalMessage]);

  return (
    <Box sx={{ height: "88.7vh", paddingRight:"1rem" }}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0.6rem 1rem",
          borderRadius: "1.5rem",
          backgroundColor: theme.palette.mode === "dark" ? "#333333" : "#D8D8D8",
        }}
      >
        <Avatar>{currentUser.displayName[0]}</Avatar>
        <Typography
          sx={{
            paddingLeft: "1rem",
            fontWeight: "bold",
            fontSize: "1.3rem",
            wordBreak: "break-word",
            "&:hover": {
              color: "#00353F",
            },
            cursor: "pointer",
          }}
        >
          {name.length <= 20 ? name : `${name.substring(0, 20)}...`}
        </Typography>
      </Box>
      <Box
        id="chats"
        sx={{
          height: isNonMobileScreens ? "77%" : "55%",
          overflowY: chatMessages.length ? "scroll" : "",
        }}
      >
        <List style={{ display: "flex", flexDirection: "column" }}>
          {chatMessages.map((message, index) => {
            return (
              <ListItem
                key={index}
                style={{
                  marginBottom: "1rem",
                  borderRadius: "1.5rem",
                  display: "flex",
                  justifyContent: message.myself ? "end" : "",
                  // width:"auto",
                  maxWidth: isNonMobileScreens ? "50%" : "80%",
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#333333" : "#D8D8D8",
                  alignSelf: message.myself ? "end" : "",
                }}
                ref={scrollRef}
              >
                {!message.myself && (
                  <Avatar>{currentUser.displayName[0]}</Avatar>
                )}
                <Typography
                  sx={{
                    minHeight: "2.3rem",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: !message.myself ? "0.8rem" : "",
                    wordBreak: "break-word",
                  }}
                >
                  {message.message}
                </Typography>
                {message.myself && (
                  <Avatar sx={{ marginLeft: "1rem" }}>
                    {user.displayName[0]}
                  </Avatar>
                )}
              </ListItem>
            );
          })}
        </List>
        <div id="bottomAnchor"></div>
      </Box>
      <Box>
        <form
          style={{ display: "flex", alignItems: "center" }}
          onSubmit={sendMsg}
        >
          <TextField
            size="small"
            label="Type your message..."
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            name="message"
            error={message.length >= 240}
            helperText={
              message.length >= 240
                ? "Length of your message can not be more than 240 characters!"
                : ""
            }
            sx={{ width: "100%", marginRight: "0.5rem" }}
          />
          <Button
            type="submit"
            sx={{
              m: "1rem 0",
              p: "0.35rem 1rem",
              color: "rgb(255, 0, 0)",
              marginLeft: "0.5rem",
              fontSize: "0.9rem",
              cursor:"pointer",
              "&:hover": {
                color: "rgb(255, 100, 100)",
              },
            }}
            disabled={message.trim().length === 0 || message.length >= 240}
          >
            Send
          </Button>
        </form>
        {/* </Box> */}
      </Box>
    </Box>
  );
};

export default ChatWidget;
