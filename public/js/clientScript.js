function generateLink() {
    let url = document.getElementById('inputUrl');


    sendPost(url.value);
}

function sendPost(content) {
    
    // Sending and receiving data in JSON format using POST method
    //
    var xhr = new XMLHttpRequest();
    var url = "http://localhost:3000/submit-url";
    
    xhr.open("POST", url, true);

    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            //var json = JSON.parse(xhr.responseText);
            // console.log(xhr.responseText);
            displayLink(xhr.responseText);
        }
    };

    // var json = '{"url": ' + content + '}';
    var data = JSON.stringify({url: content})
    
    xhr.send(data);

}

function displayLink(data) {
    let key = JSON.parse(data).key;

    let element = document.getElementById('linkText');
    element.value = window.location.href + key;

    // console.log(data + " " + window.location.href);
}