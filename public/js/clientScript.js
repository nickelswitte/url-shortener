function generateLink() {
    let url = document.getElementById('inputUrl');

    setInputLoading(true);
    sendPost(url.value);
}

function sendPost(content) {
    
    // Sending and receiving data in JSON format using POST method
    //
    var xhr = new XMLHttpRequest();
    var url = window.location.href + "submit-url";
    
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

    let linkToDisplay = window.location.href + key;
    linkToDisplay = linkToDisplay.replace("http://", "");

    let element = document.getElementById('linkText');
    

    setTimeout(() => {  
        element.value = linkToDisplay;
    }, 200);

    setTimeout(() => {  
        setInputLoading(false);
    }, 500);

    // console.log(data + " " + window.location.href);
}

function copyLink() {
    /* Get the text field */
    var copyText = document.getElementById("linkText");

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    document.execCommand("copy");

       
}

function setInputLoading(bool) {
    let linkControl = document.getElementById("linkControl");

    bool ? linkControl.classList.add("is-loading") : linkControl.classList.remove("is-loading");
    
}

function deleteUrl() {
    document.getElementById("inputUrl").value = "";
}
