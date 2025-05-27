import pandas as pd
import numpy as np
import joblib
from pymongo import MongoClient
from math import radians, sin, cos, sqrt, atan2

# Conectar ao MongoDB
client = MongoClient("mongodb+srv://neurotech:residencia2025@cluster0.xcwkoxf.mongodb.net/adotemeapp")
db = client.adotemeapp

# Carregar modelo e scaler
rf = joblib.load('modelo_recomendacao.joblib')
scaler = joblib.load('scaler_recomendacao.joblib')

# Buscar todas as collections necessárias
pets = list(db.pets.find())
racas = list(db.racas.find())
personalidades = list(db.personalidades.find())
ongs = list(db.usuarios.find({'tipo': 'ONG'}))

# Criar dicionários para fácil acesso
racas_dict = {raca['raca_id']: raca for raca in racas}
personalidades_dict = {pers['personalidade_id']: pers for pers in personalidades}
ongs_dict = {ong['user_id']: ong for ong in ongs}

# Features para o modelo
features_numericas = [
    'distancia', 'match_preferencias', 'idade_pet', 'horasSozinhoPet'
]
features_binarias = [
    'castrado', 'vacinado', 'sociavelCaes', 'sociavelGatos', 'sociavelCriancas',
    'possuiPets', 'experienciaPrevia', 'porte_pet_grande', 'porte_pet_medio', 'porte_pet_pequeno',
    'especie_pet_cachorro', 'especie_pet_gato', 'nivelEnergia_alto', 'nivelEnergia_baixo',
    'nivelEnergia_moderado', 'tipoResidencia_usuario_apartamento', 'tipoResidencia_usuario_casa',
    'tipoResidencia_usuario_chácara'
]

# Perfil do adotante (exemplo)
adotante = {
    'vacinado': 0,
    'castrado': 1,
    'horasSozinhoPet': 4,
    'possuiPets': 0,
    'experienciaPrevia': 1,
    'tipoResidencia': 'apartamento',
    'coordenadas': {'latitude': -23.5505, 'longitude': -46.6333}
}

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

# Preparar lista de pets para recomendação
pets_disponiveis = []
for pet in pets:
    if not pet.get('status', {}).get('disponivel', True):
        continue

    # Buscar raça do pet
    raca = racas_dict.get(pet.get('raca_id'))
    nome_raca = raca['nome'] if raca else 'Raça não especificada'
    caracteristicas_raca = raca.get('caracteristicas', []) if raca else []
    porte_comum_raca = raca.get('porte_comum') if raca else None
    especie_raca = raca.get('especie') if raca else None

    # Buscar ONG do pet
    ong = ongs_dict.get(pet.get('ong_id'))

    # Calcular distância
    pet_coords = pet.get('coordenadas', {})
    if pet_coords:
        distancia = haversine(
            adotante['coordenadas']['latitude'],
            adotante['coordenadas']['longitude'],
            pet_coords.get('latitude', 0),
            pet_coords.get('longitude', 0)
        )
    else:
        distancia = 0

    # Buscar personalidades do pet
    personalidades_pet = []
    for pers_id in pet.get('personalidades', []):
        pers = personalidades_dict.get(pers_id)
        if pers:
            personalidades_pet.append(pers.get('nome', ''))

    # Preparar dados do pet
    pet_processado = {
        'pet_id': str(pet['_id']),
        'nome': pet.get('nome', ''),
        'descricao': pet.get('descricao', ''),
        'raca': {
            'nome': nome_raca,
            'caracteristicas': caracteristicas_raca,
            'porte_comum': porte_comum_raca,
            'especie': especie_raca
        },
        'distancia': distancia,
        'match_preferencias': 0.5,
        'idade_pet': pet.get('idade', 0),
        'castrado': int(pet.get('castrado', False)),
        'vacinado': int(pet.get('vacinado', False)),
        'vermifugado': pet.get('vermifugado', False),
        'microchipado': pet.get('microchipado', False),
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
        'imagens': pet.get('imagens', []),
        'personalidades': personalidades_pet,
        'peso': pet.get('peso'),
        'necessidades_especiais': pet.get('necessidades_especiais', ''),
        'cidade': pet.get('cidade', ''),
        'estado': pet.get('estado', ''),
        'ong': {
            'nome': ong.get('nome', 'N/A') if ong else 'N/A',
            'email': ong.get('email', 'N/A') if ong else 'N/A',
            'telefone': ong.get('telefone', 'N/A') if ong else 'N/A',
            'telefone_contato': ong.get('telefone_contato', 'N/A') if ong else 'N/A',
            'whatsapp': ong.get('whatsapp', 'N/A') if ong else 'N/A',
            'endereco': ong.get('endereco', {}) if ong else {},
            'cidade': ong.get('cidade', 'N/A') if ong else 'N/A',
            'estado': ong.get('estado', 'N/A') if ong else 'N/A',
            'redes_sociais': ong.get('redes_sociais', {}) if ong else {}
        }
    }
    pets_disponiveis.append(pet_processado)

def recomendar_pets_para_adotante(adotante, pets_disponiveis, top_n=15):
    resultados = []
    for pet in pets_disponiveis:
        features = {
            'distancia': pet['distancia'],
            'match_preferencias': pet['match_preferencias'],
            'idade_pet': pet['idade_pet'],
            'horasSozinhoPet': adotante['horasSozinhoPet'],
            'castrado': pet['castrado'],
            'vacinado': pet['vacinado'],
            'sociavelCaes': pet['sociavelCaes'],
            'sociavelGatos': pet['sociavelGatos'],
            'sociavelCriancas': pet['sociavelCriancas'],
            'possuiPets': adotante['possuiPets'],
            'experienciaPrevia': adotante['experienciaPrevia'],
            'porte_pet_grande': pet['porte_pet_grande'],
            'porte_pet_medio': pet['porte_pet_medio'],
            'porte_pet_pequeno': pet['porte_pet_pequeno'],
            'especie_pet_cachorro': pet['especie_pet_cachorro'],
            'especie_pet_gato': pet['especie_pet_gato'],
            'nivelEnergia_alto': pet['nivelEnergia_alto'],
            'nivelEnergia_baixo': pet['nivelEnergia_baixo'],
            'nivelEnergia_moderado': pet['nivelEnergia_moderado'],
            'tipoResidencia_usuario_apartamento': 1 if adotante['tipoResidencia'] == 'apartamento' else 0,
            'tipoResidencia_usuario_casa': 1 if adotante['tipoResidencia'] == 'casa' else 0,
            'tipoResidencia_usuario_chácara': 1 if adotante['tipoResidencia'] == 'chácara' else 0
        }

        features_df = pd.DataFrame([features])
        features_df[features_numericas] = scaler.transform(features_df[features_numericas])

        prob = rf.predict_proba(features_df)
        prob_value = prob[:, 1] if prob.shape[1] > 1 else prob[:, 0]

        resultados.append({**pet, 'probabilidade': float(prob_value[0])})

    return sorted(resultados, key=lambda x: (-x['probabilidade'], x['distancia']))[:top_n]

# Executar recomendação
recomendacoes = recomendar_pets_para_adotante(adotante, pets_disponiveis)

# Exibir resultados detalhados
for i, rec in enumerate(recomendacoes, 1):
    print(f"\n{i}. {rec['nome']} (ID: {rec['pet_id']})")
    print(f"Espécie: {'Cachorro' if rec['especie_pet_cachorro'] else 'Gato'}")
    print("\nInformações da Raça:")
    print(f"Nome: {rec['raca']['nome']}")
    print(f"Porte comum: {rec['raca']['porte_comum']}")
    if rec['raca']['caracteristicas']:
        print(f"Características da raça: {', '.join(rec['raca']['caracteristicas'])}")

    print(f"\nIdade: {rec['idade_pet']} anos")
    print(f"Peso: {rec['peso']} kg")
    print(f"Porte: {'Grande' if rec['porte_pet_grande'] else 'Médio' if rec['porte_pet_medio'] else 'Pequeno'}")
    print(f"Nível de Energia: {'Alto' if rec['nivelEnergia_alto'] else 'Baixo' if rec['nivelEnergia_baixo'] else 'Moderado'}")
    print(f"Descrição: {rec['descricao']}")

    if rec['personalidades']:
        print("\nPersonalidades:", ', '.join(rec['personalidades']))

    print("\nCaracterísticas:")
    print(f"- Castrado: {'Sim' if rec['castrado'] else 'Não'}")
    print(f"- Vacinado: {'Sim' if rec['vacinado'] else 'Não'}")
    print(f"- Vermifugado: {'Sim' if rec['vermifugado'] else 'Não'}")
    print(f"- Microchipado: {'Sim' if rec['microchipado'] else 'Não'}")
    print(f"- Sociável com cães: {'Sim' if rec['sociavelCaes'] else 'Não'}")
    print(f"- Sociável com gatos: {'Sim' if rec['sociavelGatos'] else 'Não'}")
    print(f"- Sociável com crianças: {'Sim' if rec['sociavelCriancas'] else 'Não'}")

    if rec['necessidades_especiais']:
        print(f"\nNecessidades Especiais: {rec['necessidades_especiais']}")

    print(f"\nLocalização: {rec['cidade']}, {rec['estado']}")
    print(f"Distância: {rec['distancia']:.2f} km")
    print(f"Probabilidade de Match: {rec['probabilidade']:.4f}")

    print("\nONG:")
    print(f"  Nome: {rec['ong']['nome']}")
    print(f"  Email: {rec['ong']['email']}")
    print(f"  Telefone: {rec['ong']['telefone']}")
    print(f"  Telefone Contato: {rec['ong']['telefone_contato']}")
    print(f"  WhatsApp: {rec['ong']['whatsapp']}")
    if rec['ong']['endereco']:
        print(f"  Endereço: {rec['ong']['endereco'].get('logradouro', '')}")
        print(f"  Bairro: {rec['ong']['endereco'].get('bairro', '')}")
        if rec['ong']['endereco'].get('complemento'):
            print(f"  Complemento: {rec['ong']['endereco']['complemento']}")
    print(f"  Cidade: {rec['ong']['cidade']}")
    print(f"  Estado: {rec['ong']['estado']}")
    if rec['ong']['redes_sociais']:
        print("  Redes Sociais:")
        if 'facebook' in rec['ong']['redes_sociais']:
            print(f"    Facebook: {rec['ong']['redes_sociais']['facebook']}")
        if 'instagram' in rec['ong']['redes_sociais']:
            print(f"    Instagram: {rec['ong']['redes_sociais']['instagram']}")

    print(f"\nFotos: {', '.join(rec['imagens'])}")
    print("-" * 80)

client.close()