/** Official store links for rider + captain apps. */
export const APP_DOWNLOAD = {
  /** Rider app — Google Play */
  androidApkUrl:
    "https://play.google.com/store/apps/details?id=com.bullwave.rides.user&pcampaignid=web_share",
  androidPlayStoreUrl:
    "https://play.google.com/store/apps/details?id=com.bullwave.rides.user&pcampaignid=web_share",
  androidFileName: "Bull-wave-rides-user.apk",
  /** Captain / driver app — Google Play */
  captainAndroidApkUrl:
    "https://play.google.com/store/apps/details?id=com.bullwave.rides.driver&pcampaignid=web_share",
  captainAndroidPlayStoreUrl:
    "https://play.google.com/store/apps/details?id=com.bullwave.rides.driver&pcampaignid=web_share",
  captainAndroidFileName: "Bull-wave-rides-captain.apk",
  iosAppStoreUrl: process.env.NEXT_PUBLIC_IOS_APP_STORE_URL ?? "",
  captainIosAppStoreUrl:
    process.env.NEXT_PUBLIC_CAPTAIN_IOS_APP_STORE_URL ?? "",
} as const;
