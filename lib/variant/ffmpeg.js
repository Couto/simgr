
var execFile = require('mz/child_process').execFile

var simgr = require('../simgr')

simgr.convertFFMPEG = function* (metadata, options) {
  var format = options.format
  var variant = options.variant
  var opts = variant[format]
  var width = metadata.width
  var height = metadata.height
  var maxrate = (opts.bitratefactor || 5) * width * height

  var args = [
    '-y',
    '-loglevel',
    'error',
    '-i',
    metadata.path,
    '-c:v',
    format === 'webm' ? 'libvpx' : 'libx264',
    '-crf',
    opts.crf || 20,
    // We always want it to act as a maxrate
    format === 'webm' ? '-b:v' : '-maxrate',
    maxrate
  ]

  if (format === 'mp4') {
    args.push(
      // For whatever reason this colorspace is required
      '-pix_fmt',
      'yuv420p',
      '-bufsize',
      // Not sure what to set, so just set it to 5x the maxrate
      5 * maxrate
    )

    // No side can be odd, so if one is odd,
    // we'll just double the size.
    // May lose some color,
    // but these are GIFs anyways
    if (width % 2 || height % 2) args.push('-vf', 'scale=iw*2:ih*2')
  }

  yield execFile('ffmpeg', args.concat(options.out))
}
