import Twitter from 'twitter-lite';
import { readFileSync, writeFileSync } from 'fs';
import { rewriteText } from './text';

const {
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  ACCESS_TOKEN,
  ACCESS_TOKEN_SECRET,
} = process.env;

//
// Params
//
const K_FACTOR = 15;

//
// Use the filesystem as our DB. Each run of this script will be followed by a git commit to persist the changes.
//
const writeTweetRecord = (tweetId, tweet) => {
  writeFileSync(`${__dirname}/../history/${tweetId}.json`, JSON.stringify(tweet), 'utf8');
};

const getTweetRecord = (tweetId) => {
  try {
    const data = readFileSync(`${__dirname}/../history/${tweetId}.json`, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
};

const getDesiredFields = (tweet) => {
  return {
    id: tweet.id,
    text: tweet.text,
    author_id: tweet.author_id,
    created_at: tweet.created_at,
  };
};

const run = async () => {
  //
  // Do auth
  //
  const config = {
    subdomain: 'api',
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
  };
  const client = new Twitter(config);
  const res = await client.getBearerToken();
  const app = new Twitter({
    ...config,
    bearer_token: res.access_token
  });

  //
  // Run the process for each target in our list
  //
  const { targets } = JSON.parse(readFileSync(`${__dirname}/../data/targets.json`, 'utf8'));
  for await (const target of targets) {
    const tweets = await app.get('statuses/user_timeline', {
      screen_name: target.screen_name,
      count: 10,
    });

    for (const tweet of tweets) {
      if (!getTweetRecord(tweet.id)) {
        const rewritten = rewriteText(tweet.text, K_FACTOR);

        // TODO: Add the name of the author?
        console.log(rewritten);

        // const response = await client.post('statuses/update', {
        //   status: rewritten,
        // });
        //
        // writeTweetRecord(tweet.id, { original: getDesiredFields(tweet), rewritten: getDesiredFields(response) });
      }
    }
  }
};
