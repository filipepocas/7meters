/**
 * 7meters - Name Generator
 * Gerador procedural de nomes realistas para atletas e membros do staff.
 * Ponderado com forte presença de nomes e apelidos portugueses (~75%),
 * complementado por uma vasta seleção de 20 países e centenas de nomes
 * representativos do panorama mundial do andebol profissional.
 */

export interface GeneratedIdentity {
  firstName: string;
  lastName: string;
  country: string;
}

const PORTUGUESE_FIRST_NAMES = [
  'Afonso', 'Agostinho', 'Alberto', 'Alexandre', 'Álvaro', 'Amílcar', 'André', 'Aníbal',
  'António', 'Armando', 'Artur', 'Bernardo', 'Bruno', 'Caio', 'Camilo', 'Carlos',
  'Cláudio', 'César', 'Daniel', 'David', 'Dinis', 'Diogo', 'Duarte', 'Edgar',
  'Edmilson', 'Eduardo', 'Emanuel', 'Fábio', 'Fernando', 'Filipe', 'Francisco', 'Frederico',
  'Gabriel', 'Gil', 'Gonçalo', 'Guilherme', 'Gustavo', 'Hélio', 'Henrique', 'Hugo',
  'Igor', 'Ivo', 'Jaime', 'João', 'Joaquim', 'Jorge', 'José', 'Leandro',
  'Léonard', 'Leonardo', 'Lucas', 'Luís', 'Manuel', 'Mário', 'Martim', 'Mateus',
  'Matias', 'Maurício', 'Miguel', 'Nélson', 'Nuno', 'Octávio', 'Orlando', 'Paulo',
  'Pedro', 'Rafael', 'Raul', 'Renato', 'Ricardo', 'Roberto', 'Rodrigo', 'Ruben',
  'Rui', 'Salvador', 'Samuel', 'Santiago', 'Sebastião', 'Sérgio', 'Simão', 'Telmo',
  'Tiago', 'Tomás', 'Valter', 'Vasco', 'Vicente', 'Vítor', 'Xavier'
];

const PORTUGUESE_LAST_NAMES = [
  'Abreu', 'Afonso', 'Albuquerque', 'Almeida', 'Alves', 'Amaral', 'Amorim', 'Andrade',
  'Antunes', 'Araújo', 'Assis', 'Azevedo', 'Baptista', 'Barbosa', 'Barreto', 'Barros',
  'Bastos', 'Bento', 'Borges', 'Branco', 'Brito', 'Cabral', 'Caldas', 'Campos',
  'Cardoso', 'Carneiro', 'Carvalho', 'Castro', 'Coelho', 'Cordeiro', 'Correia', 'Cortes',
  'Costa', 'Couto', 'Cruz', 'Cunha', 'Dias', 'Dinis', 'Domingues', 'Duarte',
  'Esteves', 'Faria', 'Fernandes', 'Ferreira', 'Figueiredo', 'Fonseca', 'Fontes', 'Freitas',
  'Galvão', 'Gama', 'Garcia', 'Gomes', 'Gonçalves', 'Gouveia', 'Guerreiro', 'Henriques',
  'Laranjeira', 'Leal', 'Leite', 'Lemos', 'Lima', 'Lopes', 'Lourenço', 'Macedo',
  'Machado', 'Madureira', 'Magalhães', 'Maia', 'Marques', 'Martins', 'Matias', 'Melo',
  'Mendes', 'Menezes', 'Mesquita', 'Miranda', 'Moniz', 'Monteiro', 'Morais', 'Moreira',
  'Mota', 'Mourão', 'Neves', 'Nogueira', 'Nunes', 'Oliveira', 'Pacheco', 'Paiva',
  'Passos', 'Peixoto', 'Pereira', 'Pinheiro', 'Pinho', 'Pinto', 'Pires', 'Poças',
  'Queirós', 'Ramos', 'Raposo', 'Rego', 'Reis', 'Resende', 'Ribeiro', 'Rios',
  'Rocha', 'Rodrigues', 'Sá', 'Sampaio', 'Sanches', 'Santana', 'Santos', 'Silva',
  'Simões', 'Soares', 'Sousa', 'Tavares', 'Teixeira', 'Teles', 'Torres', 'Valente',
  'Vargas', 'Vasconcelos', 'Vaz', 'Veiga', 'Veloso', 'Viana', 'Vicente', 'Vieira',
  'Viterbo', 'Xavier'
];

interface CountryProfile {
  country: string;
  firstNames: string[];
  lastNames: string[];
}

const INTERNATIONAL_PROFILES: CountryProfile[] = [
  {
    country: 'Espanha',
    firstNames: ['Adrián', 'Aitor', 'Aleix', 'Álvaro', 'Antonio', 'Carlos', 'Daniel', 'David', 'Eduardo', 'Enrique', 'Gonzalo', 'Gorka', 'Iker', 'Inaki', 'Ismael', 'Javier', 'Joan', 'Jorge', 'Joseba', 'Julen', 'Marc', 'Miguel', 'Pablo', 'Pol', 'Raúl', 'Rodrigo', 'Rubén', 'Sergio', 'Valero'],
    lastNames: ['Aguinagalde', 'Alvarez', 'Barrufet', 'Cañellas', 'Entrerríos', 'Fernández', 'García', 'Garbaya', 'Gómez', 'González', 'Guardiola', 'Hombrados', 'López', 'Maqueda', 'Martínez', 'Morros', 'Pérez', 'Ribera', 'Rodríguez', 'Romero', 'Sánchez', 'Sarmiento', 'Sole', 'Tomas', 'Urdangarain', 'Vargas']
  },
  {
    country: 'França',
    firstNames: ['Adrien', 'Alexandre', 'Aymen', 'Cedric', 'Cyril', 'Dika', 'Elohim', 'Gautier', 'Guillaume', 'Hugo', 'Jean', 'Julien', 'Kentin', 'Luka', 'Mathieu', 'Melvyn', 'Michaël', 'Nedim', 'Nicolas', 'Nikola', 'Romain', 'Thierry', 'Timothey', 'Valentin', 'Vincent', 'Yan'],
    lastNames: ['Abalo', 'Anquetil', 'Accambray', 'Binet', 'Bosquet', 'Burbat', 'Carabatic', 'Causse', 'Caucheteux', 'Descat', 'Dinart', 'Fabregas', 'Fernandez', 'Gille', 'Grebille', 'Guigou', 'Karabatic', 'Lagarde', 'Lenne', 'Mahé', 'Mem', "N'Guessan", 'Narcisse', 'Omeyer', 'Porte', 'Remili', 'Sorhaindo']
  },
  {
    country: 'Alemanha',
    firstNames: ['Adrian', 'Alexander', 'Andreas', 'Christian', 'Daniel', 'David', 'Dominik', 'Finn', 'Florian', 'Hendrik', 'Jannik', 'Jonas', 'Julian', 'Kai', 'Lukas', 'Marcel', 'Markus', 'Martin', 'Matthias', 'Max', 'Michael', 'Pascal', 'Paul', 'Philipp', 'Rune', 'Sebastian', 'Silvio', 'Simon', 'Steffen', 'Timo', 'Tobias', 'Uwe'],
    lastNames: ['Bahm', 'Brand', 'Dahmke', 'Drux', 'Gensheimer', 'Golla', 'Groetzki', 'Häfner', 'Heinevetter', 'Hens', 'Kaufmann', 'Knorr', 'Köster', 'Kraus', 'Kretzschmar', 'Kühn', 'Lemke', 'Lichtlein', 'Musche', 'Pekeler', 'Reinkind', 'Schiller', 'Schmidt', 'Schneider', 'Schöngarth', 'Weber', 'Weinhold', 'Wiencek', 'Wolff', 'Zerbe']
  },
  {
    country: 'Dinamarca',
    firstNames: ['Anders', 'Casper', 'Christian', 'Emil', 'Hans', 'Henrik', 'Jacob', 'Jesper', 'Johan', 'Kasper', 'Lasse', 'Mad', 'Magnus', 'Mathias', 'Michael', 'Mikkel', 'Morten', 'Niklas', 'Nikolaj', 'Peter', 'Rasmus', 'René', 'Simon', 'Thomas'],
    lastNames: ['Andersson', 'Christiansen', 'Gidsel', 'Hansen', 'Holm', 'Jacobsen', 'Jensen', 'Jørgensen', 'Kirkeløkke', 'Knudsen', 'Landin', 'Lauge', 'Lindberg', 'Mensah', 'Møller', 'Nielsen', 'Olsen', 'Pedersen', 'Pytlick', 'Svan', 'Toft Hansen']
  },
  {
    country: 'Suécia',
    firstNames: ['Albin', 'Andreas', 'Anton', 'Daniel', 'Felix', 'Fredrik', 'Gottfrid', 'Hampus', 'Jesper', 'Jim', 'Jonathan', 'Karl', 'Kim', 'Lukas', 'Mattias', 'Max', 'Mikael', 'Niclas', 'Oscar', 'Philip', 'Tobias', 'Viktor'],
    lastNames: ['Andersson', 'Appelgren', 'Carlsbogård', 'Claar', 'Ekberg', 'Ekdahl', 'Gottfridsson', 'Jernemyr', 'Karlsson', 'Lagergren', 'Lindberg', 'Nilsson', 'Olsson', 'Pellas', 'Palicka', 'Svensson', 'Thurin', 'Wanne', 'Zachrisson']
  },
  {
    country: 'Croácia',
    firstNames: ['Blaženko', 'Domagoj', 'Filip', 'Halil', 'Hrvoje', 'Igor', 'Ivano', 'Jakov', 'Luka', 'Manuel', 'Marin', 'Marko', 'Matej', 'Mirko', 'Petar', 'Stipe', 'Tin', 'Zlatko'],
    lastNames: ['Balić', 'Buntić', 'Čupić', 'Cindrić', 'Duvnjak', 'GoJun', 'Horvat', 'Jaganjac', 'Karačić', 'Kopljar', 'Lučin', 'Martinović', 'Musa', 'Šego', 'Štrlek', 'Vori', 'Vuković']
  }
];

export function generateRandomIdentity(forcePortuguese = false): GeneratedIdentity {
  const isPortuguese = forcePortuguese || Math.random() < 0.75;

  if (isPortuguese) {
    const firstName = PORTUGUESE_FIRST_NAMES[Math.floor(Math.random() * PORTUGUESE_FIRST_NAMES.length)];
    const lastName = PORTUGUESE_LAST_NAMES[Math.floor(Math.random() * PORTUGUESE_LAST_NAMES.length)];
    return {
      firstName,
      lastName,
      country: 'Portugal'
    };
  }

  const profile = INTERNATIONAL_PROFILES[Math.floor(Math.random() * INTERNATIONAL_PROFILES.length)];
  const firstName = profile.firstNames[Math.floor(Math.random() * profile.firstNames.length)];
  const lastName = profile.lastNames[Math.floor(Math.random() * profile.lastNames.length)];

  return {
    firstName,
    lastName,
    country: profile.country
  };
}
