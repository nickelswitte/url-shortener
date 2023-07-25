
import express from 'express';
// Node File Interaction
import fs from 'fs';
// Generate uuids
import { nanoid } from 'nanoid'
import path from 'path';
// Check valid urls
import validUrl from 'valid-url';
import { fileURLToPath } from 'url';
// Template Engine
import * as eta from "eta"

const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();
const port = 80;

const delimiter = " ";

// Enable render engine
app.engine("eta", eta.renderFile);
app.set("view engine", "eta");
app.set('views', './views');


app.use(express.json());
app.use(express.static('public'));
// Include static files of bulma and fontawesome
app.use(express.static('node_modules/bulma/css'));
app.use(express.static('node_modules/@fortawesome/fontawesome-free/'));

// variable to hold urls
let keyUrlPairs = "";

// Serve the index page
app.get('/', (req, res) => {
    res.render("index", {
        numberOfUrls: countUrls(),
        numberOfRedirects: countRedirects(),
        title: "url shortener",
        subtitle: "Hello there! Please enter your <strong>url</strong> below and make it short!"
    })
})


// forwarding route
app.get('/:key', (req, res, next) => {

    let urlFound = getUrlUsingKey(req.params.key);

    if (typeof urlFound !== "undefined") {
        increaseClicksOf(req.params.key);
        res.redirect(urlFound);
    } else {
        // Continue to the next handler (404)
        next();
    }
})


/**
 * POST Route to submit urls
 */
app.post('/submit-url', (req, res) => {
    // get url from post body
    let url = req.body.url;
    let target = req.body.target;

    // Check if it is a proper url
    if (!validUrl.isUri(url)) {
        res.json({error: "Sorry it seems that this is no proper URL."});
        return;
    } 

    if (url.length > 500) {
        res.json({error: "This URL is unfortunately too long with over 500 characters."});
        return;
    }

    let uuid;

    // If the target exists and it is not a uri, check further
    if (target != null && !validUrl.isUri(target)) {
        
        // Check if the target is already taken
        if (isUuidAlreadyTaken(target)) {
            res.json({error: "Sorry, this target is already taken."});
            return;
        }
    
        // Check if the target is a valid string
        if (!testTarget(target)) {
            res.json({error: "Sorry, this target is not valid. Only use letters, numbers and hyphens"});
            return;
        }

        // Check if it is too long
        if (target.length > 30) {
            res.json({error: "Why are you using an shortener?! Make it shorter!"});
            return;
        }

        uuid = target;


    } else {

        // Generate uuid
        uuid = generateUuid();
    }



    // send response with the key
    res.json({key: uuid});

    // Prepare the string to be appended
    let append = uuid + delimiter + 0 + delimiter + url;
    
    // Write to file
    fs.appendFileSync('urls.txt', "\n" + append, function (err) {
        if (err) throw err;
    });

    // then load the paths into the variable
    readPaths();
    
});

/**
 * 404 Handler
 */
app.use(function(req, res, next) {
    res.status(404);
  
    // respond with html page
    if (req.accepts('html')) {
        res.status(404).send('Sorry cant find that!');
        return;
    }
  
    // respond with json
    if (req.accepts('json')) {
        res.json({ error: 'Not found' });
        return;
    }
  
    // default to plain-text. send()
    res.type('txt').send('Not found');
});

/**
 * Start the server
 */
app.listen(port, () => {
  console.log('Example app listening at port' + port);
  // console.log("Paths variable is: " + keyUrlPairs)
})



/**
 * Read the paths file and update the variable
 */
function readPaths() {
    fs.readFile('urls.txt', 'utf8' , (err, data) => {
        if (err) {
          console.log("No urls.txt could be found. Therefore a new one will be created.");
          return
        }

        console.log(new Date().toISOString());

        // console.log(data);
        keyUrlPairs = data.split("\n");
        // console.log(paths);
        console.log("Number of urls stored currenty is " + countUrls());
    });
}

function generateUuid() {
    let uuid;

    do {
       uuid = nanoid(4);
    } while (isUuidAlreadyTaken(uuid));

    return uuid;
}

/** 
 * Find URL using the key
 */
function getUrlUsingKey(key) {
    let index, value, result;

    for (index = 0; index < keyUrlPairs.length; ++index) {

        value = keyUrlPairs[index].split(delimiter);

        if (value[0] == key) {
            result = value[2];
            break;
        }
    }

    return result;
}

/** 
 * Increase the click count of the link with key
 */
function increaseClicksOf(key) {
    let index, row;

    for (index = 0; index < keyUrlPairs.length; ++index) {

        // Split the current row
        row = keyUrlPairs[index].split(delimiter);

        // If we have the right row
        if (row[0] == key) {
            
            // Increase the number
            row[1] = (parseInt(row[1]) + 1);
            // Reattach it back into the array
            keyUrlPairs[index] = row.join(" ");
            // Write it down
            writeUrlsToFile();

            break;
        }
    };

}

/** 
 * Increase the click count of the link with key
 */
function writeUrlsToFile() {

    // Remove content
    fs.truncateSync('urls.txt', 0, function (err) {
        if (err) throw err;
    });

    let toWrite = keyUrlPairs.join("\n").replace(/[\r\n]+$/, '');

    // Write current array to file 
    fs.appendFileSync('urls.txt', toWrite, function (err) {
        if (err) throw err;
    });

    // then load the paths into the variable
    readPaths();
}


function isUuidAlreadyTaken(uuid) {
    let index;
    let currentUuid;

    for (index = 0; index < keyUrlPairs.length; ++index) {

        currentUuid = keyUrlPairs[index].split(delimiter)[0];

        if (currentUuid == uuid) {
            return true;
        }
    }

    return false;
}

function countUrls() {
    return keyUrlPairs.length;
}

/**
 * Function to count the total number of redirects of all links
 */
function countRedirects() {
    let index;
    let redirects = 0;

    for (index = 0; index < keyUrlPairs.length; ++index) {

        // Add all redirects. In case of NaN, return 0
        redirects += parseInt(keyUrlPairs[index].split(delimiter)[1]) || 0;
    }

    return redirects;
}

function testTarget(target) {
    const regex = /^[a-zA-Z0-9-]+$/;
    return regex.test(target);
}

// Read the current paths
readPaths();

