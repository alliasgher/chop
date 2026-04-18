import { WizardShell } from '@/components/register/wizard-shell';

export const metadata = { title: 'Create your shop — Chop' };

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-brand-ink flex items-center justify-center px-6 py-16">
      <WizardShell />
    </div>
  );
}
