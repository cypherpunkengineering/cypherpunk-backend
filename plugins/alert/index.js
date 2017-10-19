module.exports = {
  notifyAdmin(err) {
    console.error('ADMIN', err);
    return err;
  },
  notifySupport(err) {
    console.error('SUPPORT', err);
    return err;
  },
};