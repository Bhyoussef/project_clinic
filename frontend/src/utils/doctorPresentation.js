const specialtyPresentation = {
  Cardiology: {
    experience: 12,
    rating: '4.9/5',
    fee: '$80',
    availability: 'Available Today',
    location: 'Downtown Clinic',
    description:
      'Focused on preventive heart care and long-term treatment plans for adults seeking modern cardiac support.',
  },
  Dermatology: {
    experience: 9,
    rating: '4.8/5',
    fee: '$65',
    availability: 'Next Slot 2 PM',
    location: 'Northside Medical',
    description:
      'Specializes in skin health, acne treatment, and personalized care plans with a calm, patient-first approach.',
  },
  Pediatrics: {
    experience: 14,
    rating: '5.0/5',
    fee: '$70',
    availability: 'Available Tomorrow',
    location: 'Family Health Center',
    description:
      'Provides compassionate pediatric care with expertise in wellness visits, child development, and family guidance.',
  },
  Orthopedics: {
    experience: 11,
    rating: '4.7/5',
    fee: '$90',
    availability: 'Limited Slots',
    location: 'West End Clinic',
    description:
      'Experienced in joint pain management, sports injuries, and mobility recovery programs tailored to each patient.',
  },
  Neurology: {
    experience: 10,
    rating: '4.9/5',
    fee: '$95',
    availability: 'Open This Week',
    location: 'Central Neuro Care',
    description:
      'Helps patients navigate migraines, nerve conditions, and neurological assessments with clear next steps.',
  },
  'General Medicine': {
    experience: 8,
    rating: '4.8/5',
    fee: '$55',
    availability: 'Available Today',
    location: 'City Primary Care',
    description:
      'Offers accessible primary care, annual checkups, and treatment for common conditions in a welcoming setting.',
  },
};

function getInitials(name) {
  return `${name || ''}`
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function mapDoctorForDisplay(doctor) {
  const specialty = doctor.specialization || doctor.specialty || 'General Medicine';
  const presentation = specialtyPresentation[specialty] || specialtyPresentation['General Medicine'];

  return {
    ...doctor,
    specialty,
    initials: getInitials(doctor.name),
    experience: presentation.experience,
    rating: presentation.rating,
    fee: presentation.fee,
    availability: presentation.availability,
    location: presentation.location,
    description: presentation.description,
  };
}
