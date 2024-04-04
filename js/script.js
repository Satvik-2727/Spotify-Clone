let hrefs = []
let currentSong = new Audio();
let songs = [];
let track;
let currFolder;

document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://192.168.29.245:3000/songs/${folder}/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.innerText);
        }
    }


    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        let i = 0
        let displaySong = truncateText(song.replaceAll(".mp3", " "), 3)
        songUL.innerHTML = songUL.innerHTML +
            `<li class="list-style flex rounded">
                <img class="invert" src="img/music.svg" alt="">
                <div class="song-details">
                    <a href="${song}" class="text-decoration block white">${displaySong}</a>
                    <a class="text-decoration block white">RAIN</a>
                </div>
                <img class="invert play2" src="img/play2.svg" alt="play now">
        </li>`;
        i++;

    }

    // Attach an event listerner to play a song

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            element.preventDefault(); // Prevent default behavior of anchor tag
            let href = e.querySelector(".song-details").getElementsByTagName("a")[0].getAttribute("href");
            console.log(`Href : ${href}`)
            playMusic(href.trim());
        });
    });

    Array.from(document.querySelector(".songList").getElementsByTagName("img")).forEach(e => {
        e.addEventListener("click", element => {
            element.preventDefault(); // Prevent default behavior of anchor tag
            let href = e.querySelector(".song-details").getElementsByTagName("a")[0].getAttribute("href");
            playMusic(href.trim());
        });
    });
    return songs;
}

function truncateText(text, maxWords) {
    // Split the text into words
    let words = text.split(' ');

    // If the number of words is less than or equal to the maxWords limit, return the original text
    if (words.length <= maxWords) {
        return text;
    } else {
        // Otherwise, truncate the text to the specified number of words and append triple dots
        let truncatedText = words.slice(0, maxWords).join(' ') + '...';
        return truncatedText;
    }
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/songs/${currFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg"
    }
    document.querySelector(".song-name").innerHTML = track.replaceAll(".mp3", " ");
}

async function displayAlbums() {
    let a = await fetch(`http://192.168.29.245:3000/songs/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let cardContainer = document.querySelector(".card-container")
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors)
    for (let i = 0; i < array.length; i++) {
        const e = array[i];

        if (e.href.startsWith("http://192.168.29.245:3000/songs/")) {
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`http://192.168.29.245:3000/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            console.log(folder)

            cardContainer.innerHTML = cardContainer.innerHTML + `
            <div data-folder="${folder}" class="card rounded">
                <div class="play">
                    <img src="img/play.svg" alt="">
                </div>

                <img class="rounded" draggable="false" src="/songs/${folder}/cover.jpg" alt="">
                <span class="block bold">${response.title}</span>
                <a class="text-decoration block grey" title="Dinner with Friends">
                    ${response.description}
                </a>
            </div>`
        }
    }
}

async function main() {

    // Get the list of songs
    songs = await getSongs(`2am_playlist`)
    playMusic(songs[0], true)


    // Display all Albums

    await displayAlbums();

    // Attach an event listener to play , next and previous buttons

    let play = document.getElementById("play")
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg"
        }

        else {
            currentSong.pause();
            play.src = "img/play-btn.svg"
        }
    })


    // Timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    });


    // Seekbar event listener
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    });


    // Hamburger event listener
    let right_hamburger = document.querySelector(".right").querySelector(".hamburger")
    right_hamburger.addEventListener("click", e => {
        document.querySelector(".left").style.left = 0;
    });

    let left_hamburger = document.querySelector(".left").querySelector(".hamburger")
    left_hamburger.addEventListener("click", e => {
        document.querySelector(".left").style.left = -100 + "%";
    });



    // Previous and next event listeners

    previous.addEventListener("click", () => {
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " "))
        if (index > 0) {
            playMusic(songs[index - 1])
        }
        else {
            playMusic(songs[songs.length - 1])
        }
    })

    next.addEventListener("click", () => {
        console.log("Next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " "))
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
        else {
            playMusic(songs[0])
        }
    })


    let volume;
    let volume_icon = document.querySelector(".volume-box").getElementsByTagName("img")[0]; // Access the first element
    console.log(`Volume icon ${volume_icon}`)
    document.querySelector(".volume-box").getElementsByTagName("input")[0].addEventListener("input", (e) => {
        volume = e.target.value;
        console.log(`Setting volume to ${volume} %`);
        currentSong.volume = parseInt(e.target.value) / 100;

        if (volume == 0) {
            volume_icon.src = "img/volume-0.svg";
        } 
        else if (volume <= 33) {
            volume_icon.src = "img/volume-1.svg";
        } 
        else if (volume <= 67) {
            volume_icon.src = "img/volume-2.svg";
        } 
        else {
            // If volume is not 0, set the src attribute to the normal volume icon
            volume_icon.src = "img/volume-3.svg";
        }
    });
    
    volume_icon.addEventListener("click", e =>{
        if(volume != 0){
            volume_icon.src = "img/volume-0.svg";
            volume = 0
            currentSong.volume = 0;
        }
        else{
            volume = 100
            volume_icon.src = "img/volume-3.svg";
            currentSong.volume = 1;
        }
    });
    

    // Load the folders
    let card = document.querySelectorAll('.card')
    Array.from(card).forEach(e => {
        e.addEventListener('click', async () => {
            const folder = e.getAttribute('data-folder');
            songs = await getSongs(folder);
            playMusic(songs[0])
            
            
        });
    });
    
}

main()
