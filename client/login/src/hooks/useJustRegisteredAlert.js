import { useEffect } from 'react';

export function useJustRegisteredAlert(justRegistered) {
  useEffect(() => {
    if (justRegistered) {
      window.alert('FLAG{found_hidden_register_and_registered}');
    }
  }, [justRegistered]);
}
