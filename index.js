const express = require('express')
const app = express()
app.use(express.static("public"));

app.all('/', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    console.log("Just got a request!")
    var listScripts = [];
    var arr = JSON.parse(req.query.array);
 
    res.write(generateNewPage(arr));
    res.end();
})
app.listen(process.env.PORT || 3000)

function generateNewPage(scripts) {
    var customData = [];
    scripts.forEach(element => {
        customData.push(`<script src="${element}"></script>`);
    });
    var kLocalExamplePage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Eneyida</title>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>
<body>
  <h1>Local demo page</h1>
  <p>
    This is an example page used to demonstrate how to load a local file or
    HTML string using the
    <a href="https://pub.dev/packages/webview_flutter">Flutter webview</a>
    plugin.
  </p>
  <script>
    window.onload = function() {
      HorizonModule.postMessage("123123");
    };

    function searchSuggestions(title, imdbId, tmdbId) {
      search().then((response) => window.flutter_inappwebview.callHandler('handlerSuggestions', response));
      // HorizonModule.postMessage('HELLO' + title)
    }

    function getTranslations(extras) {
      getTranslationsByPage(extras).then((response) => console.log(response));
    }

    function getFile(translationId) {
      getTranslationById(translationId).then((response) => console.log(response));
    }

    var translationsTemp = [];

    // ... (Остальной JavaScript код остается без изменений)
  </script>

  ${customData.join()}
</body>
</html>
`;
return kLocalExamplePage;
}
