import { executeQuery } from '../config/db.js';

function mapDoctor(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    specialization: row.specialization,
    phone: row.phone,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class DoctorModel {
  async create(doctor) {
    const { name, specialization, phone = null, email = null } = doctor;
    const result = await executeQuery(
      `
        INSERT INTO doctors (name, specialization, phone, email)
        VALUES (?, ?, ?, ?)
      `,
      [name, specialization, phone, email],
      'creating doctor'
    );

    return this.findById(result.insertId);
  }

  async findById(id) {
    const rows = await executeQuery(
      'SELECT * FROM doctors WHERE id = ? LIMIT 1',
      [id],
      'finding doctor by id'
    );

    return mapDoctor(rows[0]);
  }

  async listAll() {
    const rows = await executeQuery(
      'SELECT * FROM doctors ORDER BY name ASC',
      [],
      'listing doctors'
    );

    return rows.map(mapDoctor);
  }

  async update(id, doctor) {
    const { name, specialization, phone = null, email = null } = doctor;

    await executeQuery(
      `
        UPDATE doctors
        SET name = ?, specialization = ?, phone = ?, email = ?
        WHERE id = ?
      `,
      [name, specialization, phone, email, id],
      'updating doctor'
    );

    return this.findById(id);
  }

  async delete(id) {
    await executeQuery('DELETE FROM doctors WHERE id = ?', [id], 'deleting doctor');
  }
}

export default new DoctorModel();
