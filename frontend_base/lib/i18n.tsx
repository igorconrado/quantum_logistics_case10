"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from "react"

export type Locale = "pt-BR" | "en-US"

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const dictionaries: Record<Locale, Record<string, string>> = {
  "pt-BR": {
    // Header
    "header.title": "Quantum Logistics",
    "header.subtitle": "Plataforma de Otimização de Rotas",
    "header.apiOnline": "API Online",
    "header.offlineMode": "Modo Offline",
    "header.apiStatus": "Status da API OpenRouteService",
    "header.processing": "Processando...",
    "header.help": "Ajuda e Documentação",
    "header.settings": "Configurações",
    "header.theme": "Alternar tema",

    // Config Panel
    "config.routeScope": "Escopo da Rota",
    "config.intercities": "Intercidades",
    "config.intracity": "Intracidade",
    "config.algorithm": "Algoritmo",
    "config.algorithmTooltip": "Quântico limitado a {quantumLimit} pontos. Clássico suporta até {classicalLimit} pontos.",
    "config.classical": "Clássico",
    "config.quantum": "Quântico",
    "config.useRealRoads": "Usar Estradas Reais",
    "config.realRoadsDesc": "API OpenRouteService (2k req/dia)",
    "config.waypoints": "Waypoints",
    "config.randomPoints": "Pontos aleatórios",
    "config.tooManyPoints": "Muitos pontos para o algoritmo {type}. Máx: {limit}",
    "config.calculating": "Calculando...",
    "config.calculateRoute": "Calcular Rota",
    "config.compareQuantumClassical": "Comparar Quântico vs Clássico",
    "config.compareUnavailableTitle": "Comparação Indisponível",
    "config.compareUnavailableDesc": "A comparação direta entre algoritmo quântico e clássico não é possível com {count} pontos. O simulador quântico consome memória RAM exponencialmente com o número de qubits, e essa quantidade de pontos excede a capacidade disponível. Reduza para no máximo 4 pontos para utilizar a comparação.",
    "config.understood": "Entendi",
    "config.selectCity": "Selecione uma cidade",
    "config.generatePoints": "Gerar Pontos",
    "config.loadingPoints": "Carregando pontos...",
    "config.numNeighborhoods": "Bairros",

    // Algorithm labels
    "algo.brute_force": "Força Bruta",
    "algo.nearest_neighbor": "Vizinho Mais Próximo",
    "algo.networkx": "NetworkX",
    "algo.quantum_numpy": "Quântico (NumPy)",
    "algo.quantum_qaoa": "Quântico (QAOA)",

    // Results Panel
    "results.results": "Resultados",
    "results.history": "Histórico",
    "results.totalDistance": "Distância Total",
    "results.fuelCost": "Custo Combustível",
    "results.calcTime": "Tempo de Cálculo",
    "results.driveTime": "Tempo de Viagem",
    "results.method": "Método",
    "results.roads": "Estradas",
    "results.realRoads": "Reais",
    "results.haversine": "Haversine",
    "results.optimizedSequence": "Sequência Otimizada",
    "results.exportCsv": "Exportar CSV",
    "results.print": "Imprimir",
    "results.noResults": "Sem Resultados",
    "results.noResultsDesc": "Configure sua rota e clique em Calcular para ver os resultados de otimização",
    "results.calculations": "cálculo(s)",
    "results.clear": "Limpar",
    "results.distance": "Distância",
    "results.time": "Tempo",
    "results.points": "Pontos",
    "results.noHistory": "Sem Histórico",
    "results.noHistoryDesc": "Seu histórico de cálculos aparecerá aqui",
    "results.algorithmComparison": "Comparação de Algoritmos",
    "results.quantumFaster": "Quântico é {speedup}x mais rápido",
    "results.quantumSlower": "Clássico é {speedup}x mais rápido",
    "results.sameSpeed": "Mesma velocidade",
    "results.distanceDiff": "Diferença de distância:",

    // CSV export
    "csv.metric": "Métrica",
    "csv.value": "Valor",
    "csv.totalDistance": "Distância Total (km)",
    "csv.fuelCost": "Custo Combustível (R$)",
    "csv.calcTime": "Tempo de Cálculo (ms)",
    "csv.method": "Método",
    "csv.usedRealRoads": "Estradas Reais",
    "csv.yes": "Sim",
    "csv.no": "Não",
    "csv.routeSequence": "Sequência da Rota",
    "csv.stop": "Parada {n}",

    // Route Map
    "map.hub": "Hub",
    "map.stop": "Parada #{n}",
    "map.quantumOptimizing": "Executando Otimização Quântica...",
    "map.calculatingRoute": "Calculando Rota Otimizada...",
    "map.analyzingWaypoints": "Analisando {count} waypoints",
    "map.hubStartEnd": "Hub (Início/Fim)",
    "map.waypointsLabel": "Waypoints",
    "map.realRoad": "Estrada Real",
    "map.haversineLabel": "Haversine",
    "map.routeOptimized": "Rota Otimizada",

    // Mobile Nav
    "nav.config": "Config",
    "nav.map": "Mapa",
    "nav.results": "Resultados",
    "nav.history": "Histórico",

    // Distance Matrix
    "matrix.title": "Matriz de Distâncias (km)",
    "matrix.emptyState": "Adicione pelo menos 2 cidades para ver a matriz de distâncias",
    "matrix.near": "Perto",
    "matrix.far": "Longe",
    "matrix.button": "Matriz de Distâncias",

    // Performance Chart
    "chart.title": "Tendências de Desempenho",
    "chart.emptyState": "Execute pelo menos 2 cálculos para ver as tendências",
    "chart.time": "Tempo (ms)",
    "chart.distance": "Distância (x100 km)",
  },

  "en-US": {
    // Header
    "header.title": "Quantum Logistics",
    "header.subtitle": "Route Optimization Platform",
    "header.apiOnline": "API Online",
    "header.offlineMode": "Offline Mode",
    "header.apiStatus": "OpenRouteService API Status",
    "header.processing": "Processing...",
    "header.help": "Help & Documentation",
    "header.settings": "Settings",
    "header.theme": "Toggle theme",

    // Config Panel
    "config.routeScope": "Route Scope",
    "config.intercities": "Intercities",
    "config.intracity": "Intracity",
    "config.algorithm": "Algorithm",
    "config.algorithmTooltip": "Quantum limited to {quantumLimit} points. Classical supports up to {classicalLimit} points.",
    "config.classical": "Classical",
    "config.quantum": "Quantum",
    "config.useRealRoads": "Use Real Roads",
    "config.realRoadsDesc": "OpenRouteService API (2k req/day)",
    "config.waypoints": "Waypoints",
    "config.randomPoints": "Random points",
    "config.tooManyPoints": "Too many points for {type} algorithm. Max: {limit}",
    "config.calculating": "Calculating...",
    "config.calculateRoute": "Calculate Route",
    "config.compareQuantumClassical": "Compare Quantum vs Classical",
    "config.compareUnavailableTitle": "Comparison Unavailable",
    "config.compareUnavailableDesc": "Direct comparison between quantum and classical algorithms is not possible with {count} points. The quantum simulator consumes RAM exponentially with the number of qubits, and this number of points exceeds available memory. Reduce to a maximum of 4 points to use the comparison.",
    "config.understood": "Got it",
    "config.selectCity": "Select a city",
    "config.generatePoints": "Generate Points",
    "config.loadingPoints": "Loading points...",
    "config.numNeighborhoods": "Neighborhoods",

    // Algorithm labels
    "algo.brute_force": "Brute Force",
    "algo.nearest_neighbor": "Nearest Neighbor",
    "algo.networkx": "NetworkX",
    "algo.quantum_numpy": "Quantum (NumPy)",
    "algo.quantum_qaoa": "Quantum (QAOA)",

    // Results Panel
    "results.results": "Results",
    "results.history": "History",
    "results.totalDistance": "Total Distance",
    "results.fuelCost": "Fuel Cost",
    "results.calcTime": "Calc Time",
    "results.driveTime": "Drive Time",
    "results.method": "Method",
    "results.roads": "Roads",
    "results.realRoads": "Real",
    "results.haversine": "Haversine",
    "results.optimizedSequence": "Optimized Sequence",
    "results.exportCsv": "Export CSV",
    "results.print": "Print",
    "results.noResults": "No Results Yet",
    "results.noResultsDesc": "Configure your route and click Calculate to see optimization results",
    "results.calculations": "calculation(s)",
    "results.clear": "Clear",
    "results.distance": "Distance",
    "results.time": "Time",
    "results.points": "Points",
    "results.noHistory": "No History",
    "results.noHistoryDesc": "Your calculation history will appear here",
    "results.algorithmComparison": "Algorithm Comparison",
    "results.quantumFaster": "Quantum is {speedup}x faster",
    "results.quantumSlower": "Classical is {speedup}x faster",
    "results.sameSpeed": "Same speed",
    "results.distanceDiff": "Distance diff:",

    // CSV export
    "csv.metric": "Metric",
    "csv.value": "Value",
    "csv.totalDistance": "Total Distance (km)",
    "csv.fuelCost": "Fuel Cost (R$)",
    "csv.calcTime": "Calculation Time (ms)",
    "csv.method": "Method",
    "csv.usedRealRoads": "Used Real Roads",
    "csv.yes": "Yes",
    "csv.no": "No",
    "csv.routeSequence": "Route Sequence",
    "csv.stop": "Stop {n}",

    // Route Map
    "map.hub": "Hub",
    "map.stop": "Stop #{n}",
    "map.quantumOptimizing": "Running Quantum Optimization...",
    "map.calculatingRoute": "Calculating Optimal Route...",
    "map.analyzingWaypoints": "Analyzing {count} waypoints",
    "map.hubStartEnd": "Hub (Start/End)",
    "map.waypointsLabel": "Waypoints",
    "map.realRoad": "Real Road",
    "map.haversineLabel": "Haversine",
    "map.routeOptimized": "Route Optimized",

    // Mobile Nav
    "nav.config": "Config",
    "nav.map": "Map",
    "nav.results": "Results",
    "nav.history": "History",

    // Distance Matrix
    "matrix.title": "Distance Matrix (km)",
    "matrix.emptyState": "Add at least 2 cities to see the distance matrix",
    "matrix.near": "Near",
    "matrix.far": "Far",
    "matrix.button": "Distance Matrix",

    // Performance Chart
    "chart.title": "Performance Trends",
    "chart.emptyState": "Run at least 2 calculations to see performance trends",
    "chart.time": "Time (ms)",
    "chart.distance": "Distance (x100 km)",
  },
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("pt-BR")

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = dictionaries[locale][key] || dictionaries["en-US"][key] || key
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(`{${k}}`, String(v))
        })
      }
      return value
    },
    [locale],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t, setLocale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider")
  }
  return context
}
