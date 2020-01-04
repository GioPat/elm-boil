class IndexNotExistsError extends Error {
  constructor(message) {
    super(message);
    this.name = "IndexNotExistsError";
  }
}

module.exports = IndexNotExistsError