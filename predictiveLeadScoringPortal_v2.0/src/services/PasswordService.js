const bcrypt = require('bcrypt');
const config = require('../config/environment');

class PasswordService {
  async hashPassword(password) {
    return await bcrypt.hash(password, config.bcrypt.saltRounds);
  }

  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

module.exports = new PasswordService();