import * as ws from 'ws';
import crypto from "crypto-js";
import * as http from "http";
import fs from "fs";

const apiRe = /\/api/;
const indexHtmlRe = /\/[^.]+$/;

interface FileCacheReference {
    name: string;
    type: string;
}

class DirectoryCacheReference implements FileCacheReference {
    name: string;
    type = "dir";
    files: Array<DirectoryCacheReference | FileCacheReference>;

    constructor(name: string, files: Array<DirectoryCacheReference | FileCacheReference>) {
        this.name = name;
        this.files = files;
    }
}

function cacheFiles(head: string, fileList: Array<DirectoryCacheReference | FileCacheReference>): { [index: string]: {data: string, type: string} } {
    const outObj: { [index: string]: {data: string, type: string} } = {};

    fileList.forEach(file => {
        if (!(file instanceof DirectoryCacheReference)) {
            let path = `${head}/${file.name}`;
            console.log("caching", path);

            let contentType = "text/plain";
            const extension = path.split(".").pop();

            switch (extension) {
                case "html":
                    contentType = "text/html";
                    break;
                case "css":
                    contentType = "text/css";
                    break;
                case "js":
                    contentType = "text/javascript";
                    break;
                case "svg":
                    contentType = "image/svg+xml";
                    break;
            }

            try {
                outObj[path] = { data: fs.readFileSync(path).toString(), type: contentType };
            } catch (e) {
                if (e.errno === -2) {
                    outObj[path] = { data: "not found", type: "error" };
                    console.log("not found:", path);
                } else {
                    console.log(path);
                    throw e;
                }
            }
        } else {
            const toAppend = cacheFiles(`${head}/${file.name}`, file.files);
            const toAppendKeys = Object.keys(toAppend);

            toAppendKeys.forEach(toAppendKey => {
                outObj[toAppendKey] = toAppend[toAppendKey];
            });
        }
    });

    return outObj;
}

const Files = Object.freeze(cacheFiles("site", [
    { name: "favicon.ico", type: "file" },
    { name: "index.html", type: "file" },
    { name: "index.css", type: "file" },
    { name: "index.js", type: "file" },
    { name: "waifu.png", type: "file" }
]));

const port = (n => (n >= 0 && n < 65536) ? n : 8080)(parseInt(process.env.PORT ?? ""));

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    try {
        // Initial 200 status code
        res.statusCode = 200;

        // If this is an api request, use different handling
        if (req.url.match(apiRe)) {
            let data = "";
            req.on("data", chunk => {
                data += chunk;
            });
            req.on("end", () => {
                let url = req.url.split("?");
                let resource = url[0];

                if (resource[resource.length - 1] !== "/") {
                    resource += "/";
                }

                // split the URL by & and = to get the arguments in an object
                let args: { [index: string]: string } = {};
                (url[1] ? url[1].split("&") : []).forEach((rawArg) => {
                    let arg = rawArg.split("=");
                    args[arg[0]] = arg[1];
                });

                switch (resource) {
                    
                }
            });

            return;
        }

        // Start building the file request path
        let path = "site" + req.url.split("?")[0];
        if (path[path.length - 1] === "/") {
            path += "index.html";
        }
        
        // if we've matched a path in the form of <http://example.com/site/>
        //  forward it to <http://example.com/site/index.html>
        if (path.match(indexHtmlRe)) {
            res.setHeader("Content-Type", "text/html");
            res.end(`<!DOCTYPE html><html lang="en"><script>window.location.href="${req.url + "/"}";</script></html>`);
            return;
        }

        const fileData = Files[path];

        // handle different error codes
        if (fileData === undefined || (fileData.type === "error" && fileData.data === "not found")) {
            res.statusCode = 404;
            res.end("not found");
        } else if (fileData.type === "error") {
            res.statusCode = 500;
            res.end(fileData.data);
        } else {
            res.setHeader("Content-Type", fileData.type);
            res.end(fileData.data);
        }
    } catch (e) {
        console.log(e);
    }

    console.log(`${req.url} -> ${res.statusCode}`);
}).addListener("error", (err: Error) => {
    console.error(err);
});

server.listen(port, () => {
    console.log(`Listening on 0.0.0.0:${port}`);
})
