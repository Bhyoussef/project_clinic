import { executeQuery } from '../config/db.js';

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    phone: row.phone,
    name: row.name,
    email: row.email,
    dob: row.dob,
    isProfileCompleted: Boolean(row.is_profile_completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class UserModel {
  async findByPhone(phone) {
    const rows = await executeQuery(
      'SELECT * FROM users WHERE phone = ? LIMIT 1',
      [phone],
      'finding user by phone'
    );

    return mapUser(rows[0]);
  }

  async findById(id) {
    const rows = await executeQuery(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id],
      'finding user by id'
    );

    return mapUser(rows[0]);
  }

  async create(phone, name = null) {
    const result = await executeQuery(
      'INSERT INTO users (phone, name) VALUES (?, ?)',
      [phone, name],
      'creating user'
    );

    return this.findById(result.insertId);
  }

  async createIfNotExists(phone) {
    const existingUser = await this.findByPhone(phone);

    if (existingUser) {
      return existingUser;
    }

    return this.create(phone);
  }

  async upsertBookingContact(phone, name) {
    const existingUser = await this.findByPhone(phone);

    if (!existingUser) {
      return this.create(phone, name);
    }

    if (name && existingUser.name !== name) {
      await executeQuery(
        'UPDATE users SET name = COALESCE(?, name) WHERE id = ?',
        [name, existingUser.id],
        'updating booking contact name'
      );

      return this.findById(existingUser.id);
    }

    return existingUser;
  }

  async updateProfile(id, profile) {
    const { name, email, dob } = profile;

    await executeQuery(
      `
        UPDATE users
        SET name = ?, email = ?, dob = ?, is_profile_completed = 1
        WHERE id = ?
      `,
      [name, email, dob, id],
      'updating user profile'
    );

    return this.findById(id);
  }

  async listAll() {
    const rows = await executeQuery(
      'SELECT * FROM users ORDER BY created_at DESC',
      [],
      'listing users'
    );

    return rows.map(mapUser);
  }
}

export default new UserModel();
