"""
Módulo de Geografia e Cálculos de Distância

Contém classes e funções para:
- Representação de localizações geográficas
- Cálculo de distâncias usando fórmula de Haversine
- Geração de matriz de distâncias
"""

import math
import numpy as np
from typing import List
from dataclasses import dataclass


@dataclass
class Location:
    """Representa uma localização geográfica"""
    id: int
    name: str
    lat: float
    lon: float

    def __repr__(self):
        return f"Location({self.id}, '{self.name}', {self.lat:.4f}, {self.lon:.4f})"


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calcula a distância entre dois pontos geográficos usando a fórmula de Haversine.

    Args:
        lat1, lon1: Latitude e longitude do primeiro ponto (em graus)
        lat2, lon2: Latitude e longitude do segundo ponto (em graus)

    Returns:
        Distância em quilômetros
    """
    # Raio da Terra em km
    R = 6371.0

    # Converter graus para radianos
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Diferenças
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    # Fórmula de Haversine
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c
    return distance


def calculate_distance(loc1: Location, loc2: Location) -> float:
    """
    Calcula a distância entre duas localizações.

    Args:
        loc1: Primeira localização
        loc2: Segunda localização

    Returns:
        Distância em quilômetros
    """
    return haversine(loc1.lat, loc1.lon, loc2.lat, loc2.lon)


class DistanceMatrix:
    """
    Gera e armazena matriz de distâncias entre múltiplas localizações.
    """

    def __init__(self, locations: List[Location]):
        """
        Inicializa a matriz de distâncias.

        Args:
            locations: Lista de objetos Location
        """
        self.locations = locations
        self.n = len(locations)
        self.matrix = self._compute_matrix()

    def _compute_matrix(self) -> np.ndarray:
        """
        Computa a matriz de distâncias NxN.

        Returns:
            Array NumPy NxN com distâncias em km
        """
        matrix = np.zeros((self.n, self.n))

        for i in range(self.n):
            for j in range(self.n):
                if i != j:
                    matrix[i][j] = calculate_distance(
                        self.locations[i],
                        self.locations[j]
                    )

        return matrix

    def get_distance(self, i: int, j: int) -> float:
        """
        Retorna a distância entre dois pontos pelos índices.

        Args:
            i: Índice do primeiro ponto
            j: Índice do segundo ponto

        Returns:
            Distância em quilômetros
        """
        return self.matrix[i][j]

    def __repr__(self):
        return f"DistanceMatrix({self.n}x{self.n})\n{self.matrix}"


# Dados de teste: Pontos de entrega em São Paulo
SAO_PAULO_TEST_LOCATIONS = [
    Location(0, "Depósito Centro", -23.5505, -46.6333),
    Location(1, "Pinheiros", -23.5629, -46.6825),
    Location(2, "Vila Mariana", -23.5880, -46.6386),
    Location(3, "Mooca", -23.5489, -46.5997),
    Location(4, "Santana", -23.5050, -46.6289),
    Location(5, "Tatuapé", -23.5403, -46.5768),
    Location(6, "Butantã", -23.5730, -46.7206),
    Location(7, "Ipiranga", -23.5944, -46.6070),
]

# ============================================================================
# ESTRUTURA DE DADOS: CAPITAIS DO BRASIL
# ============================================================================
# Cada capital possui:
# - 1 Ponto de Distribuição (Hub Central/Sede) - índice 0
# - 9 Pontos de Referência (Bairros/Clientes) - índices 1-9
# ============================================================================

# Dados: 10 Capitais do Brasil (apenas hub/sede central para rotas inter-municipais)
BRAZIL_CAPITALS_HUBS = [
    Location(0, "Brasília (DF)", -15.7939, -47.8828),      # Centro-Oeste - Capital Federal
    Location(1, "São Paulo (SP)", -23.5505, -46.6333),     # Sudeste - Maior cidade
    Location(2, "Rio de Janeiro (RJ)", -22.9068, -43.1729), # Sudeste - 2ª maior cidade
    Location(3, "Belo Horizonte (MG)", -19.9167, -43.9345), # Sudeste
    Location(4, "Salvador (BA)", -12.9714, -38.5014),      # Nordeste
    Location(5, "Recife (PE)", -8.0476, -34.8770),         # Nordeste
    Location(6, "Fortaleza (CE)", -3.7319, -38.5267),      # Nordeste
    Location(7, "Curitiba (PR)", -25.4284, -49.2733),      # Sul
    Location(8, "Porto Alegre (RS)", -30.0346, -51.2177),  # Sul
    Location(9, "Manaus (AM)", -3.1190, -60.0217),         # Norte
]

# Mantém compatibilidade com código existente
BRAZIL_CAPITALS_LOCATIONS = BRAZIL_CAPITALS_HUBS

# ============================================================================
# DADOS DETALHADOS: HUB + 9 BAIRROS POR CAPITAL
# ============================================================================

# BRASÍLIA (DF) - Hub + 9 Bairros
BRASILIA_LOCATIONS = [
    Location(0, "Hub Central Brasília", -15.7939, -47.8828),      # Plano Piloto
    Location(1, "Asa Sul", -15.8267, -47.9218),
    Location(2, "Asa Norte", -15.7801, -47.8919),
    Location(3, "Lago Sul", -15.8350, -47.8569),
    Location(4, "Taguatinga", -15.8389, -48.0439),
    Location(5, "Ceilândia", -15.8170, -48.1078),
    Location(6, "Samambaia", -15.8758, -48.0944),
    Location(7, "Águas Claras", -15.8350, -48.0267),
    Location(8, "Gama", -16.0141, -48.0653),
    Location(9, "Sobradinho", -15.6528, -47.7861),
]

# SÃO PAULO (SP) - Hub + 9 Bairros
SAO_PAULO_LOCATIONS = [
    Location(0, "Hub Central São Paulo", -23.5505, -46.6333),    # Centro/Sé
    Location(1, "Pinheiros", -23.5629, -46.6825),
    Location(2, "Vila Mariana", -23.5880, -46.6386),
    Location(3, "Mooca", -23.5489, -46.5997),
    Location(4, "Santana", -23.5050, -46.6289),
    Location(5, "Tatuapé", -23.5403, -46.5768),
    Location(6, "Butantã", -23.5730, -46.7206),
    Location(7, "Ipiranga", -23.5944, -46.6070),
    Location(8, "Lapa", -23.5279, -46.7011),
    Location(9, "Itaquera", -23.5408, -46.4558),
]

# RIO DE JANEIRO (RJ) - Hub + 9 Bairros
RIO_DE_JANEIRO_LOCATIONS = [
    Location(0, "Hub Central Rio", -22.9068, -43.1729),          # Centro
    Location(1, "Copacabana", -22.9711, -43.1822),
    Location(2, "Ipanema", -22.9838, -43.2096),
    Location(3, "Botafogo", -22.9519, -43.1824),
    Location(4, "Tijuca", -22.9256, -43.2450),
    Location(5, "Barra da Tijuca", -23.0045, -43.3647),
    Location(6, "Jacarepaguá", -22.9247, -43.3614),
    Location(7, "Campo Grande", -22.9036, -43.5617),
    Location(8, "Méier", -22.9025, -43.2781),
    Location(9, "Bangu", -22.8719, -43.4644),
]

# BELO HORIZONTE (MG) - Hub + 9 Bairros
BELO_HORIZONTE_LOCATIONS = [
    Location(0, "Hub Central BH", -19.9167, -43.9345),           # Centro
    Location(1, "Savassi", -19.9386, -43.9353),
    Location(2, "Pampulha", -19.8511, -43.9719),
    Location(3, "Barreiro", -19.9881, -44.0311),
    Location(4, "Venda Nova", -19.8139, -43.9625),
    Location(5, "Contagem Centro", -19.9319, -44.0539),
    Location(6, "Betim", -19.9678, -44.1986),
    Location(7, "Santa Efigênia", -19.9264, -43.9467),
    Location(8, "Funcionários", -19.9369, -43.9269),
    Location(9, "Nova Lima", -19.9856, -43.8469),
]

# SALVADOR (BA) - Hub + 9 Bairros
SALVADOR_LOCATIONS = [
    Location(0, "Hub Central Salvador", -12.9714, -38.5014),     # Comércio
    Location(1, "Barra", -13.0094, -38.5328),
    Location(2, "Pituba", -13.0047, -38.4536),
    Location(3, "Itapuã", -12.9497, -38.3664),
    Location(4, "Cajazeiras", -12.9400, -38.5569),
    Location(5, "Brotas", -12.9975, -38.5089),
    Location(6, "Cabula", -12.9597, -38.4697),
    Location(7, "Liberdade", -12.9450, -38.5158),
    Location(8, "Periperi", -12.8986, -38.4497),
    Location(9, "Paripe", -12.8058, -38.4572),
]

# RECIFE (PE) - Hub + 9 Bairros
RECIFE_LOCATIONS = [
    Location(0, "Hub Central Recife", -8.0476, -34.8770),        # Boa Vista
    Location(1, "Boa Viagem", -8.1300, -34.9019),
    Location(2, "Casa Amarela", -8.0261, -34.9169),
    Location(3, "Espinheiro", -8.0394, -34.8892),
    Location(4, "Graças", -8.0411, -34.8972),
    Location(5, "Várzea", -8.0417, -34.9561),
    Location(6, "Afogados", -8.0631, -34.9236),
    Location(7, "Torre", -8.0522, -34.9036),
    Location(8, "Jardim São Paulo", -8.0233, -34.9464),
    Location(9, "Iputinga", -8.0458, -34.9461),
]

# FORTALEZA (CE) - Hub + 9 Bairros
FORTALEZA_LOCATIONS = [
    Location(0, "Hub Central Fortaleza", -3.7319, -38.5267),     # Centro
    Location(1, "Aldeota", -3.7328, -38.5011),
    Location(2, "Meireles", -3.7275, -38.4931),
    Location(3, "Messejana", -3.8308, -38.4908),
    Location(4, "Maracanaú", -3.8769, -38.6256),
    Location(5, "Parangaba", -3.7781, -38.5683),
    Location(6, "Barra do Ceará", -3.6942, -38.5758),
    Location(7, "Montese", -3.7661, -38.5461),
    Location(8, "Dendê", -3.8042, -38.5281),
    Location(9, "Antônio Bezerra", -3.7342, -38.5781),
]

# CURITIBA (PR) - Hub + 9 Bairros
CURITIBA_LOCATIONS = [
    Location(0, "Hub Central Curitiba", -25.4284, -49.2733),     # Centro
    Location(1, "Batel", -25.4414, -49.2831),
    Location(2, "Água Verde", -25.4464, -49.2544),
    Location(3, "Portão", -25.4856, -49.2925),
    Location(4, "Boqueirão", -25.5047, -49.2372),
    Location(5, "CIC (Cidade Industrial)", -25.5247, -49.3358),
    Location(6, "Santa Felicidade", -25.4078, -49.3336),
    Location(7, "Capão Raso", -25.5375, -49.2811),
    Location(8, "Cajuru", -25.4619, -49.2211),
    Location(9, "Pinheirinho", -25.5506, -49.2556),
]

# PORTO ALEGRE (RS) - Hub + 9 Bairros
PORTO_ALEGRE_LOCATIONS = [
    Location(0, "Hub Central Porto Alegre", -30.0346, -51.2177), # Centro
    Location(1, "Moinhos de Vento", -30.0286, -51.2078),
    Location(2, "Bom Fim", -30.0336, -51.2144),
    Location(3, "Menino Deus", -30.0586, -51.2258),
    Location(4, "Restinga", -30.1153, -51.1569),
    Location(5, "Zona Norte", -29.9869, -51.1578),
    Location(6, "Cavalhada", -30.1042, -51.2311),
    Location(7, "Tristeza", -30.1172, -51.2425),
    Location(8, "Petrópolis", -30.0528, -51.1808),
    Location(9, "Sarandi", -29.9917, -51.1464),
]

# MANAUS (AM) - Hub + 9 Bairros
MANAUS_LOCATIONS = [
    Location(0, "Hub Central Manaus", -3.1190, -60.0217),        # Centro
    Location(1, "Adrianópolis", -3.0808, -60.0258),
    Location(2, "Vieiralves", -3.1008, -60.0489),
    Location(3, "Flores", -3.1047, -60.0144),
    Location(4, "Aleixo", -3.1144, -59.9908),
    Location(5, "Cidade Nova", -2.9986, -60.0467),
    Location(6, "Compensa", -3.1158, -60.0700),
    Location(7, "São Jorge", -3.0719, -60.0400),
    Location(8, "Japiim", -3.1378, -60.0056),
    Location(9, "Coroado", -3.0578, -60.0569),
]

# ============================================================================
# DICIONÁRIO DE CAPITAIS (para acesso programático)
# ============================================================================
CITIES_DATA = {
    "brasilia": {
        "id": 0,
        "name": "Brasília (DF)",
        "hub": BRASILIA_LOCATIONS[0],
        "neighborhoods": BRASILIA_LOCATIONS[1:],
        "all_locations": BRASILIA_LOCATIONS
    },
    "sao_paulo": {
        "id": 1,
        "name": "São Paulo (SP)",
        "hub": SAO_PAULO_LOCATIONS[0],
        "neighborhoods": SAO_PAULO_LOCATIONS[1:],
        "all_locations": SAO_PAULO_LOCATIONS
    },
    "rio_de_janeiro": {
        "id": 2,
        "name": "Rio de Janeiro (RJ)",
        "hub": RIO_DE_JANEIRO_LOCATIONS[0],
        "neighborhoods": RIO_DE_JANEIRO_LOCATIONS[1:],
        "all_locations": RIO_DE_JANEIRO_LOCATIONS
    },
    "belo_horizonte": {
        "id": 3,
        "name": "Belo Horizonte (MG)",
        "hub": BELO_HORIZONTE_LOCATIONS[0],
        "neighborhoods": BELO_HORIZONTE_LOCATIONS[1:],
        "all_locations": BELO_HORIZONTE_LOCATIONS
    },
    "salvador": {
        "id": 4,
        "name": "Salvador (BA)",
        "hub": SALVADOR_LOCATIONS[0],
        "neighborhoods": SALVADOR_LOCATIONS[1:],
        "all_locations": SALVADOR_LOCATIONS
    },
    "recife": {
        "id": 5,
        "name": "Recife (PE)",
        "hub": RECIFE_LOCATIONS[0],
        "neighborhoods": RECIFE_LOCATIONS[1:],
        "all_locations": RECIFE_LOCATIONS
    },
    "fortaleza": {
        "id": 6,
        "name": "Fortaleza (CE)",
        "hub": FORTALEZA_LOCATIONS[0],
        "neighborhoods": FORTALEZA_LOCATIONS[1:],
        "all_locations": FORTALEZA_LOCATIONS
    },
    "curitiba": {
        "id": 7,
        "name": "Curitiba (PR)",
        "hub": CURITIBA_LOCATIONS[0],
        "neighborhoods": CURITIBA_LOCATIONS[1:],
        "all_locations": CURITIBA_LOCATIONS
    },
    "porto_alegre": {
        "id": 8,
        "name": "Porto Alegre (RS)",
        "hub": PORTO_ALEGRE_LOCATIONS[0],
        "neighborhoods": PORTO_ALEGRE_LOCATIONS[1:],
        "all_locations": PORTO_ALEGRE_LOCATIONS
    },
    "manaus": {
        "id": 9,
        "name": "Manaus (AM)",
        "hub": MANAUS_LOCATIONS[0],
        "neighborhoods": MANAUS_LOCATIONS[1:],
        "all_locations": MANAUS_LOCATIONS
    }
}

# ============================================================================
# FUNÇÕES DE GERAÇÃO DE ROTAS
# ============================================================================

def generate_route(city_key: str, algorithm_type: str, num_points: int) -> List[Location]:
    """
    Gera uma rota para cálculo de TSP com base nos parâmetros fornecidos.

    Args:
        city_key: Chave da cidade no dicionário CITIES_DATA (ex: "sao_paulo")
        algorithm_type: Tipo de algoritmo ("classical" ou "quantum")
        num_points: Número de pontos de entrega desejados (excluindo o hub)

    Returns:
        Lista de Location contendo [Hub, Ponto1, Ponto2, ..., PontoN]

    Raises:
        ValueError: Se os parâmetros forem inválidos

    Exemplo:
        >>> route = generate_route("sao_paulo", "quantum", 3)
        >>> # Retorna: [Hub SP, Pinheiros, Mooca, Tatuapé] (aleatório)
    """
    import random

    # Validação de entrada
    if city_key not in CITIES_DATA:
        raise ValueError(f"Cidade inválida: {city_key}. Cidades disponíveis: {list(CITIES_DATA.keys())}")

    if algorithm_type not in ["classical", "quantum"]:
        raise ValueError(f"Tipo de algoritmo inválido: {algorithm_type}. Use 'classical' ou 'quantum'")

    # Limites de pontos baseados no algoritmo
    if algorithm_type == "quantum":
        if num_points < 1 or num_points > 3:
            raise ValueError(f"Quantum: número de pontos deve estar entre 1 e 3 (você escolheu {num_points})")
    else:  # classical
        if num_points < 1 or num_points > 9:
            raise ValueError(f"Classical: número de pontos deve estar entre 1 e 9 (você escolheu {num_points})")

    # Obter dados da cidade
    city_data = CITIES_DATA[city_key]
    hub = city_data["hub"]
    neighborhoods = city_data["neighborhoods"]

    # Selecionar aleatoriamente N bairros
    selected_neighborhoods = random.sample(neighborhoods, num_points)

    # Montar rota: Hub sempre primeiro + bairros selecionados
    route = [hub] + selected_neighborhoods

    # Re-indexar os IDs para serem sequenciais (0, 1, 2, ..., N)
    route_reindexed = []
    for idx, loc in enumerate(route):
        route_reindexed.append(
            Location(id=idx, name=loc.name, lat=loc.lat, lon=loc.lon)
        )

    return route_reindexed


def get_city_by_index(capital_index: int) -> str:
    """
    Converte índice de capital (0-9) para chave de cidade.

    Args:
        capital_index: Índice da capital (0=Brasília, 1=São Paulo, etc.)

    Returns:
        Chave da cidade no formato string (ex: "sao_paulo")
    """
    index_to_key = {
        0: "brasilia",
        1: "sao_paulo",
        2: "rio_de_janeiro",
        3: "belo_horizonte",
        4: "salvador",
        5: "recife",
        6: "fortaleza",
        7: "curitiba",
        8: "porto_alegre",
        9: "manaus"
    }

    if capital_index not in index_to_key:
        raise ValueError(f"Índice de capital inválido: {capital_index}. Deve estar entre 0 e 9")

    return index_to_key[capital_index]


def test_geo_module():
    """Testa o módulo geo.py com dados de São Paulo"""
    print("=" * 60)
    print("TESTE DO MÓDULO GEO.PY")
    print("=" * 60)

    # Teste 1: Haversine entre dois pontos conhecidos
    print("\n1. Teste Haversine: Centro <-> Pinheiros")
    dist = haversine(-23.5505, -46.6333, -23.5629, -46.6825)
    print(f"   Distância: {dist:.2f} km")

    # Teste 2: Criar objetos Location
    print("\n2. Localizações de teste (São Paulo):")
    for loc in SAO_PAULO_TEST_LOCATIONS[:3]:
        print(f"   {loc}")

    # Teste 3: Matriz de Distância
    print("\n3. Matriz de Distância (primeiros 4 pontos):")
    test_locs = SAO_PAULO_TEST_LOCATIONS[:4]
    dm = DistanceMatrix(test_locs)
    print(f"\n{dm.matrix}")
    print(f"\n   Distância Centro -> Pinheiros: {dm.get_distance(0, 1):.2f} km")
    print(f"   Distância Centro -> Vila Mariana: {dm.get_distance(0, 2):.2f} km")
    print(f"   Distância Centro -> Mooca: {dm.get_distance(0, 3):.2f} km")

    print("\n" + "=" * 60)
    print("TESTE CONCLUÍDO COM SUCESSO!")
    print("=" * 60)


if __name__ == "__main__":
    test_geo_module()
