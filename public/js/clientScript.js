/**
 * This is the main entry point to generate an url
 */
function generateLink() {
    // Fetch the url from input
    let url = document.getElementById('inputUrl');
    let targetUrl = document.getElementById('linkText');

    // Check if the target value has changed
    let target = targetUrl.value == "The very short url will appear here.." ? null : targetUrl.value;

    // Start the loading animation
    setInputLoading(true);

    // Send it to the server
    sendPost(url.value, target);
}

/**
 * Function to send a url to the server
 */
function sendPost(content, targetUrl) {
    
    // Sending and receiving data in JSON format using POST method
    var xhr = new XMLHttpRequest();
    // Build the url which is needed
    var url = window.location.protocol + '//' + window.location.host + "/" + "submit-url";

    // console.log(url);
    
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
    var data = JSON.stringify({url: content, target: targetUrl})
    
    xhr.send(data);

}

/**
 * Function to display the link on the page
 * In case of errors, it will display this accordingly
 */
function displayLink(data) {

    
    let linktext = document.getElementById('linkText');
    let error = JSON.parse(data).error;
    let key = JSON.parse(data).key;
    let msg = "";

    if (key) {

        // If a url key successfully arrived

        let linkToDisplay = window.location.protocol + '//' + window.location.host + "/" + key;
        linkToDisplay = linkToDisplay.replace("http://", "");

        linktext.classList.remove("is-danger");

        msg = linkToDisplay;

    } else {
        if (error) {
            msg = error;
        } else {
            msg = "An error occured. Sorry for that."
        }

        linktext.classList.add("is-danger");
    }


    // Animate

    setTimeout(() => {  
        linktext.value = msg;
    }, 200);

    setTimeout(() => {  
        setInputLoading(false);
    }, 500);

}

/**
 * Copy the link just by a click!
 */
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
