function loadImagesFromS3(path) {
    if (!path) return null;

    return `https://d9mrctnes6hm5.cloudfront.net/${path}`;
}

module.exports = { loadImagesFromS3 };
