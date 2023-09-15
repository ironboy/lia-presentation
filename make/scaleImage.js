/***
 * - Scales imags using the npm module sharp
 */

export async function scaleImage(buffer, type) {
  type === 'jpg' && (type = 'jpeg');
  let { resizeSettings, jpegSettings } = settings;
  return sharp(buffer)
    .resize(...resizeSettings)
  [type](...jpegSettings)
    .toBuffer();
};