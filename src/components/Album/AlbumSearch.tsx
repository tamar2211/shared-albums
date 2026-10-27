type AlbumSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

function AlbumSearch({ value, onChange }: AlbumSearchProps) {
  return (
    <input
      type="search"
      className="album-search"
      placeholder="חיפוש אלבום לפי שם"
      aria-label="חיפוש אלבום לפי שם"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default AlbumSearch;