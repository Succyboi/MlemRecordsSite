function LoadCatalog() {
    const releases_path = "releases/releases.json";
    const artists_path = "releases/artists.json";

    fetch(releases_path)
        .then(response => response.json())
        .then(json => ProcessReleases(json));

    fetch(artists_path)
        .then(response => response.json())
        .then(json => ProcessArtists(json));

    window.setInterval(SwapArtistName, 3000);
}

function ProcessReleases(json) {
    const release_parent = document.getElementById("release_parent");
    release_parent.innerHTML = "";

    json.releases.forEach(release => {
        const cat_no = release.cat_no;
        const name = release.name;
        const artist = release.artist;
        const bandcamp_link = release.bandcamp_link;
        const downloadable = release.downloadable;

        const cover_path = `releases/${cat_no}/cover.png`;

        var download_html = "";
        var image_html = "";

        if (downloadable){
            download_html = `
                <div class="download"><p>
                    <a><span style="font-weight: 900;">↓</span> download</a>
                </p></div>
            `;
        }

        release_parent.innerHTML += `
            <!--BEEP BOOP-->
            <div class="game_cell has_cover" dir="auto">
                <div class="game_thumb" style="background-color:#c2c2d1;"><a class="title game_link"
                    href="${bandcamp_link}"><img
                            height="315" width="315"
                            src="${cover_path}"></a></div>
                <div class="game_cell_data">
                    <div class="game_title"><a class="title game_link"
                            href="${bandcamp_link}" data-action="game_grid"><span class="catalog_number">[${cat_no}]</span> ${name}</a></div>
                    <div class="author">
                        <i>by ${artist}</i>
                    </div>
                    ${download_html}
                </div>
            </div>
        `;
    });
}

let artists;
function ProcessArtists(json) {
    artists = json.artists;
    SwapArtistName();
}

function SwapArtistName() {
    const target = document.getElementById("highlight_artist");
    const old_artist_name = target.innerHTML
    var artist = artists[Math.floor(Math.random() * artists.length)];

    while (old_artist_name == artist.name) {
        artist = artists[Math.floor(Math.random() * artists.length)];
    }
    target.innerHTML = `${artist.name}`;
}