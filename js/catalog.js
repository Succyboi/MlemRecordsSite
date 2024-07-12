function LoadCatalog(get_cat_from_url) {
    const releases_path = "releases/releases.json";
    const artists_path = "releases/artists.json";

    var specific_release_to_load = null;
    if (get_cat_from_url) {
        const url = new URL(window.location.href);
        const url_params = new URLSearchParams(url.search);

        if (url_params.has("release")) {
            specific_release_to_load = url_params.get("release");
        }
    }

    fetch(releases_path)
        .then(response => response.json())
        .then(json => ProcessReleases(json, specific_release_to_load));

    fetch(artists_path)
        .then(response => response.json())
        .then(json => ProcessArtists(json));

    window.setInterval(SwapArtistName, 3000);
}

function ProcessReleases(json, specific_release_to_load) {
    const release_parent = document.getElementById("release_parent");
    release_parent.innerHTML = "";

    json.releases.forEach(release => {
        var release_result = GetReleaseHTML(release, specific_release_to_load);

        if (specific_release_to_load == null || release_result.match) {
                release_parent.innerHTML += release_result.release_html;
        }
    });
}

function GetReleaseHTML(release, match_release_cat) {
    const cat_id = release.cat_id;
    const cat_no = release.cat_no;
    const name = release.name;
    const artist = release.artist;
    const info_release_date = release.info_release_date;
    const info_about = release.info_about;
    const info_credits = release.info_credits;
    const downloadable = release.downloadable;
    const streamable = release.streamable;
    const link_bandcamp = release.link_bandcamp;
    const link_youtube = release.link_youtube;
    const link_spotify = release.link_spotify;
    const link_itunes = release.link_itunes;
    const small = match_release_cat == null; 

    if (match_release_cat != null && match_release_cat != `${cat_id}${cat_no}`) {
         return { match: false } 
    }

    const cover_path = `releases/${cat_id}${cat_no}/cover.png`;
    const download_path = `releases/${cat_id}${cat_no}/[${cat_id}${cat_no}] ${artist} - ${name}.zip`;

    var download_html = "";
    if (downloadable) {
        download_html = `<a href="${download_path}"><span style="font-weight: 900;">↓</span> download</a>`;
    }

    var streamable_html = "";
    if (streamable) {
        streamable_html = `<a href="stream?release=${cat_id}${cat_no}"><span style="font-weight: 900;">→</span> stream</a> / `;
    }

    var release_links = "";
    if (small) {
        release_links = `
        <div class="release_links"><p>
            ${streamable_html}${download_html}
        </p></div>`;
    } else {
        release_links = `
            <div class="release_links"><p>
                <a href="${link_bandcamp}"><span style="font-weight: 900;">→</span> bandcamp</a>`;
                
        if (link_youtube != null) {
            release_links += `<br><a href="${link_youtube}"><span style="font-weight: 900;">→</span> youtube</a>`;
        }

        if (link_spotify != null) {
            release_links += `<br><a href="${link_spotify}"><span style="font-weight: 900;">→</span> spotify</a>`;
        }

        if (link_itunes != null) {
            release_links += `<br><a href="${link_itunes}"><span style="font-weight: 900;">→</span> itunes</a>`;
        }
        
        release_links += `<br><a href="${download_path}"><span style="font-weight: 900;">↓</span> download</a>
            </p></div>`;
    }

    var info = "";
    if (!small) {
        info = `
            <div class="release_info">
                <hr>
                <p>${info_about}</p>
        `;

        info_credits.forEach(credit => {
            info += `<p>${credit}</p>`;
        });

        info += `
            <p><i>Released ${info_release_date}.</i></p>    
            </div>
        `;
    }

    release_html = `
        <!--Release ${cat_id}${cat_no}-->
        <div class="game_cell has_cover" dir="auto">
            <div class="game_thumb" style="background-color:#c2c2d1;"><a class="title game_link"
                href="${link_bandcamp}"><img
                        height="315" width="315"
                        src="${cover_path}">
                <span class="catalog_number">${cat_no}</span></a></div>
            <div class="game_cell_data">
                <div class="game_title"><a class="title game_link"
                        href="${link_bandcamp}" data-action="game_grid">${name}</a></div>
                <div class="author">
                    <i>by ${artist}</i>
                </div>
                ${release_links}
                ${info}
            </div>
        </div>
        `;

    return { match: true, release_html: release_html };
}

let artists;
function ProcessArtists(json) {
    artists = json.artists;
    SwapArtistName();
}

function SwapArtistName() {
    const target = document.getElementById("highlight_artist");

    if (target == null) { return; }

    const old_artist_name = target.innerHTML
    var artist = artists[Math.floor(Math.random() * artists.length)];

    while (old_artist_name == artist.name) {
        artist = artists[Math.floor(Math.random() * artists.length)];
    }
    target.innerHTML = `${artist.name}`;
}