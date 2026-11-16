export default function IntentField({ value, onChange }) {
  return (
    <div className="form-group">
      <label>I want to</label>
      <div className="intent-row" role="group" aria-label="I want to">
        <button type="button" className={value === 'inquire' ? 'intent-active' : undefined} onClick={() => onChange('inquire')}>Inquire</button>
        <button type="button" className={value === 'register' ? 'intent-active' : undefined} onClick={() => onChange('register')}>Register</button>
      </div>
    </div>
  );
}
