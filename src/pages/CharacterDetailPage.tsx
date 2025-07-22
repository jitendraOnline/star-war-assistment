import CharacterDetail from '../components/CharacterDetails/CharacterDetails';
function CharacterDetailPage() {
  return (
    <div className="p-3 w-full  bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <h2 className="text-2xl font-bold mb-1">Character Detail Page</h2>
      <CharacterDetail></CharacterDetail>
    </div>
  );
}

export default CharacterDetailPage;
