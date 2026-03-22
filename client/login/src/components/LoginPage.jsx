import { useJustRegisteredAlert } from '../hooks/useJustRegisteredAlert.js';
import { CredentialForm } from './CredentialForm.jsx';

export function LoginPage({ message, justRegistered }) {
  useJustRegisteredAlert(justRegistered);

  return (
    <section className="card auth-card">
      <h2>Login</h2>
      {message ? <p className="message">{message}</p> : null}
      <CredentialForm />
      <p className="muted">
        <a href="/forgot">Forgot your password?</a>
      </p>
    </section>
  );
}
