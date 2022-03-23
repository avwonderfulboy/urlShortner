const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

exports.handler = async (event, context, callback) => {
  try {
    console.log({ event });

    if (event.requestContext.http.method === "GET") {
      const { short_url } = event.queryStringParameters;

      if (!short_url.length)
        return {
          statusCode: 400,
          body: "Short url cannot be empty ",
        };

      let resp = await dynamodb
        .getItem({
          TableName: "shortner",
          Key: {
            short_url: { S: short_url },
          },
        })
        .promise();

      if (resp.Item === undefined) {
        return {
          statusCode: 400,
          body: "Opps! its not here.Please create short Url for this Url",
        };
      }

      return {
        statusCode: 302,
        headers: {
          location: `https://${resp.Item.long_url.S}`,
        },
      };
    }
    if (event.requestContext.http.method === "POST") {
      const { long_url } = JSON.parse(event.body);
      if (long_url.length == 0) return { body: " url cannot be empty  " };
      let short_url =
        Math.random().toString(32).substring(2, 4) +
        Math.random().toString(32).substring(2, 4);

      let response = await dynamodb
        .putItem({
          TableName: "shortner",
          Item: {
            short_url: { S: short_url },
            long_url: { S: long_url },
          },
        })
        .promise();
      short_url =
        "https://1aiz8tjbj6.execute-api.us-east-1.amazonaws.com/urlStage/shortUrl?short_url" +
        short_url;
      return { short_url };
    }
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify(err),
    };
  }
};
