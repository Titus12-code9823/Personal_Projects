interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

const TextField = ({ label, name, ...rest }: TextFieldProps) => (
  <label className="form-field">
    <span className="form-field__label">{label}</span>
    <input className="form-field__input" name={name} {...rest} />
  </label>
);

export default TextField;

