# Ydin$ - Controle Financeiro Pessoal

<div align="center">
  <img src="icon.png" alt="Ydin$ Logo" width="120" height="120">
  <h3>Gerencie suas finanças de forma simples e eficiente</h3>
</div>

## 📋 Descrição

O **Ydin$** é uma aplicação web progressiva (PWA) desenvolvida para controle financeiro pessoal. Com uma interface intuitiva e responsiva, permite gerenciar receitas, despesas, investimentos e dívidas de forma organizada e eficiente.

## ✨ Funcionalidades

### 💰 **Dashboard Inteligente**
- Visão geral do saldo total em contas
- Resumo de receitas e despesas
- Gráficos de despesas por categoria
- Histórico das últimas transações
- Ações rápidas para adicionar movimentações

### 📊 **Gestão de Receitas**
- Cadastro de receitas com data e descrição
- Formatação automática de valores monetários
- Filtros por período (mês/ano)
- Edição e exclusão de registros

### 💸 **Controle de Despesas**
- Registro de despesas com categorização
- Suporte a pagamentos à vista e parcelados
- Separação entre débito e crédito
- Controle de vencimentos e parcelas

### 📈 **Investimentos**
- Acompanhamento de aplicações financeiras
- Registro de valores e datas de investimento
- Cálculo de total investido

### 🏦 **Gestão de Dívidas**
- Controle de empréstimos e financiamentos
- Cálculo de taxas de juros
- Acompanhamento de prazos e vencimentos

### ⚙️ **Controles Personalizados**
- Criação de tipos de controle customizados
- Valores padrão para cada tipo
- Histórico de pagamentos
- Marcação de status (pago/pendente)

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Vue.js 3 (CDN)
- **UI Framework**: Bootstrap 5.3.0
- **Ícones**: Bootstrap Icons 1.11.3
- **Gráficos**: Chart.js
- **PWA**: Service Worker + Manifest
- **Armazenamento**: LocalStorage

## 🚀 Como Usar

### Instalação Local

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/ydin.git
   cd ydin
   ```

2. **Abra o projeto**
   - Abra o arquivo `index.html` em seu navegador
   - Ou use um servidor local:
   ```bash
   # Com Python
   python -m http.server 8000
   
   # Com Node.js (npx)
   npx serve .
   
   # Com PHP
   php -S localhost:8000
   ```

3. **Acesse a aplicação**
   - Abra `http://localhost:8000` no navegador

### Instalação como PWA

1. Acesse a aplicação no navegador
2. Clique no ícone de instalação na barra de endereços
3. Ou use o menu do navegador: "Adicionar à tela inicial"

## 📱 Funcionalidades PWA

- **Instalação offline**: Funciona sem conexão com internet
- **Atalhos na tela inicial**: Acesso rápido às principais funções
- **Interface responsiva**: Adaptada para desktop, tablet e mobile
- **Sincronização local**: Dados salvos no dispositivo

## 🎯 Principais Recursos

### Interface Responsiva
- Design adaptativo para diferentes tamanhos de tela
- Navegação otimizada para dispositivos móveis
- Sidebar colapsível em telas menores

### Formatação Automática
- Valores monetários formatados automaticamente
- Máscaras de entrada para melhor usabilidade
- Validação de dados em tempo real

### Filtros e Relatórios
- Filtros por período (mês/ano)
- Visualização de despesas por categoria
- Histórico de transações
- Resumos financeiros

### Armazenamento Local
- Dados salvos no navegador (LocalStorage)
- Backup automático das informações
- Sem necessidade de cadastro ou login

## 📁 Estrutura do Projeto

```
ydin/
├── index.html          # Página principal
├── main.js            # Lógica da aplicação (Vue.js)
├── style.css          # Estilos personalizados
├── manifest.json      # Configuração PWA
├── service-worker.js  # Service Worker para cache
├── icon.png           # Ícone da aplicação
├── favicon.ico        # Favicon
├── vue.global.js      # Vue.js (CDN)
└── README.md          # Este arquivo
```

## 🔧 Configuração

### Personalização de Cores
Edite o arquivo `style.css` para personalizar as cores da aplicação:

```css
:root {
  --primary-color: #007BA7;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
}
```

### Adicionando Novas Funcionalidades
O código está estruturado de forma modular, facilitando a adição de novas funcionalidades:

1. Adicione novos componentes no `main.js`
2. Crie os templates HTML correspondentes
3. Implemente a lógica de negócio
4. Atualize o sistema de navegação

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Gui** - Desenvolvedor do projeto Ydin$

- GitHub: [@seu-usuario](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- Bootstrap pela interface responsiva
- Vue.js pelo framework reativo
- Chart.js pelos gráficos interativos
- Bootstrap Icons pelos ícones

---

<div align="center">
  <p>⭐ Se este projeto te ajudou, considere dar uma estrela!</p>
  <p>💡 Sugestões e feedback são sempre bem-vindos!</p>
</div>
