interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar = ({ value, onChange, placeholder }: SearchBarProps) => (
  <label className="search-bar">
    <span aria-hidden>🔍</span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder ?? 'Caută...'}
    />
  </label>
);

export default SearchBar;

