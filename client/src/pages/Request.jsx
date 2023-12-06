import { LoadingButton } from "@mui/lab";
import { Avatar, Box, Button, Divider, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import DoneIcon from '@mui/icons-material/Done';
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import tmdbConfigs from "../api/configs/tmdb.configs";
import reviewApi from "../api/modules/review.api";
import Container from "../components/common/Container";
import uiConfigs from "../configs/ui.configs";
import { setGlobalLoading } from "../redux/features/globalLoadingSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import { routesGen } from "../routes/routes";
import { useSelector } from "react-redux";
import axios from "axios";

const ReviewItem = ({ review, onRemoved }) => {
  const [onRequest, setOnRequest] = useState(false);
  const { user } = useSelector((state) => state.user);
  console.log("user is", user);
  const requestArray = user.requests !== null ? user.requests : [];
  console.log("request array is ", requestArray);
  console.log(requestArray , user.requests);
  const onRemove = async () => {
    if (onRequest) return;
    setOnRequest(true);
    const { response, err } = await reviewApi.remove({ reviewId: review.id });
    setOnRequest(false);

    if (err) toast.error(err.message);
    if (response) {
      toast.success("Remove review success");
      onRemoved(review.id);
    }
  };

  return (
    <Box>
      {requestArray.map((item) => (
        <Box
          sx={{
            position: "relative",
            display:"flex",
            flexDirection: { xs: "column", md: "row" },
            padding: 1,
            opacity: onRequest ? 0.6 : 1,
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
            {/* <Link
              to={routesGen.mediaDetail(review.mediaType, review.mediaid)}
              style={{ color: "unset", textDecoration: "none" }}
            > */}
              <Stack direction="row" spacing={2} sx={{margin:"auto"}}>
                <Avatar>{item.displayName[0]}</Avatar>
              </Stack>
            {/* </Link> */}
          </Box>

          <Box
            sx={{
              width: { xs: "100%", md: "80%" },
              padding: { xs: 0, md: "1rem 2rem" },
            }}
          >
            <Stack
              spacing={1}
              // style={{
              //   display: "flex",
              //   flexDirection: "column",
              //   alignItems: "center",
              //   justifyContent: "center",
              //   height: "5rem",
              // }}
            >
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
                    backgroundColor:"green",
                    marginTop: { xs: 2, md: 0 },
                    width: "max-content",
                  }}
                  startIcon={<DoneIcon/>}
                  loadingPosition="start"
                  loading={onRequest}
                  onClick={async () => {
                    try {
                      const res = await axios.put(
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
                  loading={onRequest}
                  onClick={async () => {
                    try {
                      const res = await axios.put(
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
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const dispatch = useDispatch();

  const skip = 2;

  useEffect(() => {
    const getReviews = async () => {
      dispatch(setGlobalLoading(true));
      const { response, err } = await reviewApi.getList();
      dispatch(setGlobalLoading(false));

      if (err) toast.error(err.message);
      if (response) {
        setCount(response.length);
        setReviews([...response]);
        setFilteredReviews([...response].splice(0, skip));
      }
    };

    getReviews();
  }, []);

  const onLoadMore = () => {
    setFilteredReviews([
      ...filteredReviews,
      ...[...reviews].splice(page * skip, skip),
    ]);
    setPage(page + 1);
  };

  const onRemoved = (id) => {
    console.log({ reviews });
    const newReviews = [...reviews].filter((e) => e.id !== id);
    console.log({ newReviews });
    setReviews(newReviews);
    setFilteredReviews([...newReviews].splice(0, page * skip));
    setCount(count - 1);
  };

  return (
    <Box sx={{ ...uiConfigs.style.mainContent }}>
      <Container header={`Friend Requests (${count})`}>
        <Stack spacing={2}>
          {filteredReviews.map((item) => (
            <Box key={item.id}>
              <ReviewItem review={item} onRemoved={onRemoved} />
              <Divider
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              />
            </Box>
          ))}
          {filteredReviews.length < reviews.length && (
            <Button onClick={onLoadMore}>load more</Button>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default ReviewList;
