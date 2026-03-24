import { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import InlineAlert from '../common/InlineAlert';

const initialProfileState = {
  name: '',
  email: '',
  dob: '',
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeDigits(value) {
  return `${value || ''}`.replace(/\D/g, '');
}

function AuthModal({ isOpen, onClose, onAuthenticated, intentLabel = 'continue' }) {
  const { sendOtp, verifyOtp, completeProfile } = useAuth();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [profile, setProfile] = useState(initialProfileState);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => {
    if (step === 'otp') {
      return 'Enter verification code';
    }

    if (step === 'profile') {
      return 'Complete your profile';
    }

    return 'Sign in to Clinic Care';
  }, [step]);

  if (!isOpen) {
    return null;
  }

  function resetState() {
    setStep('phone');
    setPhone('');
    setOtp('');
    setProfile(initialProfileState);
    setMessage('');
    setError('');
    setLoading(false);
  }

  function handleClose() {
    resetState();
    onClose();
  }

  async function handleSendOtp(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (normalizeDigits(phone).length < 10) {
      setError('Please enter a valid phone number before requesting a code.');
      return;
    }

    setLoading(true);

    try {
      const response = await sendOtp(phone);
      setPhone(response.phone);
      setStep('otp');
      setMessage(`A verification code was sent to ${response.phone}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send verification code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setError('');

    if (normalizeDigits(otp).length !== 6) {
      setError('Enter the 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const response = await verifyOtp(phone, otp);

      if (response.user?.isProfileCompleted) {
        onAuthenticated();
        handleClose();
        return;
      }

      setStep('profile');
      setProfile((current) => ({
        ...current,
        name: response.user?.name || '',
        email: response.user?.email || '',
        dob: response.user?.dob ? `${response.user.dob}`.slice(0, 10) : '',
      }));
      setMessage('Finish your profile so we can secure your bookings and dashboard access.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to verify code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteProfile(event) {
    event.preventDefault();
    setError('');

    if (!profile.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!isValidEmail(profile.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!profile.dob) {
      setError('Please provide your date of birth.');
      return;
    }

    setLoading(true);

    try {
      await completeProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
        dob: profile.dob,
      });
      onAuthenticated();
      handleClose();
    } catch (requestError) {
      setError(requestError.message || 'Unable to save your profile.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="surface-card w-full max-w-lg p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-kicker">Secure access</p>
            <h2 className="section-title text-2xl sm:text-3xl">{title}</h2>
            <p className="muted-copy mt-2">Authenticate to {intentLabel}.</p>
          </div>
          <button type="button" onClick={handleClose} className="secondary-button px-4 py-2 text-sm">
            Close
          </button>
        </div>

        <InlineAlert tone="info" message={message} />
        <InlineAlert message={error} />

        {step === 'phone' ? (
          <form className="mt-6 space-y-5" onSubmit={handleSendOtp}>
            <label className="block text-sm font-medium text-slate-700">
              Phone number
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="e.g. +1 555 123 4567"
                className="input-control"
                autoComplete="tel"
              />
            </label>

            <button type="submit" disabled={loading} className="primary-button w-full">
              {loading ? 'Sending code...' : 'Send verification code'}
            </button>
          </form>
        ) : null}

        {step === 'otp' ? (
          <form className="mt-6 space-y-5" onSubmit={handleVerifyOtp}>
            <label className="block text-sm font-medium text-slate-700">
              One-time password
              <input
                type="text"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter the 6-digit code"
                className="input-control"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => setStep('phone')} className="secondary-button w-full">
                Change phone
              </button>
              <button type="submit" disabled={loading} className="primary-button w-full">
                {loading ? 'Verifying...' : 'Verify code'}
              </button>
            </div>
          </form>
        ) : null}

        {step === 'profile' ? (
          <form className="mt-6 space-y-5" onSubmit={handleCompleteProfile}>
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <input
                type="text"
                value={profile.name}
                onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                className="input-control"
                autoComplete="name"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Email address
              <input
                type="email"
                value={profile.email}
                onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
                className="input-control"
                autoComplete="email"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Date of birth
              <input
                type="date"
                value={profile.dob}
                onChange={(event) => setProfile((current) => ({ ...current, dob: event.target.value }))}
                className="input-control"
                autoComplete="bday"
              />
            </label>

            <button type="submit" disabled={loading} className="primary-button w-full">
              {loading ? 'Saving profile...' : 'Save profile and continue'}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export default AuthModal;
