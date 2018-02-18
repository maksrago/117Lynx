var bannerLink = "/randomBanner.js?boardUri=";
var boardLink = document.getElementById('labelBoard').innerHTML;
var newBoardLink = boardLink.slice(1, boardLink.length - 1);

function pullBanner() {

    document.getElementById('bannerImagePull').src += bannerLink + newBoardLink;

}

pullBanner();