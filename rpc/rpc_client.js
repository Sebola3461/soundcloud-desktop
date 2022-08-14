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

  async function setActivity() {
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

    console.log("rpc");
    if (!client) {
      return;
    }

    function getState() {
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

      return isSongPlaying() ? `Playing (${currentTime}/${allTime})` : "Paused";
    }

    client.setActivity({
      details: currentSongArtistElement
        ? `${currentSongArtist} - ${currentSongTitle}`
        : "Searching for a song",
      state: getState(),
      largeImageKey: getAlbumImage(),
      largeImageText: "Using Soundcloud desktop",
      smallImageKey: getAlbumImage() == "icon-big" ? "" : "icon-circle",
      instance: false,
      buttons: [
        { label: "Open in your browser", url: getSongURL() },
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
