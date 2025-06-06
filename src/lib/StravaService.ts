import kvService from "./KvService";

class StravaService {
  accessToken: string = "";
  refreshToken: string = "";

  async getTotalRunMiles(): Promise<number> {
    const stats = await this.getAthleteStats();
    const distanceInMeters = stats?.all_run_totals?.distance ?? 0;

    return Math.round(distanceInMeters * 0.000621371192);
  }

  async getAthleteStats(athleteId: string = import.meta.env.STRAVA_ATHLETE_ID) {
    let attemptCount = 0;
    let hasSucceeded = false;
    await this.setTokens();

    while (attemptCount <= 3 && !hasSucceeded) {
      try {
        const response = await fetch(
          `https://www.strava.com/api/v3/athletes/${athleteId}/stats`,
          {
            headers: {
              Authorization: "Bearer " + this.accessToken,
            },
          },
        );
        const data = await response.json();
        const hasErrors = (data.errors || []).length;

        if (hasErrors) {
          throw "Something went wrong requesting Strava data.";
        }

        hasSucceeded = true;

        return data;
      } catch (e) {
        console.log("Regenerating Strava access token.");

        await this.updateTokens();
      } finally {
        attemptCount++;
      }
    }
  }

  async setTokens() {
    if (this.accessToken) return this.accessToken;

    // const { access_token, refresh_token } = await this.db.getToken("strava");

    this.accessToken = (await kvService.getByKey(
      `strava:access_token`,
    )) as string;
    this.refreshToken = (await kvService.getByKey(
      `strava:refresh_token`,
    )) as string;
  }

  async updateTokens() {
    const response = await fetch("https://www.strava.com/api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_secret: import.meta.env.STRAVA_CLIENT_SECRET,
        client_id: import.meta.env.STRAVA_CLIENT_ID,
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
      }),
    });

    const { access_token, refresh_token } = await response.json();

    await Promise.all([
      kvService.update("strava:access_token", access_token),
      kvService.update("strava:refresh_token", refresh_token),
    ]);

    this.accessToken = access_token;
    this.refreshToken = refresh_token;
  }
}

export default new StravaService();
