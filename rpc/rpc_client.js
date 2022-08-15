try {
  const RPC = require("discord-rpc");

  const RPC_client_id = "642466808821186562";

  const client = new RPC.Client({ transport: "ipc" });

  client.on("ready", () => {
    console.log("Logged in as", client.application);
    console.log("Authed for user", client.user);
  });

  function isSongPlaying() {
    try {
      const query = "V2::local::inst";
      const key = Object.keys(localStorage).find((k) => k.includes(query));

      return JSON.parse(localStorage[key]).playing;
    } catch (e) {
      console.error(e);

      return false;
    }
  }

  function getAlbumImage() {
    const imageElement = document.querySelector(
      ".playbackSoundBadge .sc-artwork span"
    );

    if (!imageElement) return "icon-big";

    let imageURL = imageElement.style.backgroundImage
      .replace(`url("`, "")
      .replace(`")`, "")
      .replace(/50x50/g, "500x500");

    if (getDetails().state == 2)
      return document
        .querySelector(".profileHeaderInfo__avatar div.image span")
        .style.backgroundImage.replace(`url("`, "")
        .replace(`")`, "");

    if (getDetails().state == 1) return "icon-big";

    return imageURL;
  }

  function getSongURL() {
    const songURLElement = document.querySelector(
      ".playbackSoundBadge__title a"
    );

    return songURLElement
      ? `https://soundcloud.com/${songURLElement.getAttribute("href")}`
      : "https://soundcloud.com";
  }

  function getDetails() {
    const currentSongTitleElement = document.querySelector(
      ".playbackSoundBadge__title a span:last-of-type"
    );
    const currentSongArtistElement = document.querySelector(
      ".playbackSoundBadge__titleContextContainer a"
    );

    const currentSongTitle = currentSongTitleElement
      ? document.querySelector(".playbackSoundBadge__title a span:last-of-type")
          .textContent
      : "";

    const currentSongArtist = currentSongArtistElement
      ? document.querySelector(".playbackSoundBadge__titleContextContainer a")
          .title
      : "";

    if (location.pathname == "/search" && !isSongPlaying())
      return {
        state: 1,
        text: "Searching a song",
      };

    if (
      location.pathname.split("/").filter((p) => p != "").length == 1 &&
      !isSongPlaying() &&
      document.querySelector(".profileHeaderInfo__userName") &&
      document.querySelector(".profileHeaderInfo__avatar div.image span")
    )
      return {
        state: 2,
        text: document.querySelector(".profileHeaderInfo__userName").innerText,
      };

    if (!currentSongArtistElement)
      return {
        state: 3,
        text: "Idle",
      };

    return {
      state: 0,
      text: `${currentSongArtist} - ${currentSongTitle}`,
    };
  }

  function getState() {
    const currentSongArtistElement = document.querySelector(
      ".playbackSoundBadge__titleContextContainer a"
    );

    const currentTimeElement = document.querySelector(
      ".playbackTimeline__timePassed span:last-of-type"
    );
    const allTimeElement = document.querySelector(
      ".playbackTimeline__duration span:last-of-type"
    );

    const currentTime = currentTimeElement
      ? currentTimeElement.textContent
      : "--:--";
    const allTime = allTimeElement ? allTimeElement.textContent : "--:--";

    if (!currentSongArtistElement) return undefined;

    if (getDetails().state == 2) return "Browsing an user profile";

    if (getDetails().state == 0)
      return isSongPlaying() ? `Playing (${currentTime}/${allTime})` : "Paused";
  }

  async function setActivity() {
    console.log("rpc");
    if (!client) {
      return;
    }

    client.setActivity({
      details: getDetails().text,
      state: getState(),
      largeImageKey: getAlbumImage(),
      largeImageText: "Using SoundCloud Desktop",
      smallImageKey:
        getAlbumImage() == "icon-big" ? "transparent" : "icon-circle",
      instance: false,
      buttons: [
        { label: "View song", url: getSongURL() },
        {
          label: "Get Soundcloud desktop",
          url: "https://github.com/Sebola3461/soundcloud-desktop",
        },
      ],
    });
  }

  client.on("ready", () => {
    setActivity();

    setInterval(() => {
      setActivity();
    }, 1000);
  });

  client.login({ clientId: RPC_client_id }).catch(console.error);
} catch (e) {
  console.error(e);
}
