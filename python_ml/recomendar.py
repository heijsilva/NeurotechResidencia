import pandas as pd
import numpy as np
import joblib
import json
import os
import sys
from pymongo import MongoClient
from math import radians, sin, cos, sqrt, atan2

def carregar_preferencias():
    """Carrega as preferências do usuário do arquivo JSON"""
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        arquivo_preferencias = os.path.join(script_dir, 'preferencias_usuario.json')
        with open(arquivo_preferencias, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return None

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

def recomendar_pets_para_adotante(adotante, pets_disponiveis, rf, scaler, top_n=5):
    """Versão otimizada - processa apenas os primeiros 50 pets para acelerar"""
    features_numericas = ['distancia', 'match_preferencias', 'idade_pet', 'horasSozinhoPet']

    resultados = []
    # OTIMIZAÇÃO: Limitar a 50 pets para acelerar o processamento
    pets_limitados = pets_disponiveis[:50]

    for pet in pets_limitados:
        features = {
            'distancia': pet['distancia'],
            'match_preferencias': pet['match_preferencias'],
            'idade_pet': pet['idade_pet'],
            'horasSozinhoPet': adotante.get('horasSozinhoPet', 4),
            'castrado': pet['castrado'],
            'vacinado': pet['vacinado'],
            'sociavelCaes': pet['sociavelCaes'],
            'sociavelGatos': pet['sociavelGatos'],
            'sociavelCriancas': pet['sociavelCriancas'],
            'possuiPets': adotante.get('possuiPets', 0),
            'experienciaPrevia': adotante.get('experienciaPrevia', 0),
            'porte_pet_grande': pet['porte_pet_grande'],
            'porte_pet_medio': pet['porte_pet_medio'],
            'porte_pet_pequeno': pet['porte_pet_pequeno'],
            'especie_pet_cachorro': pet['especie_pet_cachorro'],
            'especie_pet_gato': pet['especie_pet_gato'],
            'nivelEnergia_alto': pet['nivelEnergia_alto'],
            'nivelEnergia_baixo': pet['nivelEnergia_baixo'],
            'nivelEnergia_moderado': pet['nivelEnergia_moderado'],
            'tipoResidencia_usuario_apartamento': 1 if adotante.get('tipoResidencia') == 'apartamento' else 0,
            'tipoResidencia_usuario_casa': 1 if adotante.get('tipoResidencia') == 'casa' else 0,
            'tipoResidencia_usuario_chácara': 1 if adotante.get('tipoResidencia') == 'chácara' else 0
        }

        features_df = pd.DataFrame([features])
        features_df[features_numericas] = scaler.transform(features_df[features_numericas])

        prob = rf.predict_proba(features_df)
        prob_value = prob[:, 1] if prob.shape[1] > 1 else prob[:, 0]

        resultados.append({**pet, 'probabilidade': float(prob_value[0])})

    return sorted(resultados, key=lambda x: (-x['probabilidade'], x['distancia']))[:top_n]

def main():
    try:
        # Carregar preferências do usuário
        adotante = carregar_preferencias()
        if not adotante:
            print(json.dumps({"error": "Preferências não encontradas"}))
            return

        # Conectar ao MongoDB com timeout
        client = MongoClient(
            "mongodb+srv://neurotech:residencia2025@cluster0.xcwkoxf.mongodb.net/adotemeapp",
            serverSelectionTimeoutMS=5000  # 5 segundos timeout
        )
        db = client.adotemeapp

        # Carregar modelo e scaler
        script_dir = os.path.dirname(os.path.abspath(__file__))
        modelo_path = os.path.join(script_dir, 'modelo_recomendacao.joblib')
        scaler_path = os.path.join(script_dir, 'scaler_recomendacao.joblib')

        rf = joblib.load(modelo_path)
        scaler = joblib.load(scaler_path)

        # OTIMIZAÇÃO: Buscar apenas pets disponíveis e limitar quantidade
        pets = list(db.pets.find(
            {"status.disponivel": {"$ne": False}},
            {"_id": 1, "nome": 1, "idade": 1, "porte": 1, "especie": 1,
             "nivelEnergia": 1, "castrado": 1, "vacinado": 1, "sociavelCaes": 1,
             "sociavelGatos": 1, "sociavelCriancas": 1, "imagens": 1,
             "cidade": 1, "estado": 1, "coordenadas": 1, "raca_id": 1, "ong_id": 1}
        ).limit(100))  # Limitar a 100 pets

        # Buscar apenas as raças e ONGs necessárias
        raca_ids = list(set(pet.get('raca_id') for pet in pets if pet.get('raca_id')))
        ong_ids = list(set(pet.get('ong_id') for pet in pets if pet.get('ong_id')))

        racas = list(db.racas.find({"raca_id": {"$in": raca_ids}}))
        ongs = list(db.usuarios.find({"user_id": {"$in": ong_ids}, "tipo": "ONG"}))

        # Criar dicionários para fácil acesso
        racas_dict = {raca['raca_id']: raca for raca in racas}
        ongs_dict = {ong['user_id']: ong for ong in ongs}

        # Preparar lista de pets (versão simplificada)
        pets_disponiveis = []
        for pet in pets:
            # Buscar raça do pet
            raca = racas_dict.get(pet.get('raca_id'))
            nome_raca = raca['nome'] if raca else 'SRD'

            # Buscar ONG do pet
            ong = ongs_dict.get(pet.get('ong_id'))

            # Calcular distância (simplificado)
            pet_coords = pet.get('coordenadas', {})
            adotante_coords = adotante.get('coordenadas', {})

            if pet_coords and adotante_coords:
                distancia = haversine(
                    adotante_coords.get('latitude', 0),
                    adotante_coords.get('longitude', 0),
                    pet_coords.get('latitude', 0),
                    pet_coords.get('longitude', 0)
                )
            else:
                distancia = 0

            # Preparar dados do pet (versão simplificada)
            pet_processado = {
                'pet_id': str(pet['_id']),
                'nome': pet.get('nome', ''),
                'raca': nome_raca,
                'distancia': distancia,
                'match_preferencias': 0.5,
                'idade_pet': pet.get('idade', 0),
                'castrado': int(pet.get('castrado', False)),
                'vacinado': int(pet.get('vacinado', False)),
                'sociavelCaes': int(pet.get('sociavelCaes', False)),
                'sociavelGatos': int(pet.get('sociavelGatos', False)),
                'sociavelCriancas': int(pet.get('sociavelCriancas', False)),
                'porte_pet_grande': 1 if pet.get('porte') == 'GRANDE' else 0,
                'porte_pet_medio': 1 if pet.get('porte') == 'MEDIO' else 0,
                'porte_pet_pequeno': 1 if pet.get('porte') == 'PEQUENO' else 0,
                'especie_pet_cachorro': 1 if pet.get('especie') == 'CACHORRO' else 0,
                'especie_pet_gato': 1 if pet.get('especie') == 'GATO' else 0,
                'nivelEnergia_alto': 1 if pet.get('nivelEnergia') == 'ALTO' else 0,
                'nivelEnergia_baixo': 1 if pet.get('nivelEnergia') == 'BAIXO' else 0,
                'nivelEnergia_moderado': 1 if pet.get('nivelEnergia') == 'MODERADO' else 0,
                'imagens': pet.get('imagens', [])[:3],  # Máximo 3 imagens
                'cidade': pet.get('cidade', ''),
                'estado': pet.get('estado', ''),
                'ong_nome': ong.get('nome', 'N/A') if ong else 'N/A'
            }
            pets_disponiveis.append(pet_processado)

        # Executar recomendação
        recomendacoes = recomendar_pets_para_adotante(adotante, pets_disponiveis, rf, scaler, top_n=10)

        # IMPORTANTE: Imprimir resultado como JSON para o Node.js
        print(json.dumps(recomendacoes, ensure_ascii=False))

        # Fechar conexão
        client.close()

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()