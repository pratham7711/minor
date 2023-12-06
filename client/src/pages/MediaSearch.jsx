import { LoadingButton } from "@mui/lab";
import { Box, Button, Stack, TextField, Toolbar } from "@mui/material";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import mediaApi from "../api/modules/media.api";
import MediaGrid from "../components/common/MediaGrid";
import uiConfigs from "../configs/ui.configs";
import DoneIcon from "@mui/icons-material/Done";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

import { useSelector } from "react-redux";

let timer;
const timeout = 500;

const MediaSearch = () => {
  
  const [query, setQuery] = useState("");
  const [onSearch, setOnSearch] = useState(false);
  const [mediaType, setMediaType] = useState('movie');
  const [medias, setMedias] = useState([]);
  const [page, setPage] = useState(1);
  const nameRef = useRef();
  const { user } = useSelector((state) => state.user);
  const [inputValue, setInputValue] = useState("");
  const [request, setRequest] = useState(false);
  const [mediaTypes , setMediaTypes] = useState(["movie", "tv", "cast"]);

  useEffect(()=>{
    if(user)
      setMediaTypes(["movie", "tv", "cast" , "people"]);
    else
      setMediaTypes(["movie", "tv", "cast" ]);
  },[user]);

  
  console.log("user is ", user);
  
  const [followed, setFollowed] = useState(false);
  
  
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
    // const nameInputValue = nameRef.current.value;
    console.log(inputValue);
    const friendUser = await axios.post(
      `http://localhost:5000/api/v1/user/getData`,
      {
        username: inputValue,
      }
    );
    console.log("new user is", friendUser);
    if (user.friends.includes(friendUser)) {
      setFollowed(true);
    }
    if(friendUser.data._id === user.id){
      alert('You cannot send a request to yourself');
    }
    try {
      if (!followed) {
        const res = await axios.put(
          `http://localhost:5000/api/v1/user/request`,
          {
            parentId: user?.id,
            childId: friendUser?.data?._id,
          }
        );
        setRequest(true);
      }
      if (followed) {
        alert("user is already followed!");
      }
    } catch (err) {
      console.log(err);
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
          {
            (mediaType === 'people') &&  
            (<Button  onClick={followHandler}>
            {request ? "Request Sent" : "Send Friend Request"}
            {request ? <DoneIcon /> : <AddIcon />}
          </Button>)
          }

          {
            (mediaType !== 'people') &&
            <MediaGrid medias={medias} mediaType={mediaType} />
          }

          {((medias.length > 0) && ((mediaType !== 'people'))) && (
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
