import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

const app = express();

app.use(bodyParser.json());

const withDB = async (operations, res) => {
    try {
        // Connect to MongoDB
        const client = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true});
        const db = client.db('prajwal');
    
        await operations(db);
    
        client.close();
    } catch (error) {
        res.status(500).json({message: 'Error connecting to db', error});
    }
};

app.get('/api/publication/:name', async (req, res) => {
    withDB(async (db) => {
        const publicationName = req.params.name;

        const publicationInfo = await db.collection('publications').findOne({ name: publicationName });
        
        res.status(200).json(publicationInfo);
    }, res);
})

app.post('/api/publication/:name/upvote', async (req, res) => {
    withDB(async (db) => {
        const publicationName = req.params.name;

        const publicationInfo = await db.collection('publications').findOne({name: publicationName});
        await db.collection('publications').updateOne({name: publicationName}, {
            '$set' : {
                upvotes: publicationInfo.upvotes + 1,
            }
        });
        const updatedPublicationInfo = await db.collection('publications').findOne({name: publicationName});

        res.status(200).json(updatedPublicationInfo);
    }, res);
});

app.post('/api/publication/:name/add-comment', (req, res) => {
    const { username, text } = req.body;
    const publicationName = req.params.name;

    withDB(async (db) => {
        const publicationInfo = await db.collection('publications').findOne({ name: publicationName });
        
        await db.collection('publications').updateOne({ name: publicationName }, {
            '$set': {
                comments: publicationInfo.comments.concat({ username, text }),
            },
        });
        const updatedPublicationInfo = await db.collection('publications').findOne({ name: publicationName });

        res.status(200).json(updatedPublicationInfo);
    }, res);
});

app.listen(8000, () => console.log('Listening on port 8000'));
