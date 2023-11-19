const notFound404 = ( fabrictId) => {
  const error = new Error(`Object with fabrictId=${fabrictId} not found`);
  error.status = 404;
  throw error;
};

module.exports = notFound404;
