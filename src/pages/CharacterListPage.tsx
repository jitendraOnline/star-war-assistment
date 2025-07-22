import CharacterList from '../components/CharacterList/CharacterList';

function CharacterListPage() {
  return (
    <div className="p-3 w-full  bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <h2 className="text-2xl font-bold mb-1">Character List</h2>
      <CharacterList />
    </div>
  );
}

export default CharacterListPage;
