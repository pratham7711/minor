import { LoadingButton } from "@mui/lab";
import {
  Avatar,
  Box,
  Button,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import mediaApi from "../api/modules/media.api";
import MediaGrid from "../components/common/MediaGrid";
import uiConfigs from "../configs/ui.configs";
import axios from "axios";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

let timer;
const timeout = 500;

const MediaSearch = () => {
  const [query, setQuery] = useState("");
  const [onSearch, setOnSearch] = useState(false);
  const [mediaType, setMediaType] = useState("movie");
  const [medias, setMedias] = useState([]);
  const [page, setPage] = useState(1);
  const { user } = useSelector((state) => state.user);
  const [inputValue, setInputValue] = useState("");
  const [request, setRequest] = useState(false);
  const [mediaTypes, setMediaTypes] = useState(["movie", "tv", "cast"]);
  const [people, setPeople] = useState([]);
  useEffect(() => {
    if (user) setMediaTypes(["movie", "tv", "cast", "people"]);
    else setMediaTypes(["movie", "tv", "cast"]);
  }, [user]);

  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    const 
    fetchPeople = async () => {
      try {
        const result = await axios.get(
          `${process.env.REACT_APP_API}api/v1/user/people`
        );
        const res = result.data.filter((item) => item.id !== user?.id);
        let filteredRes = res.filter(
          (itemRes) =>
            !user?.friends?.some(
              (itemFriend) => String(itemFriend._id) === String(itemRes.id)
            )
        );

        filteredRes = filteredRes.filter(
          (itemRes) =>
            !user?.requests?.some(
              (itemFriend) => String(itemFriend._id) === String(itemRes.id)
            )
        );
        setPeople(filteredRes);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPeople();
  }, [user]);

  const search = useCallback(async () => {
    setOnSearch(true);

    const { response, err } = await mediaApi.search({
      mediaType,
      query,
      page,
    });

    setOnSearch(false);

    if (err) toast.error(err.message);
    if (response) {
      if (page > 1) setMedias((m) => [...m, ...response.results]);
      else setMedias([...response.results]);
    }
  }, [mediaType, query, page]);

  useEffect(() => {
    if (query.trim().length === 0) {
      setMedias([]);
      setPage(1);
    } else search();
  }, [search, query, mediaType, page]);

  useEffect(() => {
    setMedias([]);
    setPage(1);
  }, [mediaType]);

  const onCategoryChange = (selectedCategory) => setMediaType(selectedCategory);

  const onQueryChange = (e) => {
    const newQuery = e.target.value;
    clearTimeout(timer);
    setInputValue(e.target.value);

    timer = setTimeout(() => {
      setQuery(newQuery);
    }, timeout);
  };
  const followHandler = async () => {
    const friendUserdata = await axios.post(
      `http://localhost:5000/api/v1/user/getData`,
      {
        username: inputValue,
      }
    );
    const friendUser = friendUserdata.data;
    const flag = false;
    for (let x in user.friends) {
      if (String(x._id) === String(friendUser._id)) {
        flag = true;
      }
    }

    if (String(friendUser._id) === String(user.id)) {
      alert("You cannot send a request to yourself");
      flag = true;
    }
    try {
      if (!flag) {
        await axios.put(`http://localhost:5000/api/v1/user/request`, {
          parentId: user?.id,
          childId: friendUser?._id,
        });
        setRequest(true);
      }
      if (followed) {
        alert("user is already followed!");
      }
    } catch (err) {
      console.log(err.response);
      if (err.response.data === "User has been already requested!") {
        alert("This user has been already requested by you!");
      }
    }
  };

  return (
    <>
      <Toolbar />
      <Box sx={{ ...uiConfigs.style.mainContent }}>
        <Stack spacing={2}>
          <Stack
            spacing={2}
            direction="row"
            justifyContent="center"
            sx={{ width: "100%" }}
          >
            {mediaTypes.map((item, index) => (
              <Button
                size="large"
                key={index}
                variant={mediaType === item ? "contained" : "text"}
                sx={{
                  color:
                    mediaType === item
                      ? "primary.contrastText"
                      : "text.primary",
                }}
                onClick={() => onCategoryChange(item)}
              >
                {item}
              </Button>
            ))}
          </Stack>

          <TextField
            color="success"
            placeholder="Search MoonFlix"
            sx={{ width: "100%" }}
            autoFocus
            onChange={onQueryChange}
            value={inputValue}
          />
          {mediaType === "people" &&
            people
              .filter((item) => item.username.startsWith(query))
              .map((item) => (
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    padding: 1,
                    // opacity: onRequest ? 0.6 : 1,
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
                    <Stack direction="row" spacing={2} sx={{ margin: "auto" }}>
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
                          {item.displayName} is on Cine
                          <span style={{ color: "red" }}>Mate</span> send him a
                          Friend Request.
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
                            right: { xs: 0, md: "10px" },
                            backgroundColor: "green",
                            marginTop: { xs: 2, md: 0 },
                            width: "max-content",
                          }}
                          startIcon={<PersonAddIcon />}
                          loadingPosition="start"
                          onClick={async () => {
                            setPeople((prev) => {
                              return prev.filter(
                                (items) => items.id !== item.id
                              );
                            });
                            const friendUserdata = await axios.post(
                              `http://localhost:5000/api/v1/user/getData`,
                              {
                                username: item.username,
                              }
                            );
                            const friendUser = friendUserdata.data;
                            const flag = false;
                            for (let x in user.friends) {
                              if (String(x._id) === String(friendUser._id)) {
                                flag = true;
                              }
                            }

                            if (String(friendUser._id) === String(user.id)) {
                              alert("You cannot send a request to yourself");
                              flag = true;
                            }
                            try {
                              if (!flag) {
                                const res = await axios.put(
                                  `http://localhost:5000/api/v1/user/request`,
                                  {
                                    parentId: user?.id,
                                    childId: friendUser?._id,
                                  }
                                );
                                setRequest(true);
                              }
                              if (followed) {
                                alert("user is already followed!");
                              }
                            } catch (err) {
                              console.log(err.response);
                              if (
                                err.response.data ===
                                "User has been already requested!"
                              ) {
                                alert(
                                  "This user has been already requested by you!"
                                );
                              }
                            }
                          }}
                        >
                          Send Request
                        </LoadingButton>
                      </Stack>
                    </Stack>
                  </Box>
                </Box>
              ))}

          {mediaType !== "people" && (
            <MediaGrid medias={medias} mediaType={mediaType} />
          )}

          {medias.length > 0 && mediaType !== "people" && (
            <LoadingButton loading={onSearch} onClick={() => setPage(page + 1)}>
              load more
            </LoadingButton>
          )}
        </Stack>
      </Box>
    </>
  );
};

export default MediaSearch;
