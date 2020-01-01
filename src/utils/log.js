const bColors = {
  HEADER    : '\033[95m',
  OKBLUE    : '\033[94m',
  OKGREEN   : '\033[92m',
  YELLOW    : '\033[93m',
  RED       : '\033[91m',
  ENDC      : '\033[0m', 
  BOLD      : '\033[1m',   
  UNDERLINE : '\033[4m'
};

const colorLevel = {
  "INFO":   bColors.OKGREEN,
  "DEBUG":  bColors.OKBLUE,
  "WARNING":bColors.YELLOW,
  "ERROR":  bColors.RED,
}

function formatDate(date) {
  var year = date.getFullYear();
  var month = (date.getMonth() + 1).toString().padStart(2, "0");
  var day = (date.getDate()).toString().padStart(2, "0");
  var hours = date.getHours().toString().padStart(2, "0");
  var minutes = date.getMinutes().toString().padStart(2, "0");
  var seconds = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

function log(message, level) {
  var now = new Date();
  var color = colorLevel[level];
  if (color === undefined) {
    color = bColors.UNDERLINE;
  }
  console.log(`${color}[${formatDate(now)}][${level}]    ${message}${bColors.ENDC}`);
}

module.exports.info = function info(message) {
  log(message, "INFO");
};

module.exports.warn = function info(message) {
  log(message, "WARNING");
};

module.exports.error = function info(message) {
  log(message, "ERROR");
};

module.exports.debug = function info(message) {
  log(message, "DEBUG");
};