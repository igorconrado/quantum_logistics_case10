"""
Formulação QUBO para TSP

Converte o problema do Caixeiro Viajante (TSP) em um problema de
Otimização Quadrática Binária Não Restrita (QUBO) que pode ser
resolvido em computadores quânticos.
"""

import numpy as np
from qiskit_optimization import QuadraticProgram
from qiskit_optimization.converters import QuadraticProgramToQubo
from typing import Dict


def build_tsp_qubo(distance_matrix: np.ndarray, penalty: float = None) -> QuadraticProgram:
    """
    Constrói um problema QUBO para TSP.

    Variáveis: x[i][t] = 1 se a cidade i é visitada no tempo t, 0 caso contrário

    Constraints:
    1. Cada cidade deve ser visitada exatamente uma vez: Σ_t x[i][t] = 1 para todo i
    2. Em cada momento, exatamente uma cidade é visitada: Σ_i x[i][t] = 1 para todo t

    Objetivo: Minimizar a distância total da rota

    Args:
        distance_matrix: Matriz NxN de distâncias entre cidades
        penalty: Penalidade para violação de constraints (se None, usa max_distance * N)

    Returns:
        QuadraticProgram configurado para TSP
    """
    n = len(distance_matrix)

    # Definir penalidade (deve ser maior que qualquer custo possível da rota)
    if penalty is None:
        max_distance = np.max(distance_matrix)
        penalty = max_distance * n * 2

    # Criar programa quadrático
    qp = QuadraticProgram("TSP")

    # Criar variáveis binárias: x[i,t] representa "cidade i visitada no tempo t"
    for i in range(n):
        for t in range(n):
            qp.binary_var(name=f"x_{i}_{t}")

    # Dicionário para mapear (i,t) -> índice da variável
    var_idx = {}
    for i in range(n):
        for t in range(n):
            var_idx[(i, t)] = i * n + t

    # CONSTRAINT 1: Cada cidade visitada exatamente uma vez
    # Σ_t x[i][t] = 1 para cada cidade i
    for i in range(n):
        constraint = {}
        for t in range(n):
            var_name = f"x_{i}_{t}"
            constraint[var_name] = 1
        qp.linear_constraint(constraint, "==", 1, name=f"city_{i}_once")

    # CONSTRAINT 2: Em cada tempo, exatamente uma cidade
    # Σ_i x[i][t] = 1 para cada tempo t
    for t in range(n):
        constraint = {}
        for i in range(n):
            var_name = f"x_{i}_{t}"
            constraint[var_name] = 1
        qp.linear_constraint(constraint, "==", 1, name=f"time_{t}_once")

    # FUNÇÃO OBJETIVO: Minimizar distância total
    # Σ_{i,j,t} distance[i][j] * x[i,t] * x[j,t+1]
    linear = {}
    quadratic = {}

    for i in range(n):
        for j in range(n):
            if i != j:
                for t in range(n):
                    t_next = (t + 1) % n  # Próximo tempo (circular)
                    var_i = f"x_{i}_{t}"
                    var_j = f"x_{j}_{t_next}"

                    # Adicionar termo quadrático
                    key = (var_i, var_j) if var_i <= var_j else (var_j, var_i)
                    quadratic[key] = quadratic.get(key, 0) + distance_matrix[i][j]

    qp.minimize(linear=linear, quadratic=quadratic)

    return qp


def qubo_to_dict(qp: QuadraticProgram) -> Dict:
    """
    Converte QuadraticProgram para formato dicionário (para debug).

    Args:
        qp: QuadraticProgram

    Returns:
        Dict com informações do QUBO
    """
    return {
        "num_variables": qp.get_num_vars(),
        "num_constraints": qp.get_num_linear_constraints(),
        "variable_names": [v.name for v in qp.variables],
        "constraints": [c.name for c in qp.linear_constraints]
    }


def test_quantum_model():
    """Testa a formulação QUBO"""
    print("=" * 60)
    print("TESTE DA FORMULAÇÃO QUBO")
    print("=" * 60)

    # Criar matriz de distância pequena (3 cidades para teste)
    test_matrix = np.array([
        [0.0, 5.2, 4.2],
        [5.2, 0.0, 5.3],
        [4.2, 5.3, 0.0]
    ])

    print("\nMatriz de Distância (3 cidades):")
    print(test_matrix)

    # Construir QUBO
    print("\nConstruindo QUBO...")
    qp = build_tsp_qubo(test_matrix)

    # Informações do QUBO
    info = qubo_to_dict(qp)
    print(f"\nInformações do QUBO:")
    print(f"  Número de variáveis: {info['num_variables']}")
    print(f"  Número de constraints: {info['num_constraints']}")
    print(f"  Variáveis esperadas: {3 * 3} = 9 (3 cidades × 3 tempos)")
    print(f"  Constraints esperadas: {3 + 3} = 6 (3 cidades + 3 tempos)")

    # Verificar se o número está correto
    n = 3
    assert info['num_variables'] == n * n, "Número incorreto de variáveis!"
    assert info['num_constraints'] == 2 * n, "Número incorreto de constraints!"

    print("\n[OK] QUBO construído corretamente!")

    # Mostrar algumas variáveis
    print(f"\nExemplos de variáveis:")
    for var_name in info['variable_names'][:6]:
        print(f"  - {var_name}")

    # Mostrar constraints
    print(f"\nConstraints:")
    for const_name in info['constraints']:
        print(f"  - {const_name}")

    print("\n" + "=" * 60)
    print("TESTE CONCLUÍDO COM SUCESSO!")
    print("=" * 60)


if __name__ == "__main__":
    test_quantum_model()
