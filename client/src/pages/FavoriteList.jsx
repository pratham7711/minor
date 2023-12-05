import DeleteIcon from "@mui/icons-material/Delete";
import { LoadingButton } from "@mui/lab";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import MediaItem from "../components/common/MediaItem";
import Container from "../components/common/Container";
import uiConfigs from "../configs/ui.configs";
import favoriteApi from "../api/modules/favorite.api";
import { setGlobalLoading } from "../redux/features/globalLoadingSlice";
import { removeFavorite } from "../redux/features/userSlice";
import axios from "axios";
import tmdbConfigs from "../api/configs/tmdb.configs";

const FavoriteItem = ({ media, onRemoved }) => {
  const dispatch = useDispatch();

  const [onRequest, setOnRequest] = useState(false);

  const onRemove = async () => {
    if (onRequest) return;
    setOnRequest(true);
    const { response, err } = await favoriteApi.remove({ favoriteId: media.id });
    setOnRequest(false);

    if (err) toast.error(err.message);
    if (response) {
      toast.success("Remove favorite success");
      dispatch(removeFavorite({ mediaId: media.mediaId }));
      onRemoved(media.id);
    }
  };

  return (<>
    <MediaItem media={media} mediaType={media.mediaType} />
    <LoadingButton
      fullWidth
      variant="contained"
      sx={{ marginTop: 2 }}
      startIcon={<DeleteIcon />}
      loadingPosition="start"
      loading={onRequest}
      onClick={onRemove}
    >
      remove
    </LoadingButton>
  </>);
};




const RecommendedItem = ({ media, onRemoved }) => {
  const dispatch = useDispatch();

  const [onRequest, setOnRequest] = useState(false);


  return (<>
    <MediaItem media={media} mediaType={media.mediaType} />
  </>);
};








const FavoriteList = () => {
  const [medias, setMedias] = useState([]);
  const [filteredMedias, setFilteredMedias] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [recommended , setRecommended] = useState([]);
  
  const dispatch = useDispatch();

  const skip = 8;

  useEffect(() => {
    const getRecommendations = async () => {
      dispatch(setGlobalLoading(true));
      try {
        const movieList = filteredMedias.map(movie => movie.mediaTitle);
        const topN = 5;
        const requestData = {
          movieList,
          topN,
        };
  
        console.log('Request Data:', requestData); // Log the requestData object
  
        const response = await axios.post('http://127.0.0.1:5000/recommend', requestData);
        console.log('Response:', response.data); // Log the response data
        setRecommended(response.data);
        console.log(recommended);
      } catch (err) {
        console.error('Error fetching recommendations:', err); // Log any errors that occur during the request
      }
      dispatch(setGlobalLoading(false));
    };
  
    getRecommendations();
  }, [dispatch, filteredMedias]);
  
  useEffect(() => {
    const getFavorites = async () => {
      dispatch(setGlobalLoading(true));
      const { response, err } = await favoriteApi.getList();
      dispatch(setGlobalLoading(false));

      if (err) toast.error(err.message);
      if (response) {
        setCount(response.length);
        setMedias([...response]);
        setFilteredMedias([...response].splice(0, skip));
      }
    };

    getFavorites();
  }, []);

  const onLoadMore = () => {
    setFilteredMedias([...filteredMedias, ...[...medias].splice(page * skip, skip)]);
    setPage(page + 1);
  };

  const onRemoved = (id) => {
    const newMedias = [...medias].filter(e => e.id !== id);
    setMedias(newMedias);
    setFilteredMedias([...newMedias].splice(0, page * skip));
    setCount(count - 1);
  };

  console.log(filteredMedias);

  return (
    <Box sx={{ ...uiConfigs.style.mainContent }}>
      <Container header={`Your favorites (${count})`}>
        <Grid container spacing={1} sx={{ marginRight: "-8px!important" }}>
          {filteredMedias.map((media, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <FavoriteItem media={media} onRemoved={onRemoved} />
            </Grid>
          ))}
        </Grid>
        {filteredMedias.length < medias.length && (
          <Button onClick={onLoadMore}>load more</Button>
        )}
      </Container>

      <Container header={`Your Recommendations (${count})`}>
        <Grid container spacing={1} sx={{ marginRight: "-8px!important" }}>
          {recommended.map((media, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Box sx={{
        ...uiConfigs.style.backgroundImage(tmdbConfigs.posterPath(media.poster_path)),
        paddingTop: "160%",
        "&:hover .media-info": { opacity: 1, bottom: 0 },
        "&:hover .media-back-drop, &:hover .media-play-btn": { opacity: 1 },
        color: "primary.contrastText"
      }}>
         <Stack spacing={{ xs: 1, md: 2 }}>
                {/* {rate && <CircularRate value={rate} />} */}

                {/* <Typography>{releaseDate}</Typography> */}
                
                <Typography
                  variant="body1"
                  fontWeight="700"
                  sx={{
                    fontSize: "1rem",
                    ...uiConfigs.style.typoLines(1, "left")
                  }}
                >
                  {media.title}
                </Typography>
              </Stack>
      </Box>
            </Grid>
          ))}
        </Grid>
        {filteredMedias.length < medias.length && (
          <Button onClick={onLoadMore}>load more</Button>
        )}
      </Container>
    
    </Box>
  );
};

export default FavoriteList;