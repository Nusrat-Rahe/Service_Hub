import type { InputHTMLAttributes } from "react";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  visible: boolean;
  onToggleVisibility?: () => void;
};

export default function PasswordField({
  visible,
  onToggleVisibility,
  ...inputProps
}: PasswordFieldProps) {
  return (
    <div className="auth-password-input">
      <input {...inputProps} type={visible ? "text" : "password"} />
      {onToggleVisibility && (
        <button
          aria-label={visible ? "Hide password" : "Show password"}
          className="auth-toggle-password"
          onClick={onToggleVisibility}
          type="button"
        >
          {visible ? "Hide" : "Show"}
        </button>
      )}
    </div>
  );
}
