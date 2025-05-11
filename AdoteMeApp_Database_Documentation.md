
# AdoteMe App - Documentação do Banco de Dados

## Introdução

O AdoteMe App é uma plataforma de adoção de animais que funciona como um "Tinder" para pets. Usuários podem navegar por perfis de animais disponíveis para adoção, expressar interesse, e iniciar o processo de adoção com base em compatibilidade e localização. Este documento descreve a estrutura do banco de dados MongoDB utilizado pela aplicação, implementado com Mongoose no Node.js.

## Diagrama de Entidade-Relacionamento

![Diagrama ER - AdoteMe App](er_diagram.png)

## Coleções do Banco de Dados

O banco de dados MongoDB do AdoteMe App é composto por cinco coleções principais, cada uma representando uma entidade fundamental do sistema. Abaixo, detalhamos cada uma dessas coleções e seus respectivos esquemas.

### 1. Coleção: Usuarios

Esta coleção armazena informações sobre os usuários da plataforma, incluindo tanto pessoas interessadas em adotar quanto organizações de proteção animal (ONGs).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| _id | ObjectId | Identificador único do usuário |
| nome | String | Nome completo do usuário |
| email | String | Email do usuário (único) |
| telefone | String | Número de telefone do usuário |
| tipo | Enum | Tipo de usuário: 'PESSOA' ou 'ONG' |
| dataNascimento | Date | Data de nascimento (apenas para pessoas) |
| cpf | String | CPF do usuário (apenas para pessoas) |
| cnpj | String | CNPJ da organização (apenas para ONGs) |
| endereco | Object | Objeto contendo informações de endereço |
| coordenadas | Object | Coordenadas geográficas (latitude e longitude) |
| preferencias | Object | Preferências de adoção do usuário |
| createdAt | Date | Data de criação do registro |
| updatedAt | Date | Data da última atualização do registro |

### 2. Coleção: Pets

Esta coleção armazena informações detalhadas sobre os animais disponíveis para adoção na plataforma.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| _id | ObjectId | Identificador único do pet |
| nome | String | Nome do pet |
| especie | Enum | Espécie do pet: 'CACHORRO', 'GATO', etc. |
| porte | Enum | Porte do pet: 'PEQUENO', 'MEDIO', 'GRANDE' |
| idade | Number | Idade do pet em meses |
| peso | Number | Peso do pet em kg |
| sexo | Enum | Sexo do pet: 'MACHO' ou 'FEMEA' |
| castrado | Boolean | Indica se o pet é castrado |
| vacinado | Boolean | Indica se o pet está com vacinas em dia |
| vermifugado | Boolean | Indica se o pet está vermifugado |
| necessidadesEspeciais | Array | Lista de necessidades especiais do pet |
| racaId | ObjectId | Referência à raça do pet |
| personalidadeId | ObjectId | Referência à personalidade do pet |
| fotos | Array | URLs das fotos do pet |
| descricao | String | Descrição detalhada do pet |
| status | Object | Status de adoção e disponibilidade |
| coordenadas | Object | Coordenadas geográficas da localização do pet |
| createdAt | Date | Data de criação do registro |
| updatedAt | Date | Data da última atualização do registro |

### 3. Coleção: Personalidades

Esta coleção armazena os diferentes tipos de personalidades que um pet pode ter, junto com informações sobre compatibilidade com diferentes situações de vida.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| _id | ObjectId | Identificador único da personalidade |
| nome | String | Nome da personalidade (ex: 'Brincalhão', 'Tímido') |
| descricao | String | Descrição detalhada da personalidade |
| compatibilidadeApartamento | Enum | Compatibilidade com apartamentos |
| compatibilidadeCriancas | Enum | Compatibilidade com crianças |
| compatibilidadeIdosos | Enum | Compatibilidade com idosos |
| compatibilidadeOutrosPets | Enum | Compatibilidade com outros pets |
| nivelAtividade | Enum | Nível de atividade: 'BAIXO', 'MEDIO', 'ALTO' |
| nivelSociabilidade | Enum | Nível de sociabilidade: 'BAIXO', 'MEDIO', 'ALTO' |
| createdAt | Date | Data de criação do registro |
| updatedAt | Date | Data da última atualização do registro |

### 4. Coleção: Racas

Esta coleção armazena informações sobre as diferentes raças de pets, incluindo características e compatibilidades.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| _id | ObjectId | Identificador único da raça |
| nome | String | Nome da raça |
| especie | Enum | Espécie: 'CACHORRO', 'GATO', etc. |
| porteComum | Enum | Porte comum da raça: 'PEQUENO', 'MEDIO', 'GRANDE' |
| caracteristicas | Object | Características específicas da raça |
| createdAt | Date | Data de criação do registro |
| updatedAt | Date | Data da última atualização do registro |

### 5. Coleção: Interacoes

Esta coleção registra todas as interações dos usuários com os pets na plataforma, incluindo curtidas, descurtidas, matches e o status do processo de adoção.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| _id | ObjectId | Identificador único da interação |
| usuarioId | ObjectId | Referência ao usuário que realizou a interação |
| petId | ObjectId | Referência ao pet que recebeu a interação |
| tipo | Enum | Tipo de interação: 'CURTIDA', 'DESCURTIDA', 'MATCH' |
| plataforma | Enum | Plataforma onde ocorreu a interação: 'WEB', 'ANDROID', 'IOS' |
| statusMatch | Enum | Status do match: 'PENDENTE', 'APROVADO', 'REJEITADO', 'CONCLUIDO' |
| motivoInteresse | Array | Motivos de interesse no pet (para curtidas) |
| motivoDesinteresse | Array | Motivos de desinteresse no pet (para descurtidas) |
| metadata | Object | Metadados adicionais sobre a interação |
| createdAt | Date | Data de criação do registro |
| updatedAt | Date | Data da última atualização do registro |

## Índices e Otimização de Performance

Para garantir a performance adequada do banco de dados, os seguintes índices são implementados:

| Coleção | Campo(s) | Tipo | Propósito |
|---------|----------|------|-----------|
| Usuarios | email | Único | Garantir unicidade de emails e acelerar buscas por email |
| Usuarios | coordenadas | 2dsphere | Permitir consultas geoespaciais (busca por proximidade) |
| Pets | coordenadas | 2dsphere | Permitir consultas geoespaciais (busca por proximidade) |
| Pets | especie, porte, idade | Composto | Otimizar filtros comuns de busca |
| Pets | status.disponivel | Simples | Filtrar rapidamente pets disponíveis |
| Interacoes | usuarioId | Simples | Acelerar consultas de interações por usuário |
| Interacoes | petId | Simples | Acelerar consultas de interações por pet |
| Interacoes | usuarioId, petId | Composto | Verificar interações específicas usuário-pet |

## Relacionamentos entre Coleções

O MongoDB é um banco de dados NoSQL, portanto não possui relacionamentos formais como em bancos SQL. No entanto, as coleções do AdoteMe App possuem referências entre si através de campos que armazenam ObjectIds de documentos em outras coleções:

| Relacionamento | Implementação | Descrição |
|----------------|---------------|-----------|
| Pet → Raça | Pet.racaId → Raca._id | Cada pet pertence a uma raça específica |
| Pet → Personalidade | Pet.personalidadeId → Personalidade._id | Cada pet possui uma personalidade |
| Interação → Usuário | Interacao.usuarioId → Usuario._id | Cada interação é realizada por um usuário |
| Interação → Pet | Interacao.petId → Pet._id | Cada interação é direcionada a um pet |

## Exemplos de Consultas Comuns

Abaixo estão exemplos de consultas comuns que podem ser realizadas no banco de dados do AdoteMe App:

### 1. Encontrar pets próximos a uma localização

Esta consulta utiliza o índice geoespacial para encontrar pets dentro de um raio específico de uma localização.

```javascript
Pet.find({
  coordenadas: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-46.6333, -23.5505]  // Coordenadas de São Paulo
      },
      $maxDistance: 10000  // 10km em metros
    }
  },
  "status.disponivel": true,
  especie: "CACHORRO"
})
```

### 2. Encontrar matches pendentes para um usuário

Esta consulta busca todas as interações do tipo MATCH que estão pendentes para um usuário específico.

```javascript
Interacao.find({
  usuarioId: ObjectId("60d21b4667d0d8992e610c85"),
  tipo: "MATCH",
  statusMatch: "PENDENTE"
}).populate('petId')
```

### 3. Encontrar pets compatíveis com apartamentos

Esta consulta busca pets cujas personalidades são altamente compatíveis com vida em apartamento.

```javascript
const personalidades = await Personalidade.find({
  compatibilidadeApartamento: "ALTA"
}).select('_id');

const personalidadeIds = personalidades.map(p => p._id);

Pet.find({
  personalidadeId: { $in: personalidadeIds },
  "status.disponivel": true
})
```

### 4. Estatísticas de interações por pet

Esta consulta agrega as interações para calcular estatísticas por pet.

```javascript
Interacao.aggregate([
  { $group: {
      _id: "$petId",
      totalInteracoes: { $sum: 1 },
      curtidas: { $sum: { $cond: [{ $eq: ["$tipo", "CURTIDA"] }, 1, 0] } },
      descurtidas: { $sum: { $cond: [{ $eq: ["$tipo", "DESCURTIDA"] }, 1, 0] } },
      matches: { $sum: { $cond: [{ $eq: ["$tipo", "MATCH"] }, 1, 0] } }
    }
  },
  { $lookup: {
      from: "pets",
      localField: "_id",
      foreignField: "_id",
      as: "petInfo"
    }
  },
  { $unwind: "$petInfo" },
  { $project: {
      _id: 1,
      nomePet: "$petInfo.nome",
      totalInteracoes: 1,
      curtidas: 1,
      descurtidas: 1,
      matches: 1,
      taxaAprovacao: { $divide: ["$curtidas", { $add: ["$curtidas", "$descurtidas"] }] }
    }
  }
])
```

## Conclusão

O banco de dados do AdoteMe App foi projetado para suportar eficientemente todas as funcionalidades necessárias para uma plataforma de adoção de pets. A estrutura NoSQL do MongoDB oferece flexibilidade para armazenar dados complexos e heterogêneos, enquanto os índices estratégicos garantem performance adequada para as consultas mais comuns. Os relacionamentos entre coleções são mantidos através de referências, permitindo consultas eficientes e manutenção da integridade dos dados.

Esta documentação serve como referência para desenvolvedores que trabalham no projeto, facilitando a compreensão da estrutura do banco de dados e como ele suporta as funcionalidades da aplicação AdoteMe.
