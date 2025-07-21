import { Link, useSearchParams } from 'react-router-dom';
import type { CharacterListItem, PlanetProperties } from '../../types/character.type';
import { usePlanetsByCharacter } from '@/hooks/usePlanetsByCharacter';

interface CharacterRowProps {
  character: CharacterListItem;
}

const getPlanetDisplay = (
  planet: undefined | PlanetProperties,
  isLoading: boolean,
  isError: boolean
): string => {
  if (isLoading) return 'Loading...';
  if (isError) return 'Unknown';
  return planet?.name || '-';
};

export const CharacterRow = ({ character }: CharacterRowProps) => {
  const [searchParams] = useSearchParams();
  const { uid, properties } = character;

  const { name, homeworld, gender } = properties!;
  const queryString = searchParams.toString();
  const querySuffix = queryString ? `?${queryString}` : '';

  const { data: planet, isLoading, isError } = usePlanetsByCharacter(homeworld);
  const planetName = getPlanetDisplay(planet?.[0], isLoading, isError);
  if (!properties) return null;
  return (
    <tr className="hover:bg-blue-50">
      <td className="px-4 py-2 text-sm text-gray-800 whitespace-nowrap">
        <Link to={`/characters/${uid}${querySuffix}`} className="text-blue-600 hover:underline">
          {name}
        </Link>
      </td>
      <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap">{gender}</td>
      <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">{planetName}</td>
    </tr>
  );
};
