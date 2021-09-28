import Twitter from 'twitter-lite';
import { readFileSync, writeFileSync } from 'fs';
import { rewriteText } from './text';

const {
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN_KEY,
  TWITTER_ACCESS_TOKEN_SECRET,
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
  if (!tweet) {
    return null;
  }
  return {
    id: tweet.id,
    text: tweet.text,
    author: tweet.user.screen_name,
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
    access_token_key: TWITTER_ACCESS_TOKEN_KEY, // from your User (oauth_token)
    access_token_secret: TWITTER_ACCESS_TOKEN_SECRET, // from your User (oauth_token_secret)
  };
  const app = new Twitter(config);

  // const client = new Twitter(config);
  // const res = await client.getBearerToken();
  // const app = new Twitter({
  //   ...config,
  //   bearer_token: res.access_token
  // });

  //
  // Run the process for each target in our list
  //
  const { targets } = JSON.parse(readFileSync(`${__dirname}/../data/targets.json`, 'utf8'));
  for await (const target of targets) {
    console.log(target);
    const tweets = await app.get('statuses/user_timeline', {
      screen_name: target.screen_name,
      count: 5,
    });

    for (const tweet of tweets) {
      if (!getTweetRecord(tweet.id) && !tweet.text.startsWith('RT ')) {
        let rewritten = rewriteText(tweet.text, K_FACTOR);
        rewritten = rewritten?.replace(/@/g, '');
        rewritten = rewritten?.replace(/….*$/g, '…');

        // Don't tweet it if we didn't modify it
        let response = null;
        if (!!rewritten) {
          response = await app.post('statuses/update', {
            status: rewritten,
          });
        }

        writeTweetRecord(tweet.id, { original: getDesiredFields(tweet), rewritten, tweeted: getDesiredFields(response) });
      }
    }
  }
};

run()
  .then(() => console.log('Ran successfully'))
  .catch(e => {
    console.error(e._headers);
    console.error(JSON.stringify(e, null ,2));
    process.exit(1);
  });
