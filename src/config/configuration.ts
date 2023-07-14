export default () => ({
  general: {
    bootAttempts: process.env.NODE_ENV === "development" ? 3 : 15,
  },
  node: {
    env: process.env.NODE_ENV,
  },
  discordClients: {
    tokens: {
      helper: process.env.HELPER_BOT_TOKEN_ID,
      events: process.env.EVENTS_BOT_TOKEN_ID,
      content: process.env.CONTENT_BOT_TOKEN_ID,
      ndb2: process.env.NDB2_BOT_TOKEN_ID,
    },
    appIds: {
      helper: process.env.HELPER_BOT_APP_ID,
      events: process.env.EVENTS_BOT_APP_ID,
      content: process.env.CONTENT_BOT_APP_ID,
      ndb2: process.env.NDB2_BOT_APP_ID,
    },
  },
  guildChannels: {
    livechat: process.env.CHANNELID_LIVECHAT,
    bocachica: process.env.CHANNELID_BOCACHICA,
    content: process.env.CHANNELID_CONTENT,
    announcements: process.env.CHANNELID_ANNOUNCEMENTS,
    general: process.env.CHANNELID_GENERAL,
    mods: process.env.CHANNELID_MODS,
    news: process.env.CHANNELID_NEWS,
    bots: process.env.CHANNELID_BOTS,
    splashdown: process.env.CHANNELID_SPLASHDOWN,
  },
  guildId: process.env.GUILD_ID,
  guildRoleIds: {
    mods: process.env.MODS_ROLE_ID,
    patreon_wemartians: process.env.WM_ROLE_ID,
    patreon_meco: process.env.MECO_ROLE_ID,
    youtube_main: process.env.YOUTUBE_ROLE_ID,
    youtube_anomaly: process.env.YT_ANOMALY_ROLE_ID,
    bots: process.env.BOT_ROLE_ID,
    hosts: process.env.HOST_ROLE_ID,
    guests: process.env.GUEST_ROLE_ID,
    discord_main: process.env.PREMIUM_ROLE_ID,
    discord_anomaly: process.env.ANOMALY_ROLE_ID,
    dicsord_never_fly_rideshare: process.env.NFRS_ROLE_ID,
  },
  rssFeeds: {
    wemartians: process.env.WMFEED,
    red_planet_review: process.env.RPRFEED,
    meco: process.env.MECOFEED,
    meco_headlines: process.env.HLFEED,
    offnominal_podcast: process.env.OFNFEED,
    offnominal_happyhour: process.env.HHFEED,
    offnominal_youtube: process.env.OFN_YT_FEED,
  },
  apiKeys: {
    rapid_api: process.env.RAPID_API_KEY,
    youtube: process.env.YT_API_KEY,
    rll: process.env.RLL_API_KEY,
    ndb2: process.env.NDB2_CLIENT_ID,
  },
  urls: {
    cloudinary: process.env.CLOUDINARY_URL,
    wm_deploy: process.env.WM_DEPLOY_URL,
    ndb2: process.env.NDB2_API_BASEURL,
  },
  github: {
    appId: process.env.GITHUB_APP_ID,
    botId: process.env.GITHUB_BOT_INSTALL_ID,
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    privateKey: process.env.GITHUB_PRIVATE_KEY,
  },
  database: {
    host: process.env.PGHOST,
    owner: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
    url: process.env.DATABASE_URL,
  },
  sanity: {
    cmsId: process.env.SANITY_CMS_ID,
    dataset: process.env.SANITY_DATASET || "dev",
    cdn:
      process.env.SANITY_CDN !== undefined
        ? process.env.SANITY_CDN === "true"
        : true,
  },
  ndb2: {
    mechanics: {
      updateWindow: process.env.GM_PREDICTION_UPDATE_WINDOW_HOURS || 12,
    },
  },
  starshipSiteTracker: {
    branch: process.env.STARSHIP_SITE_TRACKER_BRANCH || "master",
  },
});
