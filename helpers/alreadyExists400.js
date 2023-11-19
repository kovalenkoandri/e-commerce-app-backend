const alreadyExists400 = (arg = 'Object') => {
  const error = new Error(`${arg} already exists-))`);
  error.status = 400;
  throw error;
};

module.exports = alreadyExists400;
