import { LoginPage } from './components/LoginPage.jsx';

export default function App({ message, justRegistered }) {
  return <LoginPage message={message} justRegistered={justRegistered} />;
}
