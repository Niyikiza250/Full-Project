const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_DATA_URL_PATTERN =
  /^data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,([A-Za-z0-9+/]+={0,2})$/i;

const isValidImageDataUrl = (value) => {
  if (typeof value !== 'string') return false;
  const match = value.match(IMAGE_DATA_URL_PATTERN);
  return Boolean(match) && Buffer.byteLength(match[1], 'base64') <= MAX_IMAGE_BYTES;
};

module.exports = { isValidImageDataUrl, MAX_IMAGE_BYTES };
