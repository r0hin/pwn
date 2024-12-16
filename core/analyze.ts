export default () => {
  return new Promise(async (resolve, reject) => {
    try {
      return resolve(true);
    } catch (error) {
      return reject(error);
    }
  });
};
