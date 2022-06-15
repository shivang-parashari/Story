const https = require('https');
const http = require('http')

function linkData(links) {
    let finalArray = [];
    links.forEach(element => {
        let f = element.replace('href="', "");
        let s = f.replace('">', "");
        s = 'https://time.com' + s;
        finalArray.push(s);
    });
    return finalArray;

}

function storiesData(stories) {
    let finalArray = [];
    stories.forEach(element => {
        let f = element.replace('line">', "");
        let s = f.replace('</h3>', "");
        let t = s.replace(/<(.*?)>/g, "");
        finalArray.push(t);

    });
    return finalArray
}

function extractContent(data) {

    let processData = data.replace(/\n/g, "");
    processData = processData.replace(/[t ]+\</g, "<")
    processData = processData.replace(/\>[\t ]+\</g, "><")
    processData = processData.replace(/\>[\t ]+$/g, ">")

    let processDataobj = processData.match(/Latest Stories(.*?)<\/ul>/)

    processData = processDataobj[0]
    let links = processData.match(/href="(.*?)>/g);
    let stories = processData.match(/line">(.*?)h3>/g)

    const processedLink = linkData(links);
    const processTitle = storiesData(stories);

    let finalStoriesArray = [];

    for (i = 0; i < 6; i++) {
        let storyObject = {};
        storyObject['title'] = processTitle[i];
        storyObject['link'] = processedLink[i];

        finalStoriesArray.push(storyObject)
    }
    return finalStoriesArray;
}




var options = {
    host: 'time.com',
    path: '/',
    method: 'GET'
};

const getData = () => {
    return new Promise((resolve, reject) => {
        https.request(options, (res) => {
            let str = '';
            res.on('data', (d) => {
                let data = d.toString();
                str += data;

            });
            res.on('end', () => {
                resolve(str);
            })
            res.on('error', (error) => {
                reject(error);
            })
        }).end();
    })
}
async function getLatestNews() {
    let data;
    await getData().then((d) => {
        data = d
    }).catch((err) => {
        throw err;
    });

    let finalData = extractContent(data)
    const host = 'localhost';
    const port = 8000;

    const requestListener = function (req, res) {
        res.writeHead(200, { 'Content-Type': 'text/json' });
        if (req.url === '/getTimeStories') {
            res.end(JSON.stringify(finalData));
        }
    };
    const server = http.createServer(requestListener);
    server.listen(port, host, () => {
        console.log(`Click on the above link http://${host}:${port}/getTimeStories`);
    });


}

getLatestNews();



