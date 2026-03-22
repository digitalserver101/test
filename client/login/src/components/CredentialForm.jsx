import { useId } from 'react';

export function CredentialForm() {
  const usernameId = useId();
  const passwordId = useId();

  return (
    <form method="post" action="/login">
      <label htmlFor={usernameId}>
        Username
        <input
          id={usernameId}
          type="text"
          name="username"
          required
          autoComplete="username"
        />
      </label>
      <label htmlFor={passwordId}>
        Password
        <input
          id={passwordId}
          type="password"
          name="password"
          required
          autoComplete="current-password"
        />
      </label>
      <button type="submit">Sign in</button>
    </form>
  );
}
