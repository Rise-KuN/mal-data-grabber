let $ = jQuery;
$('#generate').click(function() {
    let id = $('#genID').val();
    fetch('https://api.jikan.moe/v4/anime/' + id + '/full')
    .then(res => res.json())
    .then(res => {
        // Image Webp
        if (res.data.images) {
            $('#image-url').val(res.data.images.webp.image_url);
        } else {
            $('#image-url').val(res.data.images.jpg.image_url);
        }
        // Trailer
        if (res.data.trailer.embed_url) {
            $('#trailer').val((res.data.trailer.embed_url).replace(
                '&autoplay=1', '&autoplay=0?showinfo=0'
            ));
        }
        // Title Romaji
        $('#title-rom').val(res.data.title);
        // Title English
        $('#title-english').val(res.data.title_english);
        // Title Japanese
        $('#title-jp').val(res.data.title_japanese);
        // Synopsis
        if (res.data.synopsis) {
            $('#synopsis').val(res.data.synopsis);
        }
        // Type
        if (res.data.type) {
            $('#type').val(res.data.type);
        }
        // Episodes
        if (res.data.episodes) {
            $('#episodes').val(res.data.episodes);    
        } else {
            $('#episodes').val('Unknown');
        }
        // Status
        $('#status').val(res.data.status.replace(
            'Finished Airing', 'Completed'
        ).replace(
            'Currently Airing', 'Releasing'
        ).replace(
            'Not yet aired', 'Upcoming'
        ));
        // Aired From
        if (res.data.aired.from) {
            $('#aired-from').val((res.data.aired.from).replace('T00:00:00+00:00', ''));
        } else {
            $('#aired-from').val('?');    
        }
        // Aired To
        if (res.data.aired.to) {
            $('#aired-to').val((res.data.aired.to).replace('T00:00:00+00:00', ''));
        } else {
            $('#aired-to').val('?');    
        }
        // Premiered/Season + Year
        if (res.data.season) {
            $('#season').val(res.data.season.replace(
                'winter', 'Winter'
            ).replace(
                'spring', 'Spring'
            ).replace(
                'summer', 'Summer'
            ).replace(
                'fall', 'Fall'
            ) + " " + res.data.year);
        } else {
            $('#season').val('?');
        }
        // Studios
        if (res.data.studios) {
            $('#studios').val(res.data.studios.map(item => {
                return item.name
            }).join(", "));   
        }
        // Source
        if (res.data.source) {
            $('#source').val(res.data.source);    
        }
        // Genres
        if (res.data.genres) {
            $('#genres').val(res.data.genres.map(item => {
                return item.name
            }).join(", "));  
        }
        // Themes
        if (res.data.themes) {
            $('#themes').val(res.data.themes.map(item => {
                return item.name
            }).join(", "));  
        }
        // Demographic
        if (res.data.demographics) {
            $('#demographic').val(res.data.demographics.map(item => {
                return item.name
            }).join(", "));  
        }
        // Duration
        if (res.data.duration.includes("hr")) {
            $('#duration').val((res.data.duration).split(".").join(" "));
        } else if (res.data.duration.includes("per ep")) {
            $('#duration').val((res.data.duration.replace(res.data.duration.slice(6), "").split(" ").join("")));    
        } else {
            $('#duration').val('Unknown'); 
        }
        // Rating 
        if (res.data.rating) {
            $('#rating').val(res.data.rating.replace(
                'G - All Ages', 'G-All Ages'
            ).replace(
                'PG - Children', 'PG-Children'
            ).replace(
                'PG-13 - Teens 13 or older', 'PG-13'
            ).replace(
                'R - 17+ (violence & profanity)', 'R-17+'
            ).replace(
                'R+ - Mild Nudity', 'R+ Mild Nudity'
            ).replace(
                'Rx - Hentai', 'Rx-Hentai'
            ));
        } else {
            $('#rating').val('N/A');     
        }
        // Score
        if (res.data.score) {
            $('#score').val(res.data.score); 
        } else {
            $('#score').val('N/A');     
        }
        // MAL URL
        if (res.data.url) {
            $('#mal-url').val(res.data.url);
        }
        // Official Site
        if (res.data.external) {  
            // Official Site
            $('#official-site').val(res.data.external.map(item => {
                if (item.name == "Official Site") {
                    return item.url
                }
            }).join(""));
            // Twitter
            $('#twitter').val(res.data.external.map(item => {
                if (item.name.includes("@")) {
                    return item.url
                }
            }).join(""));
            // AnimeDB
            $('#anidb').val(res.data.external.map(item => {
                if (item.name == "AniDB") {
                    return item.url
                }
            }).join(""));
            // ANN
            $('#ann').val(res.data.external.map(item => {
                if (item.name == "ANN") {
                    return item.url
                }
            }).join(""));
            // Wikipedia
            $('#wikipedia').val(res.data.external.map(item => {
                if (item.name == "Wikipedia") {
                    return item.url
                }
            }).join(""));
        }
    }).then(() => {
        $('.saveResult').html("<div class='saveMessage'></div>");
        $('.saveMessage').append("<div id='message' class='notice updated'><p>Success</p></div>").show();
        $('.saveMessage').delay(3000).fadeOut(800).hide('show');
    })
});
