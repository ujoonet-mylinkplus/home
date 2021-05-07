self.addEventListener('message', async (event) => {
    var id = event.data.id;
    var file = event.data.file;
    var url = event.data.uri;
    uploadFile(id, file, url);
});

function uploadFile(id, file, url) {
    var xhr = new XMLHttpRequest();
    var formdata = new FormData();
    formdata.append('file', file);
    xhr.upload.addEventListener('progress', function (e) {
        if (e.lengthComputable) {
            postMessage('{"type":"progress", "value":"' + e.loaded.toString() + '", "id":"' + id + '"}');
        }
    }, false);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var msg = '{"type":"done", "value":"' + btoa(unescape(encodeURIComponent(xhr.responseText))) + '", "id":"' + id + '"}';
            postMessage(msg);
        }
        else {
            const kReadyState = [
                "0: request not initialized",
                "1: server connection established",
                "2: request received",
                "3: processing request",
                "4: request finished and response is ready",
            ];
            var msg = '{"type":"onreadystatechange", "value":"' + kReadyState[xhr.readyState] + '", "id":"' + id + '"}';
            console.log(msg);
        }
    }
    xhr.onerror = function (e) {
        var msg = '{"type":"progress", "value":"' + e.target.status + '", "id":"' + id + '"}';
        postMessage(msg);
    };
    xhr.open('POST', url, true);
    xhr.send(formdata);
}
