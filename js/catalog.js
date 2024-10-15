function LoadCatalog(get_cat_from_url) {
    const releases_path = "releases/releases.json";
    const artists_path = "releases/artists.json";
    const people_path = "releases/people.json";

    var specific_release_to_load = null;

    const url = new URL(window.location.href);
    const url_params = new URLSearchParams(url.search);
        
    if (get_cat_from_url) {
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

    fetch(people_path)
        .then(response => response.json())
        .then(json => ProcessPeople(json));

    window.setInterval(SwapHeader, 1000);
}

function ProcessReleases(json, specific_release_to_load) {
    const release_parent = document.getElementById("release_parent");
    if (release_parent != null) {
        release_parent.innerHTML = "";
    }
    
    json.releases.forEach(release => {
        var release_result = ProcessRelease(release, specific_release_to_load);

        if (release_parent != null && release_result.match) {
            release_parent.innerHTML += release_result.release_html;

            if (specific_release_to_load != null){
                document.title = `Stream ${release_result.name} by ${release.artist}`;

                const cat_id_parent = document.getElementById("cat_id");
                cat_id_parent.innerHTML = `${release_result.cat_id}`;

                const cat_no_parent = document.getElementById("cat_no");
                cat_no_parent.innerHTML = `${release_result.cat_no}`;
            }
        }

        release.contributors.forEach(contributor => {
            AddArtist(contributor);            
        });

        if (release.icon != null) {
            const icon_path = `releases/${release.cat_id}${release.cat_no}/${release.icon}`;
            AddIcon(icon_path);
        }
    });
}

function ProcessRelease(release, match_release_cat) {
    const cat_id = release.cat_id;
    const cat_no = release.cat_no;
    const name = release.name;
    const artist = release.artist;
    const contributors = release.contributors;
    const cover = release.cover;

    const info_release_date = release.info_release_date;
    const info_about = release.info_about;
    const info_credits = release.info_credits;
    const info_special_thanks_header = release.info_special_thanks_header;
    const info_special_thanks_to = release.info_special_thanks_to;
    const info_license = release.info_license;
    const info_license_link = release.info_license_link;

    const style_text = release.style_text;
    const style_background = release.style_background;
    const style_highlight = release.style_highlight;

    const visible = release.visible;
    const downloadable = release.downloadable;
    const streamable = release.streamable;

    const link_stream = `stream?release=${cat_id}${cat_no}`
    const link_bandcamp = release.link_bandcamp;
    const link_youtube = release.link_youtube;
    const link_spotify = release.link_spotify;
    const link_itunes = release.link_itunes;
    const small = match_release_cat == null; 

    if (match_release_cat != null) {
        if (match_release_cat != `${cat_id}${cat_no}`) {
            return { match: false, contributors: contributors } 
        }

        if (style_text != null){
            document.documentElement.style.setProperty('--textColor', style_text);
            document.documentElement.style.setProperty('--highlightColor', style_text);
        }

        if (style_background != null){
            document.documentElement.style.setProperty('--backgroundColor', style_background);
            document.documentElement.style.setProperty('--semiBackgroundColor', style_background);
        }

        if (style_highlight != null){
            document.documentElement.style.setProperty('--linkColor', style_highlight);
        }
    }
    
    if (match_release_cat == null && !visible) {
        return { match: false };
    }

    const cover_path = `releases/${cat_id}${cat_no}/${cover}`;
    const download_path = `releases/${cat_id}${cat_no}/[${cat_id}${cat_no}] ${artist} - ${name}.zip`;

    var download_html = "";
    if (downloadable) {
        download_html = `<a href="${download_path}"><span style="font-weight: 900;">↓</span> download</a>`;
    }

    var streamable_html = "";
    if (streamable) {
        streamable_html = `<a href="${link_bandcamp}"><span style="font-weight: 900;">→</span> bandcamp</a> / `;
    }

    var contributors_html = "";
    for (let c = 0; c < contributors.length; c++) {
        var addComma = c < contributors.length - 1;
        contributors_html += `${contributors[c]}`;
        contributors_html += addComma ? ", " : "";
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
    info = `
    <div class="release_info">
        <hr>
    `;

    if (info_about != null){
        info += `<p>${info_about}</p>`;
    }

    info_credits.forEach(credit => {
        info += `<p>${credit}</p>`;
    });

    info += `<p>${info_special_thanks_header}<br>`;
    var first = true;
    info_special_thanks_to.forEach(person => {
        if (!first) {
            info += ", ";
        }
        info += `${person}`;

        first = false;
        
        AddPerson(person);
    });
    info += ".</p>";

    info += `
        <p><i>Released ${info_release_date} under <a href="${info_license_link}">${info_license}</a>.</i></p>    
        </div>
    `;
    
    if (small) {
        info = "";
    }

    release_html = `
        <!--Release ${cat_id}${cat_no}-->
        <div class="game_cell has_cover" dir="auto">
            <div class="game_thumb" style="background-color:#c2c2d1;"><a class="title game_link"
                href="${link_stream}"><img
                        height="315" width="315"
                        src="${cover_path}">
                </a></div>
            <div class="game_cell_data">
                <div class="game_title"><a class="title game_link"
                        href="${link_stream}" data-action="game_grid">${name}</a> <span class="catalog_number">${cat_no}</span></div>
                <div class="author">
                    <i>by ${contributors_html}</i>
                </div>
                ${release_links}
                ${info}
            </div>
        </div>
        `;

    return { match: true, 
        release_html: release_html,
        contributors: contributors, 
        name: name,
        artist: artist,
        cat_id: cat_id,
        cat_no: cat_no
    };
}

var artists = [];
function ProcessArtists(json) {
    artists = json.artists;
    SwapArtistName();
}

function AddArtist(artist) {
    for (let a = 0; a < artists.length; a++){
        if (artists[a].name == artist) { 
            return;
        }
    }

    artists.push({
        name: artist
    });

    AddPerson(artist);
}

function ProcessPeople(json) {
    json.people.forEach(person => {
        AddPerson(person);
    });
}

function AddPerson(person) { 
    setTimeout(() => {
        const target = document.getElementById("people");

        if (target == null) { return; }

        if (people.innerHTML.length > 0) {
            people.innerHTML += ", ";
        }
        people.innerHTML += person;        
    }, 100 + Math.random() * 900);
}

var icons = [];
var current_icon = -1;
function AddIcon(icon) {
    icons.push({
        icon: icon
    });
}

function SwapHeader() {
    //SwapIcon();
    SwapArtistName();
}

function SwapIcon() {
    const target = document.getElementById("icon");

    if (target == null) { return; }
    if (current_icon < 0) {
        current_icon = Math.floor(Math.random() * artists.length);
        var icon = icons[current_icon];

        target.src = icon.icon;
    } else {
        current_icon = -1;
        target.src = "images/_icon.svg";
    }
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