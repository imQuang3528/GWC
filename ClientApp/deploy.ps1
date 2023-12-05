copy-item ClientApp/build/* ../ -Force -Recurse
get-content index.html | set-content Views/Game/Index.cshtml