import { executeQuery } from './db.js';

const defaultDoctors = [
  [1, 'Dr. Amelia Morgan', 'Cardiology', '+1 555 100 1001', 'amelia.morgan@clinic.test'],
  [2, 'Dr. James Kim', 'Dermatology', '+1 555 100 1002', 'james.kim@clinic.test'],
  [3, 'Dr. Sofia Patel', 'Pediatrics', '+1 555 100 1003', 'sofia.patel@clinic.test'],
  [4, 'Dr. Daniel Lee', 'Orthopedics', '+1 555 100 1004', 'daniel.lee@clinic.test'],
  [5, 'Dr. Nora Rivera', 'Neurology', '+1 555 100 1005', 'nora.rivera@clinic.test'],
  [6, 'Dr. Ethan Torres', 'General Medicine', '+1 555 100 1006', 'ethan.torres@clinic.test'],
];

const slotDefinitions = [
  ['09:00:00', '09:30:00'],
  ['10:30:00', '11:00:00'],
  ['14:00:00', '14:30:00'],
  ['16:00:00', '16:30:00'],
];

async function seedDoctors() {
  for (const [id, name, specialization, phone, email] of defaultDoctors) {
    await executeQuery(
      `
        INSERT INTO doctors (id, name, specialization, phone, email)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          specialization = VALUES(specialization),
          phone = VALUES(phone),
          email = VALUES(email)
      `,
      [id, name, specialization, phone, email],
      'seeding doctors'
    );
  }
}

async function seedTimeSlots() {
  for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const slotDate = date.toISOString().slice(0, 10);

    for (const [doctorId] of defaultDoctors) {
      for (const [startTime, endTime] of slotDefinitions) {
        await executeQuery(
          `
            INSERT INTO time_slots (doctor_id, slot_date, start_time, end_time, is_available)
            VALUES (?, ?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE
              end_time = VALUES(end_time)
          `,
          [doctorId, slotDate, startTime, endTime],
          'seeding time slots'
        );
      }
    }
  }
}

export async function initializeDatabase() {
  await executeQuery(
    `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(120) DEFAULT NULL,
        email VARCHAR(120) DEFAULT NULL,
        dob DATE DEFAULT NULL,
        is_profile_completed TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `,
    [],
    'creating users table'
  );

  await executeQuery(
    `
      CREATE TABLE IF NOT EXISTS doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        specialization VARCHAR(120) NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        email VARCHAR(120) DEFAULT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `,
    [],
    'creating doctors table'
  );

  await executeQuery(
    `
      CREATE TABLE IF NOT EXISTS time_slots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doctor_id INT NOT NULL,
        slot_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_time_slots_doctor
          FOREIGN KEY (doctor_id) REFERENCES doctors(id)
          ON DELETE CASCADE,
        UNIQUE KEY uq_time_slot (doctor_id, slot_date, start_time),
        INDEX idx_time_slots_doctor_date (doctor_id, slot_date)
      )
    `,
    [],
    'creating time_slots table'
  );

  await executeQuery(
    `
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        doctor_id INT NOT NULL,
        time_slot_id INT NOT NULL,
        appointment_date DATETIME NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'scheduled',
        reason VARCHAR(255) DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_appointments_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_appointments_doctor
          FOREIGN KEY (doctor_id) REFERENCES doctors(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_appointments_time_slot
          FOREIGN KEY (time_slot_id) REFERENCES time_slots(id)
          ON DELETE CASCADE,
        UNIQUE KEY uq_appointment_time_slot (time_slot_id),
        INDEX idx_appointments_user (user_id),
        INDEX idx_appointments_doctor (doctor_id)
      )
    `,
    [],
    'creating appointments table'
  );

  await executeQuery(
    `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        appointment_id INT DEFAULT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_notifications_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_notifications_appointment
          FOREIGN KEY (appointment_id) REFERENCES appointments(id)
          ON DELETE SET NULL,
        INDEX idx_notifications_user (user_id)
      )
    `,
    [],
    'creating notifications table'
  );

  await executeQuery(
    `
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(20) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        expires_at DATETIME NOT NULL,
        is_verified TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_phone_verified (phone, is_verified)
      )
    `,
    [],
    'creating otp_codes table'
  );

  await seedDoctors();
  await seedTimeSlots();
}
