async function fetchAniListData(id) {
    const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json' 
        },
        body: JSON.stringify({
            query: `
                query ($id: Int) {
                    Media(id: $id, type: ANIME) {
                        id
                        title {
                            romaji
                            english
                            native
                        }
                        trailer {
                            id
                            site
                            thumbnail
                        }
                        description
                        episodes
                        duration
                        status
                        type
                        format
                        averageScore
                        meanScore
                        popularity
                        genres
                        tags {
                            name
                            category
                        }
                        coverImage {
                            extraLarge
                            large
                            medium
                        }
                        bannerImage
                        characters {
                            edges {
                                node {
                                    name {
                                        full
                                    }
                                    image {
                                        large
                                    }
                                }
                            }
                        }
                        source
                        studios {
                            edges {
                                node {
                                    name
                                }
                            }
                        }
                        season
                        seasonYear
                        startDate {
                            year
                            month
                            day
                        }
                        endDate {
                            year
                            month
                            day
                        }
                        externalLinks {
                            url
                            site
                        }
                        isAdult
                    }
                }
            `,
            variables: { id: parseInt(id) }
        })
    });

    const data = await response.json();
    console.log("API Response:", data);
    return mapAniListData(data.data.Media);
}

// AniList data
function mapAniListData(data) {
    let trailerUrl = '';
    if (data.trailer && data.trailer.site === "youtube") {
        trailerUrl = `https://www.youtube.com/embed/${data.trailer.id}?enablejsapi=1&amp;wmode=opaque&amp;autoplay=0?showinfo=0`;
    }
    const externalLinks = data.externalLinks || [];
    const officialSite = externalLinks.find(link => link.site === "Official Site")?.url || '';
    const twitter = externalLinks.find(link => link.site.toLowerCase().includes("twitter"))?.url || '';
    const anidb = externalLinks.find(link => link.site === "AniDB")?.url || '';
    const ann = externalLinks.find(link => link.site === "Anime News Network")?.url || '';
    const wikipedia = externalLinks.find(link => link.site === "Wikipedia")?.url || '';
    
    const themes = data.tags
        ? data.tags.map(tag => tag.name)
        : [];
    
    const rating = data.isAdult ? 'Rx - Mild Nudity' : 'N/A';
    
    const status = data.status
        ? data.status.replace('FINISHED', 'Completed')
                     .replace('RELEASING', 'Releasing')
                     .replace('UPCOMING', 'Upcoming')
        : 'N/A';
    
    const season = data.season
        ? data.season.replace('WINTER', 'Winter')
                     .replace('FALL', 'Fall')
                     .replace('SUMMER', 'Summer')
                     .replace('SPRING', 'Spring')
        : 'N/A';
    
    const source = data.source
        ? data.source.replace('MANGA', 'Manga')
                     .replace('LIGHT_NOVEL', 'Light Novel')
                     .replace('WEB_NOVEL', 'Web Novel')
                     .replace('ORIGINAL', 'Original')
                     .replace('NOVEL', 'Novel')
                     .replace('ANIME', 'Anime')
                     .replace('VISUAL_NOVEL', 'Visual Novel')
                     .replace('VIDEO_GAME', 'Video Game')
                     .replace('DOUJINSHI', 'Doujinshi')
                     .replace('COMIC', 'Comic')
                     .replace('LIVE_ACTION', 'Live Action')
                     .replace('GAME', 'Game')
                     .replace('MULTIMEDIA_PROJECT', 'Multimedia Project')
                     .replace('PICTURE_BOOK', 'Picture Book')
                     .replace('OTHER', 'Other')
        : 'N/A';
    
    const format = data.format
        ? data.format.replace('TV_SHOW', 'TV')
                     //.replace('TV', 'TV')
                     .replace('MOVIE', 'Movie')
                     .replace('TV_SHORT', 'TV Short')
                     .replace('SPECIAL', 'Special')
                     //.replace('OVA', 'OVA')
                     //.replace('ONA', 'ONA')
                     .replace('MUSIC', 'Music')
        : 'N/A';
    
    return {
        title: {
            romaji: data.title.romaji || 'N/A',
            english: data.title.english || 'N/A',
            japanese: data.title.native || 'N/A'
        },
        description: data.description || 'N/A',
        format: format,
        season: season,
        seasonYear: data.seasonYear || 'N/A',
        episodes: data.episodes || 'N/A',
        duration: data.duration ? `${data.duration} min` : 'N/A',
        status: status,
        source: source,
        producers: data.studios.edges?.filter(studio => !studio.isAnimationStudio).map(studio => studio.node.name) || [],
        startDate: formatDate(data.startDate),
        endDate: formatDate(data.endDate),
        genres: data.genres || [],
        themes: themes || [],
        coverImageExtraLarge: data.coverImage.extraLarge || '',
        coverImageLarge: data.coverImage.large || '',
        coverImageMedium: data.coverImage.medium || '',
        bannerImage: data.bannerImage || '',
        characters: data.characters.edges?.map(character => ({
            name: character.node.name.full,
            image: character.node.image.large,
        })) || [],
        popularity: data.popularity || 'N/A',
        averageScore: data.averageScore || 'N/A',
        meanScore: data.meanScore || 'N/A',
        anilistUrl: `https://anilist.co/anime/${data.id}`,
        externalLinks: {
            officialSite,
            twitter,
            anidb,
            ann,
            wikipedia
        },
        trailerUrl: trailerUrl || 'N/A',
        rating: rating
    };
}

function formatDate(dateSeries) {
    if (!dateSeries || (!dateSeries.year && !dateSeries.month && !dateSeries.day)) {
        return 'N/A';
    }
    const { year, month, day } = dateSeries;
    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${monthNames[month - 1] || ''} ${day || ''}, ${year || ''}`.trim();
}

let $ = jQuery;

let selectedSource = "MAL"; // Set MAL As Default

$('#gen-selector').change(function() {
    selectedSource = $(this).val();
    $('#generate').text(`Fetch from ${selectedSource}`);
});

function getAnimeIdFromInput(input) {
    const match = input.match(/\/anime\/(\d+)/);
    return match ? match[1] : input;
}

$('#generate').click(function() {
    let input = $('#genID').val();
    let id = getAnimeIdFromInput(input);

    if (selectedSource === "MAL") {
        // Fetch from MAL
        fetch('https://api.jikan.moe/v4/anime/' + id + '/full')
        .then(res => res.json())
        .then(res => {
            // Image Webp
            if (res.data.images) {
                $('#image-url').val(res.data.images.webp.large_image_url || '');
            } else {
                $('#image-url').val(res.data.images.jpg.large_image_url || '');
            }
            // Trailer
            if (res.data.trailer.embed_url) {
                $('#trailer').val(res.data.trailer);
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
                let Duplicate_Official = false;
                $('#official-site').val(res.data.external.map(item => {
                    if (item.name === "Official Site" && !Duplicate_Official) {
                        Duplicate_Official = true;
                        return item.url;
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
                    if (item.url.includes("en.wikipedia.org")) {
                        return item.url
                    }
                }).join(""));
            }
        }).then(() => {
            $('.saveResult').html("<div class='saveMessage'></div>");
            $('.saveMessage').append("<div id='message' class='notice updated'><p>Success</p></div>").show();
            $('.saveMessage').delay(3000).fadeOut(800).hide('show');
        });
    } else if (selectedSource === "AniList") {
        // Fetch from AniList
        fetchAniListData(id).then(data => {
            if (data.coverImageLarge) {
                $('#image-url').val(data.coverImageLarge);
            }
            
            if (data.trailerUrl) {
                $('#trailer').val(data.trailerUrl);
            }
            
            if (data.title.romaji) {
                $('#title-rom').val(data.title.romaji);
            }
            
            if (data.title.english) {
                $('#title-english').val(data.title.english);
            }
            
            if (data.title.japanese) {
                $('#title-jp').val(data.title.japanese);
            }
            
            if (data.description) {
                $('#synopsis').val(data.description);
            }
            
            if (data.format) {
                $('#type').val(data.format);
            }
            
            if (data.episodes) {
                $('#episodes').val(data.episodes || 'N/A');
            }
                
            if (data.themes) {
                $('#themes').val(data.themes.join(", "));
            }
            
            if (data.duration) {
                $('#duration').val(data.duration || 'N/A');
            }
            
            if (data.status) {
                $('#status').val(data.status);
            }
            
            if (data.startDate) {
                $('#aired-from').val(data.startDate || '?');
            }
            
            if (data.endDate) {
                $('#aired-to').val(data.endDate || '?');
            }
            
            if (data.source) {
                $('#source').val(data.source);
            }
            
            if (data.season) {
                $('#season').val(data.season + " " + data.seasonYear);
            }
            
            if (data.producers) {
                $('#studios').val(data.producers.join(", "));
            }
            
            if (data.genres) {
                $('#genres').val(data.genres.join(", "));
            }
            
            if (data.averageScore) {
                $('#score').val(data.averageScore + "%" || 'N/A');
            }
            
            if (data.rating) {
                $('#rating').val(data.rating);
            }
            
            if (data.anilistUrl) {
                $('#mal-url').val(data.anilistUrl);
            }
            
            if (data.externalLinks) {
                $('#official-site').val(data.externalLinks.officialSite);
                $('#twitter').val(data.externalLinks.twitter);
                $('#anidb').val(data.externalLinks.anidb);
                $('#ann').val(data.externalLinks.ann);
                $('#wikipedia').val(data.externalLinks.wikipedia);
            }
        }).then(() => {
            $('.saveResult').html("<div class='saveMessage'></div>");
            $('.saveMessage').append("<div id='message' class='notice updated'><p>Success</p></div>").show();
            $('.saveMessage').delay(3000).fadeOut(800).hide('show');
        });
    }
});
