let currentAudio = null; // Track the currently playing audio
const trackBar = document.getElementById("track-bar");
const trackBarTitle = document.getElementById("track-bar-title");
const trackBarArtist = document.getElementById("track-bar-artist");
const trackBarImage = document.getElementById("track-bar-image");

async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        btoa(
          "b11ce43cda8148c4a8ff5a8195bbd4e4:691601c5aa5447b2b342108920d672a8"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to obtain access token");
  }

  const data = await response.json();
  return data.access_token;
}

async function getTopHits() {
  try {
    const token = await getAccessToken();
    const response = await fetch(
      "https://api.spotify.com/v1/playlists/37i9dQZEVXbKkidEfWYRuD/tracks", // Corrected endpoint
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      displayHits(data.items);
    } else {
      console.error(
        "Failed to fetch data",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.error(error);
  }
}

function displayHits(hits) {
  const hitsList = document.getElementById("top-hits");
  hitsList.innerHTML = ""; // Clear existing hits if any

  // Update hero section with the first hit
  if (hits.length > 0) {
    const firstHit = hits[0].track;
    document.querySelector(".hero-section__artist").src =
      firstHit.album.images[0]?.url; // Update artist photo
    document.querySelector(
      ".hero-section__descr"
    ).innerHTML = `Найвідоміший виконавець цього місяця: <br /><a href="https://open.spotify.com/artist/${
      firstHit.artists[0].id
    }" target="_blank"><b>${firstHit.artists
      .map((artist) => artist.name)
      .join(", ")}</a></b>`;
  }

  hits.forEach((hit) => {
    console.log(hit);

    const listItem = document.createElement("li");
    listItem.className = "chart-section__item"; // Add class to li

    const trackCard = document.createElement("article");
    trackCard.className = "track-card"; // Add class to article

    // Create an image element for the album cover
    const imgDiv = document.createElement("div");
    const img = document.createElement("img");
    imgDiv.className = "track-card__img-box"; // Add class to img
    img.className = "track-card__img"; // Add class to img
    img.src = hit.track.album.images[0]?.url; // Get the first image URL
    img.alt = `Album cover of ${hit.track.name}`;
    img.width = 190; // Set width for the image
    img.height = 190; // Set height for the image
    img.loading = "lazy"; // Set loading attribute

    imgDiv.appendChild(img);

    // Add click event to play preview
    imgDiv.addEventListener("click", () => {
      const previewUrl = hit.track.preview_url;
      const trackTitle = hit.track.name;
      const trackArtist = hit.track.artists
        .map((artist) => artist.name)
        .join(", ");
      const trackImage = hit.track.album.images[0]?.url;

      if (previewUrl) {
        // Check if the clicked track is the same as the currently playing track
        if (currentAudio && currentAudio.src === previewUrl) {
          // If the same track is clicked, pause the audio
          currentAudio.pause();
          trackBar.classList.remove("visible");
          currentAudio = null; // Clear currentAudio
        } else {
          // Pause currently playing audio if it exists
          if (currentAudio) {
            currentAudio.pause();
          }

          // Create and play new audio
          trackBar.classList.add("visible");
          trackBarTitle.textContent = trackTitle;
          trackBarArtist.textContent = trackArtist;
          trackBarImage.src = trackImage;
          currentAudio = new Audio(previewUrl);
          currentAudio.play().catch((error) => {
            alert("Error playing audio:", error);
            trackBar.classList.remove("visible");
          });

          currentAudio.addEventListener("ended", () => {
            trackBar.classList.remove("visible");
            currentAudio = null; // Clear currentAudio when finished
          });
        }
      } else {
        alert("На жаль, в цього треку не існує демонстрації");
      }
    });

    // Create an h2 element for the track title
    const title = document.createElement("h2");
    const trackLink = document.createElement("a");

    trackLink.target = "_blank";
    trackLink.href = "https://open.spotify.com/track/" + hit.track.id;
    title.className = "track-card__title"; // Add class to h2
    trackLink.className = "track-card__title"; // Add class to h2
    trackLink.textContent = hit.track.name; // Set track name

    title.appendChild(trackLink);

    // Create a p element for the artist name
    const artist = document.createElement("a");
    artist.target = "_blank";
    artist.className = "track-card__artist";
    artist.href = "https://open.spotify.com/artist/" + hit.track.artists[0].id; // Add class to p
    artist.textContent = `By ${hit.track.artists
      .map((artist) => artist.name)
      .join(", ")}`; // Set artist name

    // Append elements to the track card
    trackCard.appendChild(imgDiv);
    trackCard.appendChild(title);
    trackCard.appendChild(artist);

    // Append the track card to the list item
    listItem.appendChild(trackCard);

    // Append the list item to the hits list
    hitsList.appendChild(listItem);
  });
}

getTopHits();
