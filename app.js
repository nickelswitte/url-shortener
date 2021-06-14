
import express from 'express';
import fs from 'fs';
import { nanoid } from 'nanoid'
import path from 'path';
import validUrl from 'valid-url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 80;


app.use(express.json());
app.use(express.static('public'));
// Include static files of bulma
app.use(express.static('node_modules/bulma/css'));
app.use(express.static('node_modules/@fortawesome/fontawesome-free/'));

let keyUrlPairs = "";

app.get('/', (req, res) => {

    var options = {
        root: __dirname,
    }

    // Send HTML File 
    res.sendFile('/public/html/index.html', options)
})

// forwarding route
app.get('/:key', (req, res, next) => {

    let urlFound = getUrlWithKey(req.params.key);

    if (typeof urlFound !== "undefined") {
        res.redirect(urlFound);
    } else {
        // Continue to the next handler (404)
        next();
    }
    
    
})

app.get('/test', (req, res) => {
    res.send(nanoid(7));
})

/**
 * POST Route to submit urls
 */
app.post('/submit-url', (req, res) => {
    // get url from post body
    let url = req.body.url;

    // Check if it is a proper url
    if (!validUrl.isUri(url)) {
        res.json({key: "Oh hey buddy, sorry it seems that this is no proper URL."});
        return;
    } 

    // Generate uuid
    let uuid = generateUuid();

    // send response with the key
    res.json({key: uuid});

    // Prepare the string to be appended
    let append = uuid + "=" + url;
    
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
          console.error(err);
          return
        }

        console.log(new Date().toISOString());

        // console.log(data);
        keyUrlPairs = data.split("\n");
        // console.log(paths);
        console.log(countUrls());
    });
}

function generateUuid() {
    let uuid;

    do {
       uuid = nanoid(4);
    } while (isUuidAlreadyTaken(uuid));

    return uuid;

}

function getUrlWithKey(key) {
    let index, value, result;

    for (index = 0; index < keyUrlPairs.length; ++index) {

        value = keyUrlPairs[index].split("=");

        if (value[0] == key) {
            result = value[1];
            break;
        }
    }

    return result;
}

function isUuidAlreadyTaken(uuid) {
    let index;
    let currentUuid;

    for (index = 0; index < keyUrlPairs.length; ++index) {

        currentUuid = keyUrlPairs[index].split("=")[0];

        if (currentUuid == uuid) {
            return true;
        }
    }

    return false;
}

function countUrls() {
    return keyUrlPairs.length;
}


readPaths();

