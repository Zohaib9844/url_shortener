const express = require('express');
const fs = require('fs');
const { json } = require('stream/consumers');

const app = express();
const PORT = 3000;

const urls = './urls.json';


app.use(express.json())

app.get('/', (req, res)=>{
    const data = JSON.parse(fs.readFileSync(urls, 'utf-8'));
    res.json(data);

});

app.post('/shorten', (req, res)=>{
    const {url}= req.body;
    if(!url){
        return res.json({error: 'URL is required'})
    }
    const data = JSON.parse(fs.readFileSync(urls, 'utf-8'));
    const shortId = Math.random().toString(36).substring(2, 8);

    const newUrl = {
        id: Date.now(),
        url, 
        shortId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accessCount:0,
    }

    data.push(newUrl);
    fs.writeFileSync(urls, JSON.stringify(data, null, 2));
    res.json(newUrl);
});

app.get('/:shortId', (req, res)=>{
    const shortId = req.params.shortId;
    const data = JSON.parse(fs.readFileSync(urls, 'utf-8'));

    const urlEntry = data.find(entry => entry.shortId === shortId);

    if(urlEntry){
        urlEntry.accessCount += 1;
        urlEntry.updatedAt = new Date().toISOString();
        fs.writeFileSync(urls, JSON.stringify(data, null, 2));
        res.redirect(urlEntry.url);
    }
    else{
        res.send("URL not found");
    }
});

app.put('/:shortId', (req, res)=>{
    const shortId = req.params.shortId;
    const {url} = req.body;
    const data = JSON.parse(fs.readFileSync(urls, 'utf-8'));

    const urlEntry = data.find(entry => entry.shortId === shortId);
    if(urlEntry){
        if(url){
            urlEntry.url = url;
            urlEntry.updatedAt = new Date().toISOString();
            fs.writeFileSync(urls, JSON.stringify(data, null, 2));
            res.json(urlEntry);
        } else{
            return res.json({error: 'url is required pls'});
        }
    } else{
        res.send("URL not found");
    }
});

app.delete('/:shortId', (req, res)=>{
    const shortId = req.params.shortId;
    const data = JSON.parse(fs.readFileSync(urls, 'utf-8'));
    const index = data.findIndex(entry => entry.shortId === shortId);
    if(index !== -1){
        data.splice(index, 1);
        fs.writeFileSync(urls, JSON.stringify(data, null, 2));
        res.json({message: "url deleted successfully"});
    } else{
        res.send("url not found");
    }
});

app.listen(PORT, ()=>{
    console.log('server is running on port', PORT);
});