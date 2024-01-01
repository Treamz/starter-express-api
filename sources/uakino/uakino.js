const cheerio = require("cheerio");
const axios = require("axios");

async function extractM3U8(link) {
    if(link.includes("http:")) {
        var formatLink = `https:${link}`;
    }
    else {
        var formatLink = link;

    }
    var getPage = await axios.get(
        formatLink
    );
    let regex = /file:"(.*?)",/;
  
    var videos = getPage.data.match(regex)
  
    return videos[1];
  }

module.exports = {
  getSuggestions: async function (query) {
    var response = {
      responseType: "Suggestions",
    };
    var searchResultsItems = [];
    var getPage = await axios.get(
      "https://uakino.club/index.php?do=search&subaction=search&story=" + query
    );
    const $ = cheerio.load(getPage.data, null, false);

    const selectedDivs = $(".movie-item.short-item .movie-title");
    selectedDivs.each((index, element) => {
      let year = null;

      $(".fi-label").each((index, element) => {
        const label = $(element).text().trim(); // Get the text content of the fi-label element
        const desc = $(element).next(".deck-value").text().trim(); // Get the text content of the corresponding fi-desc element
        switch (label) {
          case "Рік виходу:":
            year = parseInt(desc);
            break;
          case "Жанр:":
            tags = desc.split(", ");
            break;
          case "Актори:":
            actors = desc.split(", ");
            break;
          case "":
            rating = parseFloat(desc.split("/")[0]);
            break;
          default:
            // Handle other cases if needed
            break;
        }
      });
      searchResultsItems.push({
        title: $(element).text().trim(),
        href: $(element).attr("href"),
        year: year,
      });
    });

    response["response"] = searchResultsItems;

    return response;
  },
  getTranslationById: async function (translationId) {
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
  },
  getTranslationByPage: async function (page) {
    var response = {
        responseType: "Translations"
    };
    var translations = [];
    var translationsData = [];
    
    if(page.includes("filmy")) {
        var getPlaylist = await axios.get(page);
        const $ = cheerio.load(getPlaylist.data);

        const iframeWithIdPre = $('iframe#pre');
        var movieUrl = await extractM3U8($(iframeWithIdPre).attr("src"));

        response["extras"] = {
            id: "0_0",
            name: "default",
            file: movieUrl,
            voice:"default",
        };
        return response;

    }
    var id = page.split("/").pop().split("-")[0];
    var getPlayistURL = `https://uakino.club/engine/ajax/playlists.php?news_id=${id}&xfield=playlist&time=${Date.now()})}`;
    var getPlaylist = await axios.get(getPlayistURL);
    const $ = cheerio.load(getPlaylist.data["response"])
    const selectedDivs = $(".playlists-lists li");
    selectedDivs.each((index, element) => {
       if($(element).attr("data-id") != null) {
        translations.push({
            id: $(element).attr("data-id"),
            name: $(element).text(),
          });
       }
    })
    response["translations"] = translations;
    const selectedTranslations = $(".playlists-videos li");


    for(element of selectedTranslations) {
        console.log($(element).attr("data-file"));
        var movieUrl = await extractM3U8($(element).attr("data-file"));

        translationsData.push({
            id: $(element).attr("data-id"),
            name: $(element).text(),
            file: movieUrl,
            voice:$(element).attr("data-voice"),
          });
    }


    response["extras"] = translationsData;

    return response;
  },
};


