import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { fetchImages, searchPhotos, setQuery, reorderImages } from "../redux/imageSlice";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import Sortable from "react-native-sortables";

const { width } = Dimensions.get("window");

export default function GalleryScreen() {
  const dispatch = useDispatch();
  const { items, status, page, query, isSearching, hasMore } = useSelector(
    (state) => state.images
  );
  const [searchText, setSearchText] = useState("");
  const [gridData, setGridData] = useState([]);
  const isLoadingMore = useRef(false);

  const scrollableRef = useAnimatedRef();

  useEffect(() => {
    setGridData(items);
  }, [items]);

  useEffect(() => {
    if (status !== "loading" && items.length === 0 && hasMore) {
      dispatch(fetchImages({ page }));
    }
  }, [dispatch, status, items.length, hasMore]);

  const loadMoreImages = () => {
    if (isLoadingMore.current || status === "loading" || !hasMore) return;

    isLoadingMore.current = true;
    if (isSearching) {
      dispatch(searchPhotos({ page, query }));
    } else {
      dispatch(fetchImages({ page }));
    }
  };

  const handleSearch = () => {
    if (status === "loading") return;

    dispatch(setQuery(searchText));
    if (searchText) {
      dispatch(searchPhotos({ page: 1, query: searchText }));
    } else {
      dispatch(fetchImages({ page: 1 }));
    }
  };

  useEffect(() => {
    if (status !== "loading") {
      isLoadingMore.current = false;
    }
  }, [status]);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.urls.small }} style={styles.image} />
      </View>
    ),
    [gridData]
  );

  const renderHeader = () => (
    <View>
      <Text style={styles.photosTitle}>Photos</Text>
      <Text style={styles.monthTitle}>November</Text>
    </View>
  );

  const renderFooter = () => {
    if (status === "loading" && page > 1) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#C2BFBF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (status === "failed") {
      return <Text style={styles.errorText}>Error loading images</Text>;
    } else if (status === "succeeded" && !hasMore) {
      return <Text style={styles.noMoreItemText}>No more item</Text>;
    }
  };

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#fff"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchBar}
            placeholder="Search file"
            placeholderTextColor="#827C7C"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
        </View>

        {status === "loading" && page === 1 ? (
          <ActivityIndicator
            size="large"
            color="#C2BFBF"
            style={styles.loader}
          />
        ) : (
          <Animated.ScrollView
            contentContainerStyle={styles.contentContainer}
            ref={scrollableRef}
            onScroll={({nativeEvent}) => {
                if (isCloseToBottom(nativeEvent)) {
                    loadMoreImages();
                }
              }}
          >
            {renderHeader()}
            <Sortable.Grid
              columns={2}
              data={gridData}
              renderItem={renderItem}
              rowGap={10}
              columnGap={10}
              style={styles.listContent}
              scrollableRef={scrollableRef}
              onDragEnd={({ data }) => dispatch(reorderImages(data))}
            />
            {renderFooter()}
          </Animated.ScrollView>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 5,
    margin: 10,
    borderWidth: 0.5,
    borderColor: "gray",
    marginHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
    backgroundColor: "#AF2E30",
    padding: 10,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  searchBar: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  photosTitle: {
    fontSize: 24,
    color: "#CBC3C3",
    marginHorizontal: 10,
    marginTop: 10,
    textAlign: "center",
  },
  monthTitle: {
    fontSize: 18,
    color: "#666",
    marginHorizontal: 10,
    marginVertical: 5,
  },
  imageContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: "100%",
    aspectRatio: 1.5,
    borderRadius: 10,
  },
  listContent: {
    paddingBottom: 80,
    paddingHorizontal: 10,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    textAlign: "center",
    color: "red",
    marginTop: 20,
  },
  noMoreItemText: {
    textAlign: "center",
    marginVertical: 30,
    color: "#C2BFBF",
    fontSize: 18,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 18,
    color: "#C2BFBF",
  },
  contentContainer: {
    padding: 10
  }
});
