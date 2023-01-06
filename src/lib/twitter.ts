
import { formatISO, addDays } from "date-fns";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_KEY
);

type MediaObject = {
  type: string;
  url: string;
};

type Tweet = {
  text: string;
  id: string;
  media: MediaObject[];
  created_at?: string;
  author_id?: string;
  reply_settings?: string;
  conversation_id?: string;
  user?: {
    id: string;
    name: string;
    username: string;
  };
};

type Thread = {
  name: string;
  handle: string;
  date: string;
  tweets: Tweet[];
};

const applyMediaToTweets = (responseData): Tweet[] => {
  return (responseData?.data ?? []).map((t) => {
    t.media = (t?.attachments?.media_keys ?? []).map((media_key) => {
      const foundMedia = (responseData.includes?.media ?? []).find((m) => {
        return m.media_key === media_key;
      });

      return {
        type: foundMedia.type,
        url: foundMedia.url ?? "",
      };
    });

    return t;
  });
};

const getTweet = async (id: string): Promise<Tweet | null> => {
  const params = new URLSearchParams({
    expansions: "referenced_tweets.id.author_id,attachments.media_keys",
    "tweet.fields": "created_at",
    "user.fields": "username",
    "media.fields": "url",
  }).toString();

  const response = await fetch(
    `https://api.twitter.com/2/tweets/${id}?${params}`,
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.TWITTER_BEARER_TOKEN}`,
      },
    }
  );

  if (response.status !== 200) {
    return null;
  }

  const data = await response.json();

  // Needed to get the name & username.
  return {
    ...data.data,
    media: data.includes?.media ?? [],
    user: data.includes.users.find((u) => {
      return u.id === data.data.author_id;
    }),
  };
};

const getAllTweetsByConversationId = async ({
  conversationId,
  extraParams = {},
}): Promise<Tweet[]> => {
  const params = new URLSearchParams({
    query: `conversation_id:${conversationId}`,
    max_results: "100",
    expansions:
      "in_reply_to_user_id,entities.mentions.username,attachments.media_keys",
    "tweet.fields": "conversation_id",
    "media.fields": "url",
    ...extraParams,
  }).toString();

  const response = await fetch(
    `https://api.twitter.com/2/tweets/search/recent?${params}`,
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.TWITTER_BEARER_TOKEN}`,
      },
    }
  );

  const responseJson = await response.json();

  // Add a `media` property onto each tweet.
  const tweets: Tweet[] = applyMediaToTweets(responseJson);

  const moreTweets = responseJson.meta.next_token
    ? await getAllTweetsByConversationId({
        conversationId,
        extraParams: { pagination_token: responseJson.meta.next_token },
      })
    : [];

  return tweets.concat(moreTweets);
};

/**
 * Ideally, this would use the v2 search endpoint, but you need special approval to be able to
 * query tweets from more than a week ago.
 *
 * https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent
 *
 */
const getAllTweetsSinceId = async ({
  id,
  endTime,
  userId,
  extraParams = {},
}): Promise<Tweet[]> => {
  const params = new URLSearchParams({
    since_id: id,
    end_time: endTime,
    expansions:
      "in_reply_to_user_id,referenced_tweets.id.author_id,attachments.media_keys",
    exclude: "retweets",
    max_results: "100",
    "tweet.fields": "conversation_id",
    "user.fields": "username",
    "media.fields": "url",
    ...extraParams,
  }).toString();

  const response = await fetch(
    `https://api.twitter.com/2/users/${userId}/tweets?${params}`,
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.TWITTER_BEARER_TOKEN}`,
      },
    }
  );

  const responseJson = await response.json();
  const tweets: Tweet[] = applyMediaToTweets(responseJson?.data);

  const moreTweets = responseJson.meta.next_token
    ? await getAllTweetsSinceId({
        id,
        endTime,
        userId,
        extraParams: { pagination_token: responseJson.meta.next_token },
      })
    : [];

  return tweets.concat(moreTweets);
};

const findRepliesToTweet = (tweets, originalTweetId, userId): Tweet[] => {
  return tweets.filter((tweet) => {
    const replyingToUserId = tweet.in_reply_to_user_id;
    const isReplyingToUserThatIsNotSelf =
      replyingToUserId && replyingToUserId !== userId;

    return (
      tweet.conversation_id === originalTweetId &&
      !isReplyingToUserThatIsNotSelf &&
      tweet.author_id === userId
    );
  });
};

const logTweet = async ({
  tweetId,
  isValid,
}: {
  tweetId: string;
  isValid: boolean;
}) => {
  return await supabase.from("converted_twitter_threads").insert([
    {
      conversation_id: tweetId,
      is_valid: isValid,
      environment: import.meta.env.NODE_ENV,
    },
  ]);
};

const capitalizeString = (string: string): string => {
  const words = string.split(" ");

  return words
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

const getThread = async (tweetId): Promise<Thread> => {
  const originalTweet = await getTweet(tweetId);
  await logTweet({ tweetId, isValid: !!originalTweet });
  let tweets = [];

  if (!originalTweet) {
    return null;
  }

  /**
   * Ideally, we would always be able to use the 'recent search' approach. Unfortunately, it's limited
   * to the past seven days. So, as a fallback, search through a user's tweets and piece things together
   * more manually.
   */
  tweets = await getAllTweetsByConversationId({ conversationId: tweetId });

  if (!tweets.length) {
    tweets = await getAllTweetsSinceId({
      id: tweetId,
      userId: originalTweet.author_id,

      endTime: formatISO(addDays(new Date(originalTweet.created_at), 14)),
    });
  }

  const filteredTweets = findRepliesToTweet(
    tweets,
    tweetId,
    originalTweet.author_id
  );
  const orderedTweets = [originalTweet, ...filteredTweets.reverse()];

  return {
    name: capitalizeString(originalTweet.user.name),
    handle: originalTweet.user.username,
    date: originalTweet.created_at,
    tweets: orderedTweets.map((t) => {
      let { text, id, media } = t;

      // @todo: GET each link in the text and see if it's an image.
      // Do so by using fetchresponse.url and checking for "/photo/";

      // Links!
      text = text.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a target="_blank" href="$1">$1</a>'
      );

      // Handles!
      text = text.replace(
        /(@[^\s^\.*]+)/g,
        '<a target="_blank" href="https://twitter.com/$1">$1</a>'
      );

      // Hashtags!
      text = text.replace(
        /(#[^\s^\.*]+)/g,
        '<a href="https://twitter.com/hashtag/$1">$1</a>'
      );

      return {
        id,
        text,
        media: media.filter((m) => m.type === "photo"),
      };
    }),
  };
};

export default getThread;
