import { LoadingButton } from "@mui/lab";
import { Avatar, Box, Divider, Stack, Typography } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import uiConfigs from "../configs/ui.configs";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSelector } from "react-redux";
import axios from "axios";

const ReviewItem = (props) => {
  const { user } = useSelector((state) => state.user);

  return (
    <Box>
      {props.requests?.map((item, index) => (
        <Box
        key={index}
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            padding: 1,
            "&:hover": { backgroundColor: "background.paper" },
          }}
        >
          <Box
            sx={{
              width: { xs: 0, md: "10%" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Stack direction="row" spacing={2} sx={{ margin: "auto" }}>
              <Avatar>{item.displayName[0]}</Avatar>
            </Stack>
          </Box>

          <Box
            sx={{
              width: { xs: "100%", md: "80%" },
              padding: { xs: 0, md: "1rem 2rem" },
            }}
          >
            <Stack spacing={1}>
              <Link style={{ color: "unset", textDecoration: "none" }}>
                <Typography
                  variant="h6"
                  sx={{
                    ...uiConfigs.style.typoLines(1, "left"),
                    margin: "1rem 0",
                  }}
                >
                  {item.displayName} has sent you a friend request.
                </Typography>
              </Link>
              <Stack
                style={{
                  width: "20rem",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LoadingButton
                  variant="contained"
                  sx={{
                    //   position: { xs: "relative", md: "absolute" },
                    right: { xs: 0, md: "10px" },
                    backgroundColor: "green",
                    marginTop: { xs: 2, md: 0 },
                    width: "max-content",
                  }}
                  startIcon={<DoneIcon />}
                  loadingPosition="start"
                  onClick={async () => {
                    try {
                      props.clicked(item?._id);
                      await axios.put(
                        `http://localhost:5000/api/v1/user/requesthandler`,
                        {
                          recievingId: user?.id,
                          sendingId: item?._id,
                        }
                      );
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                >
                  Accept
                </LoadingButton>
                <LoadingButton
                  variant="contained"
                  sx={{
                    //   position: { xs: "relative", md: "absolute" },
                    right: { xs: 0, md: "10px" },
                    marginTop: { xs: 2, md: 0 },
                    width: "max-content",
                    marginLeft: "4rem",
                  }}
                  startIcon={<DeleteIcon />}
                  loadingPosition="start"
                  onClick={async () => {
                    try {
                      props.clicked(item?._id)
                      await axios.put(
                        `http://localhost:5000/api/v1/user/request/decline`,
                        {
                          userId: user?.id,
                          senderId: item?._id,
                        }
                      );
                      window.location.reload();
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                >
                  Decline
                </LoadingButton>
              </Stack>
            </Stack>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

const ReviewList = () => {
  const { user } = useSelector((state) => state.user);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          `http://localhost:5000/api/v1/user/getuser`,
          {
            id: user?.id,
          }
        );
        setRequests(response.data?.requests);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchData();
    // eslint-disable-next-line
  }, [user]);

  const clicked = (id) => {
    setRequests(prev => {
      return prev.filter(bro => bro._id !== id);
    })
  }

  return (
    <Box sx={{ ...uiConfigs.style.mainContent }}>
      <Container header={`Friend Requests (${requests?.length})`}>
        <Stack spacing={2}>
          <Box>
            <ReviewItem requests={requests} clicked={clicked} />
            <Divider
              sx={{
                display: { xs: "block", md: "none" },
              }}
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default ReviewList;
