module.exports = function (clean) {
  console.log('Usage: ghost-harp --input <ghost dir> --output <target dir>');
  process.exit(clean ? 0 : 1);
};