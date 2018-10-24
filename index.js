/**
 * HWA1 hariawan // awanscorp1
 */

const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const quotes = require('./quotes');





//membuat server berbasis HTTP
const serverHttp = http.createServer((req,res)=>{
    myUnifyServer(req,res);    
});

serverHttp.listen(config.httpPort,()=>{
    console.log("server listening on port "+config.httpPort);
});

const httpsOptions = {
    key : fs.readFileSync('./https/key.pem'),
    cert : fs.readFileSync('./https/cert.pem')    
};

//membuat server berbasis HTTPS
const serverHttps = https.createServer(httpsOptions,(req,res)=>{
    myUnifyServer(req,res);    
});

serverHttps.listen(config.httpsPort,()=>{
    console.log("server listening on port "+config.httpsPort+" https mode");
});

const myUnifyServer = (req,res)=>{

    //memparsing url dengan parameter true sehingga dapat url dengan querystringnya juga
    const parsedUrl = url.parse(req.url,true);

    //mendaptkan bagian dari url 
    const path = parsedUrl.pathname;


    //mendapatkan bagian url yang telah dipotong dengan regex
    //dengan regex mencari karakter setelah dan sebelum tanda / dan ulangi lagi seperti itu 
    const trimmedPath = path.replace(/^\/+|\/+$/g,'');

    //mendapatkan method dari request
    const method = req.method.toLowerCase();

    //mendapatkan query string berupa object
    const queryStringObj = parsedUrl.query;

    //mendapatkan isi dari payload atau body dengan format apa saja
    const decoder = new StringDecoder("utf-8");

    //mendapatkan data headers dari request berupa objek
    const reqHeaders = req.headers;

    //inisiasi variabel buffer untuk menampung data aliran dari rewuest
    let buffer="";

    //event saat data datng kemudian data akan ditampung ke dalam buffer
    req.on('data',(data)=>{
        buffer += decoder.write(data);
    });

    //event ketika aliran data dari request selesai 
    req.on('end',()=>{
        buffer += decoder.end()

        //menyeleksi dan menentukan handler yang cocok berdasarkan path 
        const chooseHandler = typeof(routes[trimmedPath]) !== 'undefined' ? routes[trimmedPath]  : routes.notFoud;
        
        //menyusun data untuk digunakan oleh router handler
        const data = {
            'trimmedPath'       : trimmedPath,
            'queryStringObj'    : queryStringObj,
            'method'            : method,
            'reqHeaders'           : reqHeaders,
            'payload'           : buffer
        };

        //memetakan request sesuai dengan rute yang telah disediakan
        chooseHandler(data, (statusCode,payload)=>{
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};

            let payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });

    });
};


let routes = {
    home: (data,callback)=>{
        let content = quotes[ Math.floor(Math.random()*Math.floor(quotes.length))].text
        callback(200,{"quote": content});
    },

    notFoud:(data,callback)=>{
        callback(404,{"qoutes":"not found any quotes"});
    }
};