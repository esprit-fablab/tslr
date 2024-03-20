const express = require('express');
const bodyParser = require('body-parser');
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express');
const {makeExecutableSchema} = require('graphql-tools');

const PORT = 4242;

let typeDefs = [`
type Query {
  hello: String
}

schema {
  query: Query
}`];

let resolvers = {
    Query: {
        hello() {
            return 'world';
        }
    }
};

let schema = makeExecutableSchema({typeDefs, resolvers});

let app = express();

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    return next();
});
app.use('/graphql', bodyParser.json(), graphqlExpress({schema}));
app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}));

app.listen(PORT, () => {
    console.log('The server is online at ' + PORT);
});