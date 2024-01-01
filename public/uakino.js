var translationsTemp = [];

async function getTranslationById(translationId) {
  var response  = {
      responseType: "PlayableList",
      list: []
  };
  var elements = [];
  for (const translation of translationsTemp){
      if(translation["id"] == translationId) {
          var movieUrl = await extractM3U8(translation["file"]);
          elements.push({
              "file" : movieUrl,
              "name" : translation["name"],
              "voice": translation["voice"],
              "id": translation["id"]
          });
      
      }
  }

  response["list"] = elements;
  return response;
}

async function getTranslationsByPage(pageUrl) {
  var translations = [];
  const parser = new DOMParser();
  var id = pageUrl.split("/").pop().split("-")[0];
  var getPlayistURL = `https://uakino.club/engine/ajax/playlists.php?news_id=\${id}&xfield=playlist&time=${DateTime.now().microsecondsSinceEpoch})}`;
  var getPlaylist = await axios.get(getPlayistURL);
  const htmlDoc = parser.parseFromString(
    getPlaylist.data["response"],
    "text/html"
  );
  Array.from(
    htmlDoc
      .getElementsByClassName("playlists-lists")[0]
      .getElementsByTagName("li")
  ).forEach((child) => {
    if (child.getAttribute("data-id") != null) {
      translations.push({
        id: child.getAttribute("data-id"),
        name: child.innerHTML,
      });
    }
  });
  Array.from(
    htmlDoc
      .getElementsByClassName("playlists-videos")[0]
      .getElementsByTagName("li")
  ).forEach((child) => {
    translationsTemp.push({
      id: child.getAttribute("data-id"),
      name: child.innerHTML,
      file: child.getAttribute("data-file"),
      voice: child.getAttribute("data-voice"),
    });
  });
  return translations;
}

async function search(query) {
  var response = {
    responseType: "Suggestions",
  };
  var searchResultsItems = [];
  const parser = new DOMParser();
  var getPage = await axios.get(
    "https://uakino.club/index.php?do=search&subaction=search&story=what%20if..."
  );
  const htmlDoc = parser.parseFromString(getPage.data, "text/html");
  const searchSuggestions = htmlDoc.getElementsByClassName(
    "movie-item short-item"
  );
  Array.from(searchSuggestions).forEach((child) => {
    console.log(child.getElementsByClassName("movie-title")[0]);
    searchResultsItems.push({
      title: child
        .getElementsByClassName("movie-title")[0]
        .innerHTML.trim(),
      href: child.getElementsByClassName("movie-title")[0].href,
    });
  });
  response["response"] = searchResultsItems;

  return response;
}

async function extractM3U8(link) {
  var getPage = await axios.get(
      `https:\${link}`
  );
  let regex = /file:"(.*?)",/;

  var videos = getPage.data.match(regex)

  return videos[1];
}