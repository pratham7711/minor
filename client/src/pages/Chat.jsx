import { useSelector } from "react-redux";
import ChatWidget from "../components/common/ChatWidget";
import {
  Box,
  useMediaQuery,
  List,
  ListItem,
  Typography,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MuiGrid from "@mui/material/Grid";
import msgImage from "../components/assets/msg.png";
import { useState } from "react";

const Grid = styled(MuiGrid)(({ theme }) => ({
  width: "100%",
  ...theme.typography.body2,
  '& [role="separator"]': {
    margin: theme.spacing(0, 2),
  },
}));

function Chat() {
    const [currentUser, setCurrentUser] = useState(null);
  const { user } = useSelector((state) => state.user);
  const isNonMobileScreens = useMediaQuery("(min-width: 900px)");

  return (
    <Box sx={{paddingTop:"2rem"}}>
      <Box
        width="100%"
        height={isNonMobileScreens ? "89.5vh" : "70vh"}
        m="0 auto"
        mt="2rem"
        borderRadius="1.5rem"
        // backgroundColor={theme.palette.background.alt}
        sx={{ display: "flex" }}
      >
        <Grid
          container
          height="100%"
          maxWidth="35rem"
          margin="0"
          sx={{ display: "contents" }}
        >
          <Grid
            item
            xs={true}
            height="100%"
            mr="1rem"
            width={!isNonMobileScreens ? "15% !important" : "100%"}
          >
            {/* {content} */}
            <List
              sx={{
                overflowY: "scroll",
                height: "100%",
                paddingRight: "0.7rem",
              }}
            >
              {user?.friends?.map((user, index) => {
                const name = `${user.displayName}`;
                return (
                  <ListItem
                    key={index}
                    sx={{
                    //   backgroundColor: mode === "dark" ? "#333333" : "#F0F0F0",
                      marginBottom: "0.6rem",
                      borderRadius: "1.2rem",
                      cursor: "pointer",
                      paddingLeft: !isNonMobileScreens ? "0.4rem" : "",
                    }}
                    onClick={() => setCurrentUser(user)}
                  >
                    <Avatar>{user.displayName[0]}</Avatar>
                    <div
                      style={{
                        paddingLeft: isNonMobileScreens ? "1rem" : "0.2rem",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          margin: "0",
                          fontSize: "0.9rem",
                        //   color: mode === "dark" ? "#C2C2C2" : "#666666",
                          wordBreak: "break-word",
                          "&:hover": {
                            color: "#00353F",
                          },
                        }}
                      >
                        {name.length <= 20
                          ? name
                          : `${name.substring(0, 20)}...`}
                      </Typography>
                      {isNonMobileScreens && (
                        <p style={{ margin: 0 }}>Open chat to see messages</p>
                      )}
                    </div>
                  </ListItem>
                );
              })}
            </List>
          </Grid>

          <Box sx={{ width: isNonMobileScreens ? "74%" : "55%", height:"100%" }}>
            {!currentUser ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <Typography
                  sx={{
                    cursor: "pointer",
                    color: "rgb(255, 0, 0)",
                    fontSize: "1.7rem",
                    textAlign: "center",
                    "&:hover": {
                      color: "rgb(255, 100, 100)",
                    },
                  }}
                >
                  Open Your Chat Box to communicate with your friend
                </Typography>
                <img
                  src={msgImage}
                  alt=""
                  width="200rem"
                  height="200rem"
                  style={{ filter: "invert(40%)" }}
                />
              </div>
            ) : (
              <ChatWidget currentUser={currentUser} />
            )}
          </Box>
        </Grid>
      </Box>
    </Box>
  );
}

export default Chat;
